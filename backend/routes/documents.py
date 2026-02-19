from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from datetime import datetime, timezone
from bson import ObjectId
from typing import List
from database import documents_collection
from models.schemas import DocumentResponse
from utils.auth import get_current_user
from services.file_service import process_document
from config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Save file
    import os
    os.makedirs(settings.upload_dir, exist_ok=True)
    file_path = os.path.join(settings.upload_dir, f"{ObjectId()}_{file.filename}")
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create document record
    doc = {
        "company_id": user["company_id"],
        "uploaded_by": str(user["_id"]),
        "file_name": file.filename,
        "file_url": file_path,
        "extracted_text": "",
        "status": "processing",
        "upload_date": datetime.now(timezone.utc),
    }
    result = await documents_collection.insert_one(doc)
    doc_id = str(result.inserted_id)

    # Trigger background processing
    background_tasks.add_task(process_document, doc_id, file_path)

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
async def get_company_documents(company_id: str, user=Depends(get_current_user)):
    docs = []
    cursor = documents_collection.find({"company_id": company_id}).sort("upload_date", -1)
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
    return {"message": "Document deleted"}
