from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.schemas.industry import IndustrySearchRequest

from app.database.mongodb import (
    problems_collection,
    industry_recommendations_collection
)

from app.services.solution_analyzer import (
    analyze_solution_with_ai
)

from app.services.industry_search import (
    search_industries
)

from app.services.industry_matcher import (
    rank_industries_with_ai
)


router = APIRouter(
    prefix="/api/ai",
    tags=["Industry AI Agent"]
)


@router.post("/find-industries")
async def find_industries(data: IndustrySearchRequest):

    try:

        # Validate problem ID
        if not ObjectId.is_valid(data.problem_id):

            raise HTTPException(
                status_code=400,
                detail="Invalid problem ID"
            )


        # Find original problem
        problem = problems_collection.find_one(
            {
                "_id": ObjectId(data.problem_id)
            }
        )


        if not problem:

            raise HTTPException(
                status_code=404,
                detail="Original problem not found"
            )


        # Prepare solution data
        solution = {
            "solution_title": data.solution_title,
            "solution_description": data.solution_description,
            "technologies": data.technologies
        }


        # STEP 1: Analyze solution using AI
        solution_analysis = analyze_solution_with_ai(
            problem=problem,
            solution_title=data.solution_title,
            solution_description=data.solution_description,
            technologies=data.technologies
        )


        # Get industry search queries
        search_queries = solution_analysis.get(
            "industry_search_queries",
            []
        )


        # Check if AI generated queries
        if not search_queries:

            return {
                "success": False,
                "message": "AI could not generate industry search queries",
                "recommended_industries": []
            }


        # STEP 2: Search industries in real time
        industry_candidates = search_industries(
            queries=search_queries,
            max_results_per_query=5
        )


        # If no industry candidates found
        if not industry_candidates:

            recommendation_document = {

                "problem_id": ObjectId(data.problem_id),

                "solution": solution,

                "solution_analysis": solution_analysis,

                "search_queries": search_queries,

                "recommended_industries": [],

                "industry_result": {
                    "recommended_industries": [],
                    "industry_search_status": "no_candidates_found"
                },

                "status": "no_candidates_found"
            }


            save_result = (
                industry_recommendations_collection.insert_one(
                    recommendation_document
                )
            )


            return {

                "success": True,

                "problem_id": data.problem_id,

                "recommendation_id": str(
                    save_result.inserted_id
                ),

                "status": "no_candidates_found",

                "message": "No industry candidates found",

                "solution_analysis": solution_analysis,

                "recommended_industries": [],

                "industry_search_status": "no_candidates_found"
            }


        # STEP 3: Rank industries using Gemini
        industry_result = rank_industries_with_ai(
            problem=problem,
            solution=solution,
            solution_analysis=solution_analysis,
            industry_candidates=industry_candidates
        )


        # Get recommended industries
        recommended_industries = industry_result.get(
            "recommended_industries",
            []
        )


        # STEP 4: Save recommendation in MongoDB
        recommendation_document = {

            "problem_id": ObjectId(data.problem_id),

            "solution": solution,

            "solution_analysis": solution_analysis,

            "search_queries": search_queries,

            "recommended_industries": recommended_industries,

            "industry_result": industry_result,

            "status": "pending_admin_review"
        }


        save_result = (
            industry_recommendations_collection.insert_one(
                recommendation_document
            )
        )


        # Final response
        return {

            "success": True,

            "problem_id": data.problem_id,

            "recommendation_id": str(
                save_result.inserted_id
            ),

            "status": "pending_admin_review",

            "solution_analysis": solution_analysis,

            "search_queries": search_queries,

            "candidates_found": len(
                industry_candidates
            ),

            "recommended_industries": recommended_industries,

            "industry_result": industry_result
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "INDUSTRY AGENT ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )