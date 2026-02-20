"""
Comprehensive multi-level document analysis engine.
Produces detailed AI-powered analysis of uploaded sustainability documents
covering all IFRS S1 and S2 metrics with sub-section breakdowns.
"""

import json
import logging
import asyncio
from datetime import datetime, timezone
from database import document_analysis_collection
from services.openai_service import retrieve_relevant_chunks, call_openai

logger = logging.getLogger("ifrs.document_analysis")


# --- Multi-Level Analysis Prompts ---

DOCUMENT_OVERVIEW_PROMPT = """You are an expert sustainability report analyst.
Analyze the document content and provide a comprehensive overview.
Return JSON only:
{
  "document_type": "<e.g. Annual Sustainability Report, ESG Report, Climate Disclosure, etc.>",
  "reporting_period": "<e.g. FY2024, Calendar Year 2023, etc. or 'Not specified'>",
  "reporting_frameworks": ["<frameworks referenced, e.g. IFRS S1, IFRS S2, GRI, TCFD, etc.>"],
  "company_name": "<company name if identifiable, else 'Not identified'>",
  "industry_sector": "<industry sector if identifiable>",
  "document_summary": "<3-5 sentence executive summary of what the document covers>",
  "key_highlights": ["<5-8 key findings/highlights from the document>"],
  "document_completeness_score": <0-100 score for how complete the sustainability disclosure is>,
  "ifrs_readiness_score": <0-100 score for how IFRS S1/S2 ready the document is>,
  "ai_assessment": "<2-3 paragraph detailed AI assessment of the document quality, depth, and IFRS alignment>"
}"""

GOVERNANCE_DETAILED_PROMPT = """You are an IFRS S1 governance specialist.
Analyze the document for governance-related sustainability disclosures.
Return JSON only:
{
  "governance_score": <0-100>,
  "board_oversight": {
    "score": <0-100>,
    "has_climate_oversight": <true/false/null>,
    "oversight_description": "<description of board oversight arrangements>",
    "findings": ["<specific findings>"]
  },
  "review_frequency": {
    "score": <0-100>,
    "frequency": "<e.g. Quarterly, Annual, Not disclosed>",
    "meetings_per_year": <integer or null>,
    "findings": ["<specific findings>"]
  },
  "expertise": {
    "score": <0-100>,
    "esg_expertise_percent": <float or null>,
    "has_dedicated_committee": <true/false/null>,
    "committee_name": "<name if applicable>",
    "findings": ["<specific findings>"]
  },
  "compensation_linkage": {
    "score": <0-100>,
    "exec_comp_linked_percent": <float or null>,
    "linkage_description": "<how ESG is linked to compensation>",
    "findings": ["<specific findings>"]
  },
  "reporting_structure": {
    "score": <0-100>,
    "reporting_level": "<Board / Committee / Management / Not disclosed>",
    "description": "<description of sustainability reporting structure>",
    "findings": ["<specific findings>"]
  },
  "gaps": ["<missing governance disclosures per IFRS S1>"],
  "recommendations": ["<specific recommendations to improve governance disclosure>"],
  "ai_analysis": "<2-3 paragraph detailed AI analysis of governance practices and IFRS S1 compliance>"
}"""

STRATEGY_DETAILED_PROMPT = """You are an IFRS S1 strategy analyst.
Analyze the document for strategy-related sustainability disclosures.
Return JSON only:
{
  "strategy_score": <0-100>,
  "financial_materiality": {
    "score": <0-100>,
    "revenue_at_risk_percent": <float or null>,
    "capex_sustainability_percent": <float or null>,
    "opex_climate_programs": <float or null>,
    "sustainable_revenue_percent": <float or null>,
    "findings": ["<specific findings>"],
    "ai_analysis": "<analysis of financial materiality assessment>"
  },
  "climate_scenario_analysis": {
    "score": <0-100>,
    "conducted": <true/false/null>,
    "scenarios_tested": ["<e.g. 1.5C, 2C, 3C+>"],
    "models_used": ["<e.g. NGFS, IEA NZE, etc.>"],
    "temperature_alignment": "<e.g. 1.5C aligned, 2C aligned, Not aligned>",
    "projected_revenue_impact": <float or null>,
    "projected_asset_impact": <float or null>,
    "findings": ["<specific findings>"],
    "ai_analysis": "<analysis of scenario analysis quality>"
  },
  "business_model_resilience": {
    "score": <0-100>,
    "transition_plan_exists": <true/false/null>,
    "adaptation_measures": ["<identified adaptation measures>"],
    "findings": ["<specific findings>"]
  },
  "opportunities": {
    "identified_opportunities": ["<climate-related business opportunities>"],
    "quantified": <true/false>,
    "findings": ["<specific findings>"]
  },
  "gaps": ["<missing strategy disclosures>"],
  "recommendations": ["<specific recommendations>"],
  "ai_analysis": "<2-3 paragraph detailed AI analysis of strategy disclosures>"
}"""

RISK_MANAGEMENT_DETAILED_PROMPT = """You are an IFRS S1 risk management specialist.
Analyze the document for risk management disclosures.
Return JSON only:
{
  "risk_management_score": <0-100>,
  "risk_identification": {
    "score": <0-100>,
    "climate_risks_identified": <integer>,
    "risk_categories": ["<categories of risks identified>"],
    "process_description": "<how risks are identified>",
    "findings": ["<specific findings>"]
  },
  "risk_assessment": {
    "score": <0-100>,
    "assessment_frequency": "<Quarterly / Semi-annual / Annual / Not disclosed>",
    "prioritization_method": "<Qualitative / Quantitative / Both / Not disclosed>",
    "financial_impact_quantified": <true/false>,
    "top_risk_financial_impact": <float or null>,
    "findings": ["<specific findings>"]
  },
  "erm_integration": {
    "score": <0-100>,
    "integrated_into_erm": <true/false/null>,
    "integration_description": "<how sustainability risks are integrated into ERM>",
    "findings": ["<specific findings>"]
  },
  "risk_mitigation": {
    "score": <0-100>,
    "mitigation_strategies": ["<identified mitigation strategies>"],
    "monitoring_process": "<description of risk monitoring>",
    "findings": ["<specific findings>"]
  },
  "physical_risk_detail": {
    "flood_exposure": "<description or null>",
    "drought_exposure": "<description or null>",
    "wildfire_exposure": "<description or null>",
    "heat_stress_exposure": "<description or null>",
    "sea_level_exposure": "<description or null>",
    "estimated_physical_risk_loss": <float or null>,
    "insurance_impact": "<description or null>",
    "findings": ["<specific findings>"]
  },
  "transition_risk_detail": {
    "regulatory_exposure": "<description or null>",
    "carbon_pricing_exposure": "<description or null>",
    "technology_risk": "<description or null>",
    "market_risk": "<description or null>",
    "reputation_risk": "<description or null>",
    "stranded_asset_value": <float or null>,
    "revenue_at_risk_percent": <float or null>,
    "findings": ["<specific findings>"]
  },
  "gaps": ["<missing risk management disclosures>"],
  "recommendations": ["<specific recommendations>"],
  "ai_analysis": "<2-3 paragraph detailed AI analysis of risk management practices>"
}"""

METRICS_TARGETS_DETAILED_PROMPT = """You are an IFRS S1/S2 metrics and targets specialist.
Analyze the document for metrics and targets disclosures.
Return JSON only:
{
  "metrics_targets_score": <0-100>,
  "ghg_emissions": {
    "score": <0-100>,
    "scope1": <float or null>,
    "scope2": <float or null>,
    "scope3": <float or null>,
    "total_emissions": <float or null>,
    "emissions_intensity": <float or null>,
    "intensity_metric": "<e.g. tCO2e/revenue, tCO2e/employee>",
    "verification_status": "<Verified / Limited Assurance / None / Not disclosed>",
    "methodology": "<GHG Protocol / ISO 14064 / Not disclosed>",
    "base_year": <integer or null>,
    "base_year_emissions": <float or null>,
    "year_over_year_change_percent": <float or null>,
    "findings": ["<specific findings>"],
    "ai_analysis": "<analysis of emissions reporting quality>"
  },
  "energy": {
    "score": <0-100>,
    "total_energy_mwh": <float or null>,
    "renewable_energy_mwh": <float or null>,
    "renewable_energy_percent": <float or null>,
    "energy_intensity": <float or null>,
    "fuel_consumption": <float or null>,
    "findings": ["<specific findings>"]
  },
  "targets": {
    "score": <0-100>,
    "net_zero_target_year": <integer or null>,
    "interim_target_year": <integer or null>,
    "reduction_target_percent": <float or null>,
    "reduction_achieved_percent": <float or null>,
    "scope_coverage": "<which scopes are covered by targets>",
    "sbti_validated": <true/false/null>,
    "sbti_status": "<Committed / Targets Set / Validated / Not applicable>",
    "offset_usage_disclosed": <true/false>,
    "internal_carbon_price": <float or null>,
    "findings": ["<specific findings>"],
    "ai_analysis": "<analysis of targets ambition and progress>"
  },
  "water_metrics": {
    "disclosed": <true/false>,
    "total_withdrawal": <float or null>,
    "water_intensity": <float or null>,
    "findings": ["<specific findings>"]
  },
  "waste_metrics": {
    "disclosed": <true/false>,
    "total_waste": <float or null>,
    "recycling_rate": <float or null>,
    "findings": ["<specific findings>"]
  },
  "gaps": ["<missing metrics disclosures>"],
  "recommendations": ["<specific recommendations>"],
  "ai_analysis": "<2-3 paragraph detailed AI analysis of metrics and targets quality>"
}"""

OVERALL_AI_ASSESSMENT_PROMPT = """You are a senior IFRS sustainability compliance advisor.
Based on the complete analysis results provided, generate a comprehensive overall assessment.
Return JSON only:
{
  "executive_summary": "<4-6 sentence executive summary of the document's IFRS compliance status>",
  "overall_compliance_rating": "<Excellent / Good / Fair / Needs Improvement / Non-Compliant>",
  "s1_compliance_status": {
    "rating": "<Excellent / Good / Fair / Needs Improvement / Non-Compliant>",
    "key_strengths": ["<top 3-5 strengths>"],
    "critical_gaps": ["<top 3-5 critical gaps>"],
    "priority_actions": ["<top 3-5 priority actions>"]
  },
  "s2_compliance_status": {
    "rating": "<Excellent / Good / Fair / Needs Improvement / Non-Compliant>",
    "key_strengths": ["<top 3-5 strengths>"],
    "critical_gaps": ["<top 3-5 critical gaps>"],
    "priority_actions": ["<top 3-5 priority actions>"]
  },
  "investor_readiness": {
    "score": <0-100>,
    "assessment": "<2-3 sentence assessment of investor readiness>"
  },
  "regulatory_readiness": {
    "score": <0-100>,
    "assessment": "<2-3 sentence assessment of regulatory readiness>"
  },
  "maturity_level": "<Level 1: Initial / Level 2: Developing / Level 3: Defined / Level 4: Managed / Level 5: Leading>",
  "detailed_narrative": "<5-8 paragraph comprehensive AI narrative covering all aspects of the document analysis, including strengths, weaknesses, opportunities for improvement, comparison to best practices, and specific actionable recommendations>",
  "benchmarking_notes": "<how this report compares to typical industry reporting>",
  "year_over_year_potential": "<what improvements could be expected in next reporting cycle>"
}"""


async def _analyze_section(document_id: str, query: str, prompt: str, top_k: int = 8) -> dict:
    """Run AI analysis on a specific section."""
    chunks = await retrieve_relevant_chunks(document_id, query, top_k=top_k)
    if not chunks:
        logger.warning(f"No chunks found for document {document_id} with query: {query[:50]}")
        return {}
    context = "\n\n".join(chunks)
    result = await call_openai(prompt, context)
    return json.loads(result)


async def run_document_analysis(document_id: str) -> dict:
    """
    Run comprehensive multi-level document analysis.
    Analyzes all IFRS S1 and S2 sections in parallel where possible,
    then generates an overall AI assessment.
    """
    logger.info(f"Starting comprehensive document analysis for {document_id}")

    # Phase 1: Run all section analyses in parallel
    overview_task = _analyze_section(
        document_id,
        "sustainability report overview company profile ESG reporting framework scope",
        DOCUMENT_OVERVIEW_PROMPT,
        top_k=10,
    )
    governance_task = _analyze_section(
        document_id,
        "governance board oversight committee ESG expertise compensation sustainability reporting structure",
        GOVERNANCE_DETAILED_PROMPT,
        top_k=8,
    )
    strategy_task = _analyze_section(
        document_id,
        "strategy financial materiality climate scenario analysis business model resilience opportunities revenue risk",
        STRATEGY_DETAILED_PROMPT,
        top_k=8,
    )
    risk_task = _analyze_section(
        document_id,
        "risk management identification assessment enterprise risk physical transition flood drought carbon pricing regulatory",
        RISK_MANAGEMENT_DETAILED_PROMPT,
        top_k=8,
    )
    metrics_task = _analyze_section(
        document_id,
        "metrics targets emissions scope GHG energy renewable net zero reduction SBTi carbon price water waste",
        METRICS_TARGETS_DETAILED_PROMPT,
        top_k=10,
    )

    results = await asyncio.gather(
        overview_task,
        governance_task,
        strategy_task,
        risk_task,
        metrics_task,
        return_exceptions=True,
    )

    # Handle any failures gracefully
    section_names = ["overview", "governance", "strategy", "risk_management", "metrics_targets"]
    sections = {}
    for name, result in zip(section_names, results):
        if isinstance(result, Exception):
            logger.error(f"Section {name} analysis failed: {result}")
            sections[name] = {"error": str(result), "score": 0}
        else:
            sections[name] = result

    # Phase 2: Calculate aggregate scores
    governance_score = sections.get("governance", {}).get("governance_score", 0)
    strategy_score = sections.get("strategy", {}).get("strategy_score", 0)
    risk_score = sections.get("risk_management", {}).get("risk_management_score", 0)
    metrics_score = sections.get("metrics_targets", {}).get("metrics_targets_score", 0)

    s1_score = round(
        (governance_score * 0.25)
        + (strategy_score * 0.25)
        + (risk_score * 0.25)
        + (metrics_score * 0.25),
        2,
    )

    # S2 score from metrics section (emissions + targets) and risk section
    ghg_score = sections.get("metrics_targets", {}).get("ghg_emissions", {}).get("score", 0)
    targets_score_val = sections.get("metrics_targets", {}).get("targets", {}).get("score", 0)
    physical_detail = sections.get("risk_management", {}).get("physical_risk_detail", {})
    transition_detail = sections.get("risk_management", {}).get("transition_risk_detail", {})

    # Compute physical/transition sub-scores from the risk detail
    physical_items = [v for k, v in (physical_detail or {}).items() if k not in ("findings",) and v is not None and v != ""]
    transition_items = [v for k, v in (transition_detail or {}).items() if k not in ("findings",) and v is not None and v != ""]
    physical_risk_score = min(100, len(physical_items) * 15) if physical_items else 0
    transition_risk_score = min(100, len(transition_items) * 15) if transition_items else 0

    scenario_data = sections.get("strategy", {}).get("climate_scenario_analysis", {})
    scenario_score = scenario_data.get("score", 0) if isinstance(scenario_data, dict) else 0

    s2_score = round(
        (physical_risk_score * 0.20)
        + (transition_risk_score * 0.20)
        + (scenario_score * 0.20)
        + (ghg_score * 0.25)
        + (targets_score_val * 0.15),
        2,
    )

    overview = sections.get("overview", {})
    document_completeness = overview.get("document_completeness_score", 0)
    ifrs_readiness = overview.get("ifrs_readiness_score", 0)

    # Phase 3: Generate overall AI assessment
    assessment_context = json.dumps(
        {
            "s1_score": s1_score,
            "s2_score": s2_score,
            "governance_score": governance_score,
            "strategy_score": strategy_score,
            "risk_management_score": risk_score,
            "metrics_targets_score": metrics_score,
            "document_completeness": document_completeness,
            "ifrs_readiness": ifrs_readiness,
            "governance_gaps": sections.get("governance", {}).get("gaps", []),
            "strategy_gaps": sections.get("strategy", {}).get("gaps", []),
            "risk_gaps": sections.get("risk_management", {}).get("gaps", []),
            "metrics_gaps": sections.get("metrics_targets", {}).get("gaps", []),
            "key_highlights": overview.get("key_highlights", []),
        },
        indent=2,
    )

    try:
        overall_assessment = await call_openai(OVERALL_AI_ASSESSMENT_PROMPT, assessment_context)
        overall_assessment = json.loads(overall_assessment)
    except Exception as e:
        logger.error(f"Overall assessment generation failed: {e}")
        overall_assessment = {
            "executive_summary": "Assessment generation failed. Please re-run analysis.",
            "overall_compliance_rating": "Unknown",
        }

    # Build the complete analysis document
    analysis_doc = {
        "document_id": document_id,
        "analysis_version": "2.0",
        "scores": {
            "s1_overall": s1_score,
            "s2_overall": s2_score,
            "governance": governance_score,
            "strategy": strategy_score,
            "risk_management": risk_score,
            "metrics_targets": metrics_score,
            "document_completeness": document_completeness,
            "ifrs_readiness": ifrs_readiness,
        },
        "overview": overview,
        "governance": sections.get("governance", {}),
        "strategy": sections.get("strategy", {}),
        "risk_management": sections.get("risk_management", {}),
        "metrics_targets": sections.get("metrics_targets", {}),
        "overall_assessment": overall_assessment,
        "created_at": datetime.now(timezone.utc),
    }

    # Upsert to database
    result = await document_analysis_collection.find_one_and_update(
        {"document_id": document_id},
        {"$set": analysis_doc},
        upsert=True,
        return_document=True,
    )

    logger.info(
        f"Document analysis completed for {document_id}: "
        f"S1={s1_score}, S2={s2_score}, Completeness={document_completeness}"
    )

    return {
        "id": str(result["_id"]),
        **analysis_doc,
    }
