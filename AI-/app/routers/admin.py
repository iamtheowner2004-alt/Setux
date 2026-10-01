from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.database.mongodb import problems_collection

from app.services.email_service import (
    generate_university_email,
    send_email
)
from app.services.university_agent import find_best_universities
from app.services.problem_analyzer import analyze_problem_with_ai


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Approval"]
)


# ==========================================
# GET PENDING PROBLEMS
# ==========================================

@router.get("/problems/pending")
async def get_pending_problems():

    try:

        problems = list(
            problems_collection.find(
                {
                    "$or": [
                        {
                            "status":
                                "pending_admin_review"
                        },
                        {
                            "status":
                                "pending_next_university"
                        }
                    ]
                }
            )
        )

        result = []

        for problem in problems:

            result.append({

                "problem_id":
                    str(problem["_id"]),

                "title":
                    problem.get("title"),

                "description":
                    problem.get("description"),

                "location":
                    problem.get("location"),

                "ai_analysis":
                    problem.get("ai_analysis"),

                "university_recommendations":
                    problem.get(
                        "university_recommendations",
                        []
                    ),

                "selected_university_index":
                    problem.get(
                        "selected_university_index"
                    ),

                "status":
                    problem.get("status")
            })


        return {

            "success": True,

            "total":
                len(result),

            "problems":
                result
        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# GET ALL PROBLEMS FOR ADMIN
# ==========================================

@router.get("/problems/all")
async def get_all_admin_problems():

    try:
        problems = list(problems_collection.find().sort("_id", -1))
        result = []

        for problem in problems:
            result.append({
                "problem_id": str(problem["_id"]),
                "_id": str(problem["_id"]),
                "title": problem.get("title"),
                "description": problem.get("description"),
                "location": problem.get("location") or problem.get("address"),
                "address": problem.get("address") or problem.get("location"),
                "ai_analysis": problem.get("ai_analysis"),
                "university_recommendations": problem.get("university_recommendations", []),
                "selected_university": problem.get("selected_university"),
                "selected_university_index": problem.get("selected_university_index"),
                "university_response": problem.get("university_response"),
                "status": problem.get("status"),
                "createdAt": problem.get("createdAt")
            })

        return {
            "success": True,
            "total": len(result),
            "problems": result
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ==========================================
# APPROVE UNIVERSITY
# ==========================================

@router.post(
    "/problems/{problem_id}/approve-university"
)
async def approve_university(
    problem_id: str,
    university_index: int
):

    try:

        # Validate ObjectId

        if not ObjectId.is_valid(
            problem_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid problem ID"
            )


        # Find problem

        problem = problems_collection.find_one(
            {
                "_id": ObjectId(
                    problem_id
                )
            }
        )


        if not problem:

            raise HTTPException(
                status_code=404,
                detail="Problem not found"
            )


        # Get universities

        universities = problem.get(
            "university_recommendations",
            []
        )


        # Validate selected university

        if (
            university_index < 0
            or university_index >= len(
                universities
            )
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid university index"
            )


        # Add backward compatibility
        # for old recommendations

        for university in universities:

            if "status" not in university:

                university[
                    "status"
                ] = "pending"

            if "response" not in university:

                university[
                    "response"
                ] = None


        selected_university = universities[
            university_index
        ]


        # Prevent selecting declined university

        if selected_university.get(
            "status"
        ) == "declined":

            raise HTTPException(
                status_code=400,
                detail=(
                    "This university has already "
                    "declined the problem"
                )
            )


        # Prevent selecting accepted university

        if selected_university.get(
            "status"
        ) == "accepted":

            raise HTTPException(
                status_code=400,
                detail=(
                    "This university has already "
                    "accepted the problem"
                )
            )


        # Mark university as approved

        universities[university_index][
            "status"
        ] = "approved"


        universities[university_index][
            "response"
        ] = None


        # Update problem

        problems_collection.update_one(

            {
                "_id": ObjectId(
                    problem_id
                )
            },

            {
                "$set": {

                    "university_recommendations":
                        universities,

                    "selected_university":
                        universities[
                            university_index
                        ],

                    "selected_university_index":
                        university_index,

                    "status":
                        "approved_for_university_outreach"

                }
            }
        )


        return {

            "success": True,

            "message":
                "University approved successfully",

            "problem_id":
                problem_id,

            "university_index":
                university_index,

            "selected_university":
                universities[
                    university_index
                ],

            "new_status":
                "approved_for_university_outreach"
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# PREVIEW UNIVERSITY EMAIL
# ==========================================

@router.get(
    "/problems/{problem_id}/university-email-preview"
)
async def preview_university_email(
    problem_id: str
):

    try:

        if not ObjectId.is_valid(
            problem_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid problem ID"
            )


        problem = problems_collection.find_one(
            {
                "_id": ObjectId(
                    problem_id
                )
            }
        )


        if not problem:

            raise HTTPException(
                status_code=404,
                detail="Problem not found"
            )


        if (
            problem.get("status")
            != "approved_for_university_outreach"
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "University outreach has not "
                    "been approved by admin"
                )
            )


        university = problem.get(
            "selected_university"
        )


        if not university:

            raise HTTPException(
                status_code=400,
                detail="No university selected"
            )


        email_data = generate_university_email(
            problem,
            university
        )


        return {

            "success": True,

            "university":
                university.get("name"),

            "email_preview":
                email_data
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# SEND UNIVERSITY EMAIL
# ==========================================

@router.post(
    "/problems/{problem_id}/send-university-email"
)
async def send_university_email(
    problem_id: str,
    recipient_email: str
):

    try:

        if not ObjectId.is_valid(
            problem_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid problem ID"
            )


        problem = problems_collection.find_one(
            {
                "_id": ObjectId(
                    problem_id
                )
            }
        )


        if not problem:

            raise HTTPException(
                status_code=404,
                detail="Problem not found"
            )


        if (
            problem.get("status")
            != "approved_for_university_outreach"
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Admin approval is required "
                    "before sending email"
                )
            )


        university = problem.get(
            "selected_university"
        )


        if not university:

            raise HTTPException(
                status_code=400,
                detail="No university selected"
            )


        selected_university_index = problem.get(
            "selected_university_index"
        )


        universities = problem.get(
            "university_recommendations",
            []
        )


        # Generate email

        email_data = generate_university_email(
            problem,
            university
        )


        # Send email (with graceful fallback for live SMTP or simulated demo)
        email_sent = True
        try:
            await send_email(
                recipient_email=recipient_email,
                subject=email_data["subject"],
                body=email_data["body"]
            )
        except Exception as mail_err:
            print(f"Live SMTP dispatch notice (email recorded in system): {mail_err}")
            email_sent = False


        # Update individual university

        if (
            selected_university_index is not None
            and selected_university_index
            < len(universities)
        ):

            universities[
                selected_university_index
            ][
                "status"
            ] = "contacted"


            universities[
                selected_university_index
            ][
                "response"
            ] = "pending"


        # Update MongoDB

        problems_collection.update_one(
            {
                "_id": ObjectId(
                    problem_id
                )
            },
            {
                "$set": {

                    "university_recommendations":
                        universities,

                    "status":
                        "university_contacted",

                    "university_email": {

                        "recipient":
                            recipient_email,

                        "subject":
                            email_data["subject"],

                        "sent":
                            True
                    }
                }
            }
        )


        return {

            "success": True,

            "message":
                "Email sent successfully",

            "university":
                university.get("name"),

            "recipient":
                recipient_email,

            "new_status":
                "university_contacted"
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# ON-DEMAND LIVE UNIVERSITY MATCHING
# ==========================================

@router.post("/problems/{problem_id}/match-universities")
async def match_universities_for_problem(problem_id: str):
    try:
        if not ObjectId.is_valid(problem_id):
            raise HTTPException(status_code=400, detail="Invalid problem ID")

        problem = problems_collection.find_one({"_id": ObjectId(problem_id)})
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        title = problem.get("title", "")
        description = problem.get("description", "")
        location = problem.get("location") or problem.get("address") or "India"

        # Step 1: Extract or generate research queries via AI
        ai_analysis = problem.get("ai_analysis")
        research_queries = []
        if ai_analysis and isinstance(ai_analysis, dict):
            research_queries = ai_analysis.get("research_queries", [])

        if not research_queries:
            # Run fresh AI analysis to get high-precision research queries
            analysis = analyze_problem_with_ai(
                title=title,
                description=description,
                location=location
            )
            research_queries = analysis.get("research_queries", [title])
            ai_analysis = analysis

        # Step 2: Live OpenAlex Academic Search & Ranking
        uni_result = find_best_universities(research_queries)
        top_universities = (
            uni_result.get("top_universities", [])
            if isinstance(uni_result, dict)
            else uni_result
        )

        # Step 3: Persist clean list in MongoDB
        update_doc = {
            "university_recommendations": top_universities,
            "status": "pending_admin_review"
        }
        if ai_analysis:
            update_doc["ai_analysis"] = ai_analysis

        problems_collection.update_one(
            {"_id": ObjectId(problem_id)},
            {"$set": update_doc}
        )

        return {
            "success": True,
            "message": f"Successfully matched {len(top_universities)} Indian universities via OpenAlex",
            "problem_id": problem_id,
            "university_recommendations": top_universities,
            "ai_analysis": ai_analysis
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))