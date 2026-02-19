import asyncio
from PyPDF2 import PdfReader
from bson import ObjectId
from database import documents_collection
from services.embedding_service import embed_and_store


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


async def process_document(document_id: str, file_path: str):
    """Background task: extract text, embed, and update document status."""
    try:
        # Extract text
        text = extract_text_from_pdf(file_path)

        # Update document with extracted text
        await documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"extracted_text": text}},
        )

        # Generate embeddings and store
        await embed_and_store(document_id, text)

        # Mark as completed
        await documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "completed"}},
        )

    except Exception as e:
        print(f"Error processing document {document_id}: {e}")
        await documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "failed"}},
        )
