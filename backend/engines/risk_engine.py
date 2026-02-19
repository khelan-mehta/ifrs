import json
from datetime import datetime, timezone
from database import climate_collection
from services.openai_service import retrieve_relevant_chunks, call_openai, S2_SYSTEM_PROMPT


async def identify_physical_risks(document_id: str) -> list:
    """Extract physical climate risks from document."""
    chunks = await retrieve_relevant_chunks(
        document_id, "physical risk drought flood wildfire extreme weather sea level", top_k=5
    )
    context = "\n\n".join(chunks)
    prompt = """Identify physical climate risks mentioned. Return JSON: {"physical_risks": ["risk1", "risk2"]}"""
    result = await call_openai(prompt, context)
    return json.loads(result).get("physical_risks", [])


async def identify_transition_risks(document_id: str) -> list:
    """Extract transition risks from document."""
    chunks = await retrieve_relevant_chunks(
        document_id, "transition risk policy regulation technology market carbon pricing", top_k=5
    )
    context = "\n\n".join(chunks)
    prompt = """Identify transition risks mentioned. Return JSON: {"transition_risks": ["risk1", "risk2"]}"""
    result = await call_openai(prompt, context)
    return json.loads(result).get("transition_risks", [])


async def extract_emissions_data(document_id: str) -> dict:
    """Extract Scope 1/2/3 emissions data."""
    chunks = await retrieve_relevant_chunks(
        document_id, "emissions scope 1 scope 2 scope 3 greenhouse gas GHG carbon", top_k=5
    )
    context = "\n\n".join(chunks)
    prompt = """Extract emissions data. Return JSON:
    {"scope1": <float or null>, "scope2": <float or null>, "scope3": <float or null>, "unit": "tCO2e"}"""
    result = await call_openai(prompt, context)
    return json.loads(result)


async def calculate_scenario_alignment(document_id: str) -> float:
    """Assess scenario alignment score."""
    chunks = await retrieve_relevant_chunks(
        document_id, "scenario analysis Paris alignment 1.5 degree 2 degree net zero pathway", top_k=5
    )
    context = "\n\n".join(chunks)
    prompt = """Score scenario alignment from 0-100. Return JSON: {"scenario_alignment_score": <int>}"""
    result = await call_openai(prompt, context)
    return json.loads(result).get("scenario_alignment_score", 0)


async def generate_heatmap_data(document_id: str) -> dict:
    """Generate risk heatmap data structure."""
    chunks = await retrieve_relevant_chunks(
        document_id, "climate risk assessment severity likelihood impact matrix", top_k=8
    )
    context = "\n\n".join(chunks)
    result = await call_openai(S2_SYSTEM_PROMPT, context)
    parsed = json.loads(result)
    return parsed.get("risk_heatmap_data", {
        "physical": {},
        "transition": {},
        "severity_matrix": [],
    })


async def run_climate_analysis(document_id: str) -> dict:
    """Full climate risk analysis pipeline."""
    chunks = await retrieve_relevant_chunks(
        document_id, "climate risk emissions physical transition scenario", top_k=10
    )
    context = "\n\n".join(chunks)

    # Run full S2 analysis
    result = await call_openai(S2_SYSTEM_PROMPT, context)
    parsed = json.loads(result)

    doc = {
        "document_id": document_id,
        "physical_risk_score": parsed.get("physical_risk_score", 0),
        "transition_risk_score": parsed.get("transition_risk_score", 0),
        "scenario_alignment_score": parsed.get("scenario_alignment_score", 0),
        "emissions_scope1": parsed.get("emissions_scope1"),
        "emissions_scope2": parsed.get("emissions_scope2"),
        "emissions_scope3": parsed.get("emissions_scope3"),
        "risk_heatmap_data": parsed.get("risk_heatmap_data", {}),
        "created_at": datetime.now(timezone.utc),
    }

    result = await climate_collection.find_one_and_update(
        {"document_id": document_id},
        {"$set": doc},
        upsert=True,
        return_document=True,
    )

    return {
        "id": str(result["_id"]),
        **doc,
    }
