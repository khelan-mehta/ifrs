import json
import logging
import asyncio
from datetime import datetime, timezone
from openai import AsyncOpenAI, APITimeoutError, RateLimitError, APIConnectionError
from config import get_settings
from database import documents_collection, reports_collection
from services.vector_store import get_vector_store

logger = logging.getLogger("ifrs.openai")
settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)

MAX_RETRIES = 3


async def get_embedding(text: str) -> list[float]:
    """Generate embedding for a text chunk."""
    for attempt in range(MAX_RETRIES):
        try:
            response = await client.embeddings.create(
                model=settings.embedding_model,
                input=text,
            )
            return response.data[0].embedding
        except (APITimeoutError, APIConnectionError, RateLimitError) as e:
            if attempt == MAX_RETRIES - 1:
                logger.error(f"Embedding failed after {MAX_RETRIES} retries: {e}")
                raise
            logger.warning(f"Embedding attempt {attempt + 1} failed, retrying: {e}")
            await asyncio.sleep(2 ** attempt)


async def retrieve_relevant_chunks(document_id: str, query: str, top_k: int = 5) -> list[str]:
    """RAG retrieval: find most relevant chunks for a query using FAISS."""
    query_embedding = await get_embedding(query)

    store = get_vector_store()
    chunks = store.search(document_id, query_embedding, top_k)

    if not chunks:
        logger.warning(f"No FAISS results for document {document_id}")

    return chunks


async def call_openai(system_prompt: str, user_content: str) -> str:
    """Call OpenAI API with structured prompt and retry logic."""
    for attempt in range(MAX_RETRIES):
        try:
            response = await client.chat.completions.create(
                model=settings.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            json.loads(content)  # Validate JSON
            return content
        except (APITimeoutError, APIConnectionError, RateLimitError) as e:
            if attempt == MAX_RETRIES - 1:
                logger.error(f"OpenAI call failed after {MAX_RETRIES} retries: {e}")
                raise
            logger.warning(f"OpenAI attempt {attempt + 1} failed, retrying: {e}")
            await asyncio.sleep(2 ** attempt)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from OpenAI: {e}")
            if attempt == MAX_RETRIES - 1:
                raise ValueError("Failed to get valid JSON from AI model")


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
    prompt = REPORT_PROMPTS.get(report_type, REPORT_PROMPTS["board_summary"])
    chunks = await retrieve_relevant_chunks(document_id, report_type, top_k=8)

    if not chunks:
        raise ValueError("No document content available for report generation")

    context = "\n\n".join(chunks)

    for attempt in range(MAX_RETRIES):
        try:
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
            break
        except (APITimeoutError, APIConnectionError, RateLimitError) as e:
            if attempt == MAX_RETRIES - 1:
                logger.error(f"Report generation failed after {MAX_RETRIES} retries: {e}")
                raise
            logger.warning(f"Report generation attempt {attempt + 1} failed: {e}")
            await asyncio.sleep(2 ** attempt)

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
