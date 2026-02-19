import os
import json
import logging
import numpy as np
import faiss
import threading

logger = logging.getLogger("ifrs.vector_store")


class FAISSVectorStore:
    """Per-document FAISS indexes for vector similarity search."""

    def __init__(self, index_dir: str, dimension: int = 1536):
        self.index_dir = index_dir
        self.dimension = dimension
        self._lock = threading.Lock()
        os.makedirs(index_dir, exist_ok=True)
        logger.info(f"FAISS vector store initialized at {index_dir} (dim={dimension})")

    def _index_path(self, document_id: str) -> str:
        return os.path.join(self.index_dir, f"{document_id}.index")

    def _chunks_path(self, document_id: str) -> str:
        return os.path.join(self.index_dir, f"{document_id}.chunks.json")

    def add_vectors(self, document_id: str, embeddings: list[list[float]], chunk_texts: list[str]):
        """Build a FAISS index for a document and persist to disk."""
        if not embeddings:
            return

        with self._lock:
            vectors = np.array(embeddings, dtype="float32")
            faiss.normalize_L2(vectors)

            index = faiss.IndexFlatIP(self.dimension)
            index.add(vectors)

            faiss.write_index(index, self._index_path(document_id))
            with open(self._chunks_path(document_id), "w") as f:
                json.dump(chunk_texts, f)

        logger.info(f"Stored {len(embeddings)} vectors for document {document_id}")

    def search(self, document_id: str, query_vector: list[float], top_k: int = 5) -> list[str]:
        """Search for the most similar chunks in a document's index."""
        index_path = self._index_path(document_id)
        chunks_path = self._chunks_path(document_id)

        if not os.path.exists(index_path) or not os.path.exists(chunks_path):
            logger.warning(f"No FAISS index found for document {document_id}")
            return []

        index = faiss.read_index(index_path)
        with open(chunks_path, "r") as f:
            texts = json.load(f)

        k = min(top_k, index.ntotal)
        if k == 0:
            return []

        query = np.array([query_vector], dtype="float32")
        faiss.normalize_L2(query)

        _, indices = index.search(query, k)
        return [texts[i] for i in indices[0] if 0 <= i < len(texts)]

    def delete_document(self, document_id: str):
        """Remove a document's FAISS index and chunk data from disk."""
        for path in [self._index_path(document_id), self._chunks_path(document_id)]:
            if os.path.exists(path):
                os.remove(path)
        logger.info(f"Deleted FAISS index for document {document_id}")

    def has_index(self, document_id: str) -> bool:
        return os.path.exists(self._index_path(document_id))


# Singleton instance — initialized lazily from config
_store: FAISSVectorStore | None = None


def get_vector_store() -> FAISSVectorStore:
    global _store
    if _store is None:
        from config import get_settings
        settings = get_settings()
        faiss_dir = getattr(settings, "faiss_index_dir", "./faiss_data")
        dimension = getattr(settings, "embedding_dimension", 1536)
        _store = FAISSVectorStore(faiss_dir, dimension)
    return _store
