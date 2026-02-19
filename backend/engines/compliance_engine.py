import json
from datetime import datetime, timezone
from database import compliance_collection
from services.openai_service import retrieve_relevant_chunks, call_openai, S1_SYSTEM_PROMPT, S2_SYSTEM_PROMPT


async def analyze_s1(document_id: str) -> dict:
    """Run IFRS S1 compliance analysis."""
    chunks = await retrieve_relevant_chunks(
        document_id, "governance strategy risk management metrics targets sustainability", top_k=8
    )
    context = "\n\n".join(chunks)
    result = await call_openai(S1_SYSTEM_PROMPT, context)
    return json.loads(result)


async def analyze_s2(document_id: str) -> dict:
    """Run IFRS S2 climate-related disclosure analysis."""
    chunks = await retrieve_relevant_chunks(
        document_id, "climate risk physical transition emissions scenario carbon", top_k=8
    )
    context = "\n\n".join(chunks)
    result = await call_openai(S2_SYSTEM_PROMPT, context)
    return json.loads(result)


def calculate_scores(s1_result: dict, s2_result: dict) -> dict:
    """Calculate weighted compliance scores."""
    s1_score = s1_result.get("s1_overall_score", 0)
    s2_score = (
        s2_result.get("physical_risk_score", 0)
        + s2_result.get("transition_risk_score", 0)
        + s2_result.get("scenario_alignment_score", 0)
    ) / 3

    return {
        "s1_score": round(s1_score, 2),
        "s2_score": round(s2_score, 2),
        "governance_score": s1_result.get("governance_score", 0),
        "strategy_score": s1_result.get("strategy_score", 0),
        "risk_score": s1_result.get("risk_management_score", 0),
        "metrics_score": s1_result.get("metrics_targets_score", 0),
    }


def generate_gap_summary(s1_result: dict, s2_result: dict) -> str:
    """Generate a text summary of compliance gaps."""
    gaps = s1_result.get("gaps", [])
    recommendations = s1_result.get("recommendations", [])

    summary_parts = []
    if gaps:
        summary_parts.append("Missing disclosures: " + "; ".join(gaps))
    if recommendations:
        summary_parts.append("Recommendations: " + "; ".join(recommendations))

    return " | ".join(summary_parts) if summary_parts else "No significant gaps identified."


async def run_compliance_analysis(document_id: str) -> dict:
    """Full compliance analysis pipeline."""
    s1 = await analyze_s1(document_id)
    s2 = await analyze_s2(document_id)

    scores = calculate_scores(s1, s2)
    gap_summary = generate_gap_summary(s1, s2)

    doc = {
        "document_id": document_id,
        **scores,
        "gap_summary": gap_summary,
        "created_at": datetime.now(timezone.utc),
    }

    # Upsert - replace if exists
    result = await compliance_collection.find_one_and_update(
        {"document_id": document_id},
        {"$set": doc},
        upsert=True,
        return_document=True,
    )

    return {
        "id": str(result["_id"]),
        **doc,
    }
