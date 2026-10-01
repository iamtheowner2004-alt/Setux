import math

from app.database.mongodb import problems_collection
from app.services.problem_analyzer import generate_problem_embedding


def cosine_similarity(vector_a, vector_b):

    dot_product = sum(
        a * b for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0

    return dot_product / (magnitude_a * magnitude_b)


def detect_duplicate_problem(
    title: str,
    description: str
):

    problem_text = f"{title}. {description}"

    new_embedding = generate_problem_embedding(problem_text)

    existing_problems = problems_collection.find(
        {},
        {
            "_id": 1,
            "title": 1,
            "description": 1,
            "embedding": 1
        }
    )

    matches = []

    for problem in existing_problems:

        old_embedding = problem.get("embedding")

        if not old_embedding:
            continue

        similarity = cosine_similarity(
            new_embedding,
            old_embedding
        )

        matches.append({
            "problem_id": str(problem["_id"]),
            "title": problem["title"],
            "similarity": round(similarity * 100, 2)
        })

    matches.sort(
        key=lambda x: x["similarity"],
        reverse=True
    )

    best_match = matches[0] if matches else None

    is_duplicate = (
        best_match is not None
        and best_match["similarity"] >= 85
    )

    return {
        "is_duplicate": is_duplicate,
        "best_match": best_match,
        "matches": matches[:5],
        "embedding": new_embedding
    }