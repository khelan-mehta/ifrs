import tiktoken
from services.openai_service import get_embedding
from services.vector_store import get_vector_store
from config import get_settings

settings = get_settings()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100):
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)

    chunks = []
    start = 0

    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        start += chunk_size - overlap

    return chunks


async def embed_and_store(document_id: str, text: str):
    chunks = chunk_text(text, settings.chunk_size, settings.chunk_overlap)

    embeddings = []
    chunk_texts = []

    for chunk in chunks:
        embedding = await get_embedding(chunk)
        embeddings.append(embedding)
        chunk_texts.append(chunk)

    # 🔥 THIS WAS MISSING
    vector_store = get_vector_store()
    vector_store.add_vectors(document_id, embeddings, chunk_texts)

    return len(chunks)
