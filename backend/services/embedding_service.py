import tiktoken
from services.openai_service import get_embedding
from services.vector_store import get_vector_store
from config import get_settings

settings = get_settings()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[dict]:
    """Split text into overlapping chunks using token count."""
    enc = tiktoken.encoding_for_model("gpt-4o")
    tokens = enc.encode(text)
    chunks = []
    start = 0

    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = enc.decode(chunk_tokens)
        chunks.append({
            "text": chunk_text,
            "start_token": start,
            "end_token": min(end, len(tokens)),
        })
        start += chunk_size - overlap

    return chunks


async def embed_and_store(document_id: str, text: str, metadata: dict = None):
    """Chunk text, generate embeddings, and store in FAISS."""
    chunks = chunk_text(text, settings.chunk_size, settings.chunk_overlap)

    embeddings = []
    chunk_texts = []
    for chunk in chunks:
        embedding = await get_embedding(chunk["text"])
        embeddings.append(embedding)
        chunk_texts.append(chunk["text"])

    store = get_vector_store()
    store.add_vectors(document_id, embeddings, chunk_texts)

    return len(chunks)
