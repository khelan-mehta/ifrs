from fastapi import APIRouter, Depends, HTTPException
from database import (
    companies_collection,
    documents_collection,
    compliance_collection,
    climate_collection,
    reports_collection,
)
from bson import ObjectId
from models.schemas import DashboardSummary
from utils.auth import get_current_user

router = APIRouter()


@router.get("/summary/{company_id}", response_model=DashboardSummary)
async def get_dashboard_summary(company_id: str, user=Depends(get_current_user)):
    company = await companies_collection.find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Count documents
    doc_count = await documents_collection.count_documents({"company_id": company_id})

    # Aggregate compliance scores
    compliance_scores = []
    doc_cursor = documents_collection.find({"company_id": company_id})
    async for doc in doc_cursor:
        doc_id = str(doc["_id"])
        analysis = await compliance_collection.find_one({"document_id": doc_id})
        if analysis:
            avg = (
                analysis["s1_score"] + analysis["s2_score"]
            ) / 2
            compliance_scores.append(avg)

    overall_compliance = sum(compliance_scores) / len(compliance_scores) if compliance_scores else 0.0

    # Aggregate climate risk
    climate_scores = []
    doc_cursor = documents_collection.find({"company_id": company_id})
    async for doc in doc_cursor:
        doc_id = str(doc["_id"])
        risk = await climate_collection.find_one({"document_id": doc_id})
        if risk:
            avg = (risk["physical_risk_score"] + risk["transition_risk_score"]) / 2
            climate_scores.append(avg)

    climate_risk = sum(climate_scores) / len(climate_scores) if climate_scores else 0.0

    # Get latest emissions
    emissions = {"scope1": 0, "scope2": 0, "scope3": 0}
    latest_doc = await documents_collection.find_one(
        {"company_id": company_id}, sort=[("upload_date", -1)]
    )
    if latest_doc:
        latest_risk = await climate_collection.find_one({"document_id": str(latest_doc["_id"])})
        if latest_risk:
            emissions = {
                "scope1": latest_risk.get("emissions_scope1", 0) or 0,
                "scope2": latest_risk.get("emissions_scope2", 0) or 0,
                "scope3": latest_risk.get("emissions_scope3", 0) or 0,
            }

    # Recent reports
    recent = []
    r_cursor = reports_collection.find().sort("created_at", -1).limit(5)
    async for r in r_cursor:
        recent.append({
            "id": str(r["_id"]),
            "report_type": r["report_type"],
            "created_at": r["created_at"].isoformat(),
        })

    # Heatmap from latest
    heatmap = {}
    if latest_doc:
        risk_data = await climate_collection.find_one({"document_id": str(latest_doc["_id"])})
        if risk_data:
            heatmap = risk_data.get("risk_heatmap_data", {})

    return DashboardSummary(
        company_name=company["name"],
        overall_compliance_score=round(overall_compliance, 2),
        climate_risk_score=round(climate_risk, 2),
        emissions_summary=emissions,
        risk_heatmap=heatmap,
        recent_reports=recent,
        document_count=doc_count,
    )
