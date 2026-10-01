from fastapi import (
    APIRouter,
    HTTPException
)

from bson import ObjectId

from app.schemas.solution import (
    SolutionRequest
)

from app.database.mongodb import (
    problems_collection
)

from app.services.solution_analyzer import (
    analyze_solution_with_ai
)


router = APIRouter(
    prefix="/api/ai",
    tags=["Solution AI Agent"]
)


@router.post(
    "/analyze-solution"
)
async def analyze_solution(
    solution: SolutionRequest
):

    try:

        # Validate problem ID
        if not ObjectId.is_valid(
            solution.problem_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid problem ID"
            )


        # Find original problem
        problem = problems_collection.find_one(
            {
                "_id":
                    ObjectId(
                        solution.problem_id
                    )
            }
        )


        if not problem:

            raise HTTPException(
                status_code=404,
                detail="Original problem not found"
            )


        # AI analyzes solution
        analysis = analyze_solution_with_ai(
            problem=problem,
            solution_title=
                solution.solution_title,
            solution_description=
                solution.solution_description,
            technologies=
                solution.technologies
        )


        return {

            "success": True,

            "problem_id":
                solution.problem_id,

            "solution_analysis":
                analysis
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "SOLUTION AGENT ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )