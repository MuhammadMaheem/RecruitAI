import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path

_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        persist_dir = Path("./chroma_db")
        persist_dir.mkdir(exist_ok=True)
        _client = chromadb.PersistentClient(path=str(persist_dir))
        ef = embedding_functions.DefaultEmbeddingFunction()
        _collection = _client.get_or_create_collection(
            name="skills",
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def index_candidate_skills(candidate_id: int, skills: list[str]):
    if not skills:
        return
    col = _get_collection()
    docs = [s.lower() for s in skills]
    ids = [f"c{candidate_id}_{i}" for i in range(len(docs))]
    metadatas = [{"candidate_id": candidate_id, "skill": s} for s in docs]

    # remove existing entries for this candidate
    try:
        existing = col.get(where={"candidate_id": candidate_id})
        if existing["ids"]:
            col.delete(ids=existing["ids"])
    except Exception:
        pass

    col.add(documents=docs, ids=ids, metadatas=metadatas)


def semantic_skill_match(required_skills: list[str], candidate_skills: list[str]) -> float:
    """Return 0-1 ratio of required skills semantically covered by candidate skills."""
    if not required_skills or not candidate_skills:
        return 0.0

    col = _get_collection()
    candidate_lower = [s.lower() for s in candidate_skills]

    # index candidate skills temporarily for query
    temp_ids = [f"tmp_{i}" for i in range(len(candidate_lower))]
    try:
        col.add(documents=candidate_lower, ids=temp_ids,
                metadatas=[{"candidate_id": -1, "skill": s} for s in candidate_lower])
    except Exception:
        pass

    matched = 0
    for req_skill in required_skills:
        try:
            results = col.query(
                query_texts=[req_skill.lower()],
                n_results=min(3, len(candidate_lower)),
                where={"candidate_id": -1},
            )
            if results["distances"] and results["distances"][0]:
                best_distance = results["distances"][0][0]
                # cosine distance < 0.3 = strong match
                if best_distance < 0.35:
                    matched += 1
        except Exception:
            pass

    # clean temp entries
    try:
        col.delete(ids=temp_ids)
    except Exception:
        pass

    return matched / len(required_skills)
