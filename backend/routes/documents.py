import os
import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, Query
from datetime import datetime, timezone
from bson import ObjectId
from typing import List
from database import documents_collection
from models.schemas import DocumentResponse
from utils.auth import get_current_user
from services.file_service import process_document
from services.vector_store import get_vector_store
from config import get_settings

logger = logging.getLogger("ifrs.documents")
settings = get_settings()
router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read and validate file size
    content = await file.read()
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.max_file_size_mb}MB limit",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    # Save file with sanitized name
    os.makedirs(settings.upload_dir, exist_ok=True)
    safe_name = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    file_path = os.path.join(settings.upload_dir, f"{ObjectId()}_{safe_name}")
    with open(file_path, "wb") as f:
        f.write(content)

    doc = {
        "company_id": user["company_id"],
        "uploaded_by": str(user["_id"]),
        "file_name": file.filename,
        "file_url": file_path,
        "file_size": len(content),
        "extracted_text": "",
        "status": "processing",
        "upload_date": datetime.now(timezone.utc),
    }
    result = await documents_collection.insert_one(doc)
    doc_id = str(result.inserted_id)

    background_tasks.add_task(process_document, doc_id, file_path)
    logger.info(f"Document {doc_id} uploaded by {user['email']}, processing started")

    return DocumentResponse(
        id=doc_id,
        company_id=doc["company_id"],
        uploaded_by=doc["uploaded_by"],
        file_name=doc["file_name"],
        file_url=doc["file_url"],
        status=doc["status"],
        upload_date=doc["upload_date"],
    )


@router.get("/company/{company_id}", response_model=List[DocumentResponse])
async def get_company_documents(
    company_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user=Depends(get_current_user),
):
    docs = []
    cursor = (
        documents_collection.find({"company_id": company_id})
        .sort("upload_date", -1)
        .skip(skip)
        .limit(limit)
    )
    async for doc in cursor:
        docs.append(
            DocumentResponse(
                id=str(doc["_id"]),
                company_id=doc["company_id"],
                uploaded_by=doc["uploaded_by"],
                file_name=doc["file_name"],
                file_url=doc["file_url"],
                status=doc["status"],
                upload_date=doc["upload_date"],
            )
        )
    return docs


@router.delete("/{document_id}")
async def delete_document(document_id: str, user=Depends(get_current_user)):
    result = await documents_collection.delete_one({"_id": ObjectId(document_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    # Clean up FAISS index for this document
    store = get_vector_store()
    store.delete_document(document_id)

    logger.info(f"Document {document_id} deleted by {user['email']}")
    return {"message": "Document deleted"}
