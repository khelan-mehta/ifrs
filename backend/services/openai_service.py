import json
from datetime import datetime, timezone
from openai import AsyncOpenAI
from config import get_settings
from database import embeddings_collection, documents_collection, reports_collection

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)


async def get_embedding(text: str) -> list[float]:
    """Generate embedding for a text chunk."""
    response = await client.embeddings.create(
        model=settings.embedding_model,
        input=text,
    )
    return response.data[0].embedding


async def retrieve_relevant_chunks(document_id: str, query: str, top_k: int = 5) -> list[str]:
    """RAG retrieval: find most relevant chunks for a query."""
    query_embedding = await get_embedding(query)

    # MongoDB Atlas Vector Search
    pipeline = [
        {
            "$vectorSearch": {
                "index": "embedding_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": top_k,
                "filter": {"document_id": document_id},
            }
        },
        {"$project": {"chunk_text": 1, "score": {"$meta": "vectorSearchScore"}}},
    ]

    chunks = []
    async for result in embeddings_collection.aggregate(pipeline):
        chunks.append(result["chunk_text"])

    return chunks


async def call_openai(system_prompt: str, user_content: str) -> str:
    """Call OpenAI API with structured prompt."""
    response = await client.chat.completions.create(
        model=settings.chat_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


# --- Prompt Templates ---

S1_SYSTEM_PROMPT = """You are an IFRS S1 compliance auditor.
Analyze the following sustainability report content and score each area from 0 to 100.
Return JSON only with this structure:
{
  "governance_score": <int>,
  "strategy_score": <int>,
  "risk_management_score": <int>,
  "metrics_targets_score": <int>,
  "s1_overall_score": <int>,
  "gaps": ["list of missing disclosures"],
  "recommendations": ["list of recommendations"]
}"""

S2_SYSTEM_PROMPT = """You are a climate risk analyst specializing in IFRS S2.
Analyze the following content and return JSON:
{
  "physical_risk_score": <int 0-100>,
  "transition_risk_score": <int 0-100>,
  "scenario_alignment_score": <int 0-100>,
  "emissions_scope1": <float or null>,
  "emissions_scope2": <float or null>,
  "emissions_scope3": <float or null>,
  "physical_risks": ["list"],
  "transition_risks": ["list"],
  "risk_heatmap_data": {
    "physical": {"drought": <1-5>, "flood": <1-5>, "wildfire": <1-5>, "sea_level": <1-5>},
    "transition": {"policy": <1-5>, "technology": <1-5>, "market": <1-5>, "reputation": <1-5>},
    "severity_matrix": [{"risk": "name", "likelihood": <1-5>, "impact": <1-5>}]
  }
}"""

REPORT_PROMPTS = {
    "governance_disclosure": "You are a sustainability report writer. Draft a board-level governance disclosure section for IFRS S1 compliance based on the following content. Write in formal corporate reporting style.",
    "climate_strategy": "You are a climate strategy writer. Draft a climate strategy section covering risks, opportunities, and scenario analysis based on the following content.",
    "risk_management": "Draft a risk management disclosure section covering how climate-related risks are identified, assessed, and managed.",
    "board_summary": "Write a concise executive board summary of the company's sustainability position, compliance status, and key risks.",
    "integrated_sustainability": "Draft an integrated sustainability note covering governance, strategy, risk management, and metrics for the annual report.",
}


async def generate_report(document_id: str, report_type: str) -> dict:
    """Generate an AI report for a document."""
    # Retrieve context
    prompt = REPORT_PROMPTS.get(report_type, REPORT_PROMPTS["board_summary"])
    chunks = await retrieve_relevant_chunks(document_id, report_type, top_k=8)
    context = "\n\n".join(chunks)

    response = await client.chat.completions.create(
        model=settings.chat_model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Based on the following report content:\n\n{context}"},
        ],
        temperature=0.3,
        max_tokens=2000,
    )

    generated_text = response.choices[0].message.content

    # Store report
    report_doc = {
        "document_id": document_id,
        "report_type": report_type,
        "generated_text": generated_text,
        "created_at": datetime.now(timezone.utc),
    }
    result = await reports_collection.insert_one(report_doc)

    return {
        "id": str(result.inserted_id),
        "document_id": document_id,
        "report_type": report_type,
        "generated_text": generated_text,
        "created_at": report_doc["created_at"],
    }
