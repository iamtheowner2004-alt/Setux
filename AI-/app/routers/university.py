from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.schemas.university import UniversityCreate

from app.database.mongodb import (
    universities_collection,
    problems_collection
)


router = APIRouter(
    prefix="/api/universities",
    tags=["Universities"]
)


# ==========================================
# CREATE UNIVERSITY
# ==========================================

@router.post("/")
async def create_university(
    university: UniversityCreate
):

    try:

        university_document = {
            "name": university.name,
            "city": university.city,
            "state": university.state,
            "departments": university.departments,
            "research_areas": university.research_areas,
            "faculty_expertise": university.faculty_expertise,
            "labs": university.labs,
            "innovation_centers": university.innovation_centers,
            "website": university.website,
            "contact_email": university.contact_email,
            "verified": False
        }

        result = universities_collection.insert_one(
            university_document
        )

        return {
            "success": True,
            "university_id": str(result.inserted_id),
            "message": "University added successfully"
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# UNIVERSITY ACCEPT / DECLINE PROBLEM
# ==========================================

@router.post(
    "/problems/{problem_id}/respond"
)
async def university_respond(
    problem_id: str,
    response: str
):

    try:

        # Validate MongoDB ObjectId

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


        # Normalize response

        response = response.lower().strip()


        # ==========================================
        # GET UNIVERSITY RECOMMENDATIONS
        # ==========================================

        university_recommendations = problem.get(
            "university_recommendations",
            []
        )


        if not university_recommendations:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No university recommendations "
                    "found for this problem"
                )
            )


        # Get currently selected university index

        selected_university_index = problem.get(
            "selected_university_index"
        )


        # ==========================================
        # BACKWARD COMPATIBILITY
        # ==========================================

        for university in university_recommendations:

            if "status" not in university:

                university["status"] = "pending"

            if "response" not in university:

                university["response"] = None


        # ==========================================
        # FIND CURRENT UNIVERSITY
        # ==========================================

        if selected_university_index is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No university is currently selected "
                    "for this problem"
                )
            )


        if (
            selected_university_index < 0
            or selected_university_index
            >= len(university_recommendations)
        ):

            raise HTTPException(
                status_code=400,
                detail="Selected university not found"
            )


        # ==========================================
        # CHECK UNIVERSITY WAS CONTACTED
        # ==========================================

        if problem.get(
            "status"
        ) != "university_contacted":

            raise HTTPException(
                status_code=400,
                detail=(
                    "University has not been contacted "
                    "for this problem"
                )
            )


        # ==========================================
        # UNIVERSITY ACCEPTS
        # ==========================================

        if response == "accept":

            university_recommendations[
                selected_university_index
            ][
                "status"
            ] = "accepted"


            university_recommendations[
                selected_university_index
            ][
                "response"
            ] = "accepted"


            problems_collection.update_one(
                {
                    "_id": ObjectId(
                        problem_id
                    )
                },
                {
                    "$set": {

                        "university_recommendations":
                            university_recommendations,

                        "selected_university":
                            university_recommendations[
                                selected_university_index
                            ],

                        "status":
                            "university_accepted",

                        "university_response":
                            "accepted"
                    }
                }
            )


            return {
                "success": True,

                "message":
                    "University accepted the problem",

                "selected_university":
                    university_recommendations[
                        selected_university_index
                    ],

                "new_status":
                    "university_accepted"
            }


        # ==========================================
        # UNIVERSITY DECLINES
        # ==========================================

        elif response == "decline":

            # Mark current university declined

            university_recommendations[
                selected_university_index
            ][
                "status"
            ] = "declined"


            university_recommendations[
                selected_university_index
            ][
                "response"
            ] = "declined"


            # Find next pending university

            next_university_index = None


            for index, university in enumerate(
                university_recommendations
            ):

                if university.get(
                    "status"
                ) == "pending":

                    next_university_index = index

                    break


            # ======================================
            # NEXT UNIVERSITY EXISTS
            # ======================================

            if next_university_index is not None:

                next_university = (
                    university_recommendations[
                        next_university_index
                    ]
                )


                problems_collection.update_one(
                    {
                        "_id": ObjectId(
                            problem_id
                        )
                    },
                    {
                        "$set": {

                            "university_recommendations":
                                university_recommendations,

                            "previous_university_index":
                                selected_university_index,

                            "selected_university_index":
                                next_university_index,

                            "selected_university":
                                next_university,

                            "status":
                                "pending_next_university",

                            "university_response":
                                "declined"
                        }
                    }
                )


                return {
                    "success": True,

                    "message":
                        "University declined. Next suitable "
                        "university is available.",

                    "previous_university_index":
                        selected_university_index,

                    "next_university_index":
                        next_university_index,

                    "next_university":
                        next_university,

                    "new_status":
                        "pending_next_university"
                }


            # ======================================
            # ALL UNIVERSITIES DECLINED (WAIT FOR MANUAL ADMIN ACTION)
            # ======================================

            problems_collection.update_one(
                {
                    "_id": ObjectId(
                        problem_id
                    )
                },
                {
                    "$set": {
                        "university_recommendations":
                            university_recommendations,
                        "status":
                            "all_universities_declined",
                        "university_response":
                            "declined"
                    }
                }
            )

            return {
                "success": True,
                "message": (
                    "All recommended universities have declined. "
                    "Awaiting admin review or manual government escalation."
                ),
                "new_status": "all_universities_declined"
            }


        # ==================================
        # INVALID RESPONSE
        # ==================================

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Response must be "
                    "'accept' or 'decline'"
                )
            )


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )