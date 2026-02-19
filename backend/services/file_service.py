import logging
import asyncio
from PyPDF2 import PdfReader
from bson import ObjectId
from database import documents_collection
from services.embedding_service import embed_and_store

logger = logging.getLogger("ifrs.file_service")

MAX_RETRIES = 2


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        if not text.strip():
            raise ValueError("PDF contains no extractable text")
        return text
    except Exception as e:
        logger.error(f"PDF extraction failed for {file_path}: {e}")
        raise


async def process_document(document_id: str, file_path: str):
    """Background task: extract text, embed, and update document status."""
    for attempt in range(MAX_RETRIES + 1):
        try:
            logger.info(f"Processing document {document_id} (attempt {attempt + 1})")

            text = extract_text_from_pdf(file_path)
            logger.info(f"Extracted {len(text)} chars from document {document_id}")

            await documents_collection.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": {"extracted_text": text}},
            )

            chunk_count = await embed_and_store(document_id, text)
            logger.info(f"Created {chunk_count} embeddings for document {document_id}")

            await documents_collection.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": {"status": "completed"}},
            )
            logger.info(f"Document {document_id} processed successfully")
            return

        except Exception as e:
            logger.error(f"Error processing document {document_id} (attempt {attempt + 1}): {e}")
            if attempt == MAX_RETRIES:
                await documents_collection.update_one(
                    {"_id": ObjectId(document_id)},
                    {"$set": {"status": "failed", "error": str(e)}},
                )
            else:
                await asyncio.sleep(2 ** attempt)
