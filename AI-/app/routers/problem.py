import json

from fastapi import APIRouter, HTTPException

from app.schemas.problem import ProblemRequest

from app.services.problem_analyzer import (
    analyze_problem_with_ai
)

from app.services.duplicate_detector import (
    detect_duplicate_problem
)

from app.services.university_agent import (
    find_best_universities
)

from app.database.mongodb import (
    problems_collection
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Problem Analysis"]
)


@router.post("/analyze-problem")
async def analyze_problem(problem: ProblemRequest):

    try:

        location = problem.location or problem.address or "India"

        # -----------------------------
        # STEP 1: Analyze problem
        # -----------------------------

        analysis = analyze_problem_with_ai(
            title=problem.title,
            description=problem.description,
            location=location
        )


        # -----------------------------
        # STEP 2: Duplicate detection
        # -----------------------------

        duplicate_result = (
            detect_duplicate_problem(
                title=problem.title,
                description=problem.description
            )
        )


        # -----------------------------
        # STEP 3: Handle duplicate
        # -----------------------------

        if duplicate_result["is_duplicate"]:

            return {
                "success": True,
                "status": "duplicate_detected",

                "message":
                    "A similar problem already exists.",

                "duplicate":
                    duplicate_result["best_match"],

                "similar_problems":
                    duplicate_result["matches"]
            }


        # -----------------------------
        # STEP 4: Get research queries
        # -----------------------------

        research_queries = analysis.get(
            "research_queries",
            []
        )


        # -----------------------------
        # STEP 5: Find universities
        # -----------------------------

        university_result = {
            "total_candidates": 0,
            "total_heis": 0,
            "top_universities": []
        }

        if research_queries:

            university_result = (
                find_best_universities(
                    research_queries
                )
            )


        # -----------------------------
        # STEP 6: Save in MongoDB
        # -----------------------------

        import datetime

        problem_document = {
            "title": problem.title,
            "description": problem.description,
            "location": location,
            "address": problem.address or location,
            "images": problem.images or [],
            "videos": problem.videos or [],
            "documents": problem.documents or [],
            "submittedBy": problem.submittedBy,
            "ai_analysis": analysis,
            "embedding": duplicate_result["embedding"],
            "university_recommendations": university_result["top_universities"],
            "status": "pending_admin_review",
            "createdAt": datetime.datetime.utcnow().isoformat(),
            "updatedAt": datetime.datetime.utcnow().isoformat()
        }


        result = problems_collection.insert_one(
            problem_document
        )


        # -----------------------------
        # STEP 7: Response
        # -----------------------------

        return {
            "success": True,
            "status": "pending_admin_review",
            "problem_id": str(result.inserted_id),
            "analysis": analysis,
            "university_discovery": university_result,
            "duplicate_check": {
                "is_duplicate": False,
                "similar_problems": duplicate_result["matches"]
            }
        }


    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="AI returned invalid JSON."
        )


    except Exception as error:

        print(
            "AI AGENT ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/problems/{problem_id}")
async def get_problem_details(problem_id: str):
    from bson import ObjectId

    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")

    problem = problems_collection.find_one({"_id": ObjectId(problem_id)})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    problem["_id"] = str(problem["_id"])
    if "embedding" in problem:
        del problem["embedding"]

    return {
        "success": True,
        "problem": problem
    }


@router.get("/problems")
async def get_all_ai_problems():
    problems = list(problems_collection.find().sort("_id", -1))
    for p in problems:
        p["_id"] = str(p["_id"])
        if "embedding" in p:
            del p["embedding"]

    return {
        "success": True,
        "count": len(problems),
        "problems": problems
    }