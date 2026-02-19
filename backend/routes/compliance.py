import logging
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database import compliance_collection, documents_collection
from models.schemas import ComplianceResult
from engines.compliance_engine import run_compliance_analysis
from utils.auth import get_current_user

logger = logging.getLogger("ifrs.compliance")
router = APIRouter()


@router.post("/run/{document_id}", response_model=ComplianceResult)
async def run_analysis(document_id: str, user=Depends(get_current_user)):
    doc = await documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["status"] != "completed":
        raise HTTPException(status_code=400, detail="Document still processing")

    try:
        result = await run_compliance_analysis(document_id)
        logger.info(f"Compliance analysis completed for document {document_id}")
        return result
    except Exception as e:
        logger.error(f"Compliance analysis failed for {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


@router.get("/{document_id}", response_model=ComplianceResult)
async def get_analysis(document_id: str, user=Depends(get_current_user)):
    analysis = await compliance_collection.find_one({"document_id": document_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return ComplianceResult(
        id=str(analysis["_id"]),
        document_id=analysis["document_id"],
        s1_score=analysis["s1_score"],
        s2_score=analysis["s2_score"],
        governance_score=analysis["governance_score"],
        strategy_score=analysis["strategy_score"],
        risk_score=analysis["risk_score"],
        metrics_score=analysis["metrics_score"],
        gap_summary=analysis["gap_summary"],
        created_at=analysis["created_at"],
    )
