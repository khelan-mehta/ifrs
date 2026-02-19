from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database import climate_collection, documents_collection
from models.schemas import ClimateRiskResult
from engines.risk_engine import run_climate_analysis
from utils.auth import get_current_user

router = APIRouter()


@router.post("/analyze/{document_id}", response_model=ClimateRiskResult)
async def analyze_climate(document_id: str, user=Depends(get_current_user)):
    doc = await documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["status"] != "completed":
        raise HTTPException(status_code=400, detail="Document still processing")

    result = await run_climate_analysis(document_id)
    return result


@router.get("/{document_id}", response_model=ClimateRiskResult)
async def get_climate(document_id: str, user=Depends(get_current_user)):
    analysis = await climate_collection.find_one({"document_id": document_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Climate analysis not found")

    return ClimateRiskResult(
        id=str(analysis["_id"]),
        document_id=analysis["document_id"],
        physical_risk_score=analysis["physical_risk_score"],
        transition_risk_score=analysis["transition_risk_score"],
        scenario_alignment_score=analysis["scenario_alignment_score"],
        emissions_scope1=analysis.get("emissions_scope1"),
        emissions_scope2=analysis.get("emissions_scope2"),
        emissions_scope3=analysis.get("emissions_scope3"),
        risk_heatmap_data=analysis["risk_heatmap_data"],
        created_at=analysis["created_at"],
    )


@router.get("/heatmap/{document_id}")
async def get_heatmap(document_id: str, user=Depends(get_current_user)):
    analysis = await climate_collection.find_one({"document_id": document_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Climate analysis not found")

    return {
        "physical": analysis["risk_heatmap_data"].get("physical", {}),
        "transition": analysis["risk_heatmap_data"].get("transition", {}),
        "severity_matrix": analysis["risk_heatmap_data"].get("severity_matrix", []),
    }
