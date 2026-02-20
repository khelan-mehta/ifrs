import logging
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database import document_analysis_collection, documents_collection
from models.schemas import DocumentAnalysisResult
from engines.document_analysis_engine import run_document_analysis
from utils.auth import get_current_user

logger = logging.getLogger("ifrs.document_analysis")
router = APIRouter()


@router.post("/run/{document_id}", response_model=DocumentAnalysisResult)
async def run_analysis(document_id: str, user=Depends(get_current_user)):
    """Run comprehensive multi-level document analysis with AI insights."""
    doc = await documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["status"] != "completed":
        raise HTTPException(status_code=400, detail="Document still processing")

    try:
        result = await run_document_analysis(document_id)
        logger.info(f"Document analysis completed for {document_id}")
        return result
    except Exception as e:
        logger.error(f"Document analysis failed for {document_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Document analysis failed. Please try again.",
        )


@router.get("/{document_id}", response_model=DocumentAnalysisResult)
async def get_analysis(document_id: str, user=Depends(get_current_user)):
    """Retrieve cached document analysis results."""
    analysis = await document_analysis_collection.find_one(
        {"document_id": document_id}
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Document analysis not found")

    return DocumentAnalysisResult(
        id=str(analysis["_id"]),
        document_id=analysis["document_id"],
        analysis_version=analysis.get("analysis_version", "2.0"),
        scores=analysis["scores"],
        overview=analysis["overview"],
        governance=analysis["governance"],
        strategy=analysis["strategy"],
        risk_management=analysis["risk_management"],
        metrics_targets=analysis["metrics_targets"],
        overall_assessment=analysis["overall_assessment"],
        created_at=analysis["created_at"],
    )
