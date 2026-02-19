from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from database import reports_collection, documents_collection
from models.schemas import ReportGenerateRequest, ReportResponse
from services.openai_service import generate_report
from utils.auth import get_current_user

router = APIRouter()


@router.post("/generate", response_model=ReportResponse)
async def generate(request: ReportGenerateRequest, user=Depends(get_current_user)):
    doc = await documents_collection.find_one({"_id": ObjectId(request.document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result = await generate_report(request.document_id, request.report_type.value)
    return result


@router.get("/{document_id}", response_model=List[ReportResponse])
async def get_reports(document_id: str, user=Depends(get_current_user)):
    reports = []
    cursor = reports_collection.find({"document_id": document_id}).sort("created_at", -1)
    async for r in cursor:
        reports.append(
            ReportResponse(
                id=str(r["_id"]),
                document_id=r["document_id"],
                report_type=r["report_type"],
                generated_text=r["generated_text"],
                created_at=r["created_at"],
            )
        )
    return reports
