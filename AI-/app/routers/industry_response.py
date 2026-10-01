from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.database.mongodb import (
    industry_recommendations_collection
)

from app.services.government_agent import (
    automatically_escalate_to_government
)


router = APIRouter(
    prefix="/api/industry",
    tags=["Industry Response Management"]
)


# MARK INDUSTRY INVITATION AS SENT

@router.post(
    "/{recommendation_id}/mark-invitation-sent"
)
async def mark_invitation_sent(
    recommendation_id: str
):

    try:

        if not ObjectId.is_valid(
            recommendation_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid recommendation ID"
            )


        recommendation = (
            industry_recommendations_collection.find_one(
                {
                    "_id": ObjectId(
                        recommendation_id
                    )
                }
            )
        )


        if not recommendation:

            raise HTTPException(
                status_code=404,
                detail="Industry recommendation not found"
            )


        if recommendation.get(
            "status"
        ) != "industry_approved":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Industry must be approved by admin "
                    "before sending invitation"
                )
            )


        selected_index = recommendation.get(
            "selected_industry_index"
        )


        industries = recommendation.get(
            "recommended_industries",
            []
        )


        if (
            selected_index is None
            or selected_index >= len(industries)
        ):

            raise HTTPException(
                status_code=400,
                detail="Selected industry not found"
            )


        # Update individual industry status

        industries[selected_index][
            "status"
        ] = "invited"

        industries[selected_index][
            "response"
        ] = "pending"


        # Update MongoDB

        industry_recommendations_collection.update_one(
            {
                "_id": ObjectId(
                    recommendation_id
                )
            },
            {
                "$set": {

                    "recommended_industries":
                        industries,

                    "status":
                        "industry_invited",

                    "industry_response":
                        "pending"
                }
            }
        )


        return {

            "success": True,

            "message":
                "Industry invitation marked as sent",

            "recommendation_id":
                recommendation_id,

            "industry_index":
                selected_index,

            "selected_industry":
                industries[selected_index],

            "status":
                "industry_invited"
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# INDUSTRY RESPONSE

@router.post(
    "/{recommendation_id}/respond"
)
async def industry_respond(
    recommendation_id: str,
    response: str
):

    try:

        allowed_responses = [
            "accepted",
            "rejected",
            "not_interested"
        ]


        if response not in allowed_responses:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Response must be: accepted, "
                    "rejected, or not_interested"
                )
            )


        if not ObjectId.is_valid(
            recommendation_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid recommendation ID"
            )


        recommendation = (
            industry_recommendations_collection.find_one(
                {
                    "_id": ObjectId(
                        recommendation_id
                    )
                }
            )
        )


        if not recommendation:

            raise HTTPException(
                status_code=404,
                detail="Industry recommendation not found"
            )


        if recommendation.get(
            "status"
        ) != "industry_invited":

            raise HTTPException(
                status_code=400,
                detail="Industry has not been invited yet"
            )


        selected_index = recommendation.get(
            "selected_industry_index"
        )


        industries = recommendation.get(
            "recommended_industries",
            []
        )


        if (
            selected_index is None
            or selected_index >= len(industries)
        ):

            raise HTTPException(
                status_code=400,
                detail="Selected industry not found"
            )


        # =================================
        # INDUSTRY ACCEPTS
        # =================================

        if response == "accepted":

            industries[selected_index][
                "status"
            ] = "accepted"

            industries[selected_index][
                "response"
            ] = "accepted"


            industry_recommendations_collection.update_one(
                {
                    "_id": ObjectId(
                        recommendation_id
                    )
                },
                {
                    "$set": {

                        "recommended_industries":
                            industries,

                        "selected_industry":
                            industries[selected_index],

                        "status":
                            "industry_collaboration_started",

                        "industry_response":
                            "accepted"
                    }
                }
            )


            return {

                "success": True,

                "recommendation_id":
                    recommendation_id,

                "industry_index":
                    selected_index,

                "industry_response":
                    response,

                "status":
                    "industry_collaboration_started",

                "message":
                    "Industry collaboration started"
            }


        # =================================
        # INDUSTRY DECLINES
        # =================================

        industries[selected_index][
            "status"
        ] = "declined"

        industries[selected_index][
            "response"
        ] = response


        # Find next pending industry

        next_industry_index = None


        for index, industry in enumerate(
            industries
        ):

            if industry.get(
                "status"
            ) == "pending":

                next_industry_index = index
                break


        # =================================
        # NEXT INDUSTRY EXISTS
        # =================================

        if next_industry_index is not None:

            next_industry = industries[
                next_industry_index
            ]


            # Keep next industry pending
            # Admin can approve it

            industry_recommendations_collection.update_one(
                {
                    "_id": ObjectId(
                        recommendation_id
                    )
                },
                {
                    "$set": {

                        "recommended_industries":
                            industries,

                        "status":
                            "pending_next_industry",

                        "previous_industry_index":
                            selected_index,

                        "selected_industry":
                            next_industry,

                        "selected_industry_index":
                            next_industry_index,

                        "industry_response":
                            response
                    }
                }
            )


            return {

                "success": True,

                "recommendation_id":
                    recommendation_id,

                "previous_industry_index":
                    selected_index,

                "industry_response":
                    response,

                "status":
                    "pending_next_industry",

                "message":
                    "Industry declined. Next suitable "
                    "industry is available.",

                "next_industry_index":
                    next_industry_index,

                "next_industry":
                    next_industry
            }


        # =================================
        # NO INDUSTRIES LEFT (WAIT FOR MANUAL ADMIN ACTION)
        # =================================

        industry_recommendations_collection.update_one(
            {
                "_id": ObjectId(
                    recommendation_id
                )
            },
            {
                "$set": {
                    "recommended_industries":
                        industries,
                    "status":
                        "industry_declined",
                    "industry_response":
                        response
                }
            }
        )

        problem_id = recommendation.get("problem_id")
        if problem_id:
            from app.database.mongodb import problems_collection
            problems_collection.update_one(
                {"_id": ObjectId(problem_id)},
                {"$set": {"status": "industry_declined"}}
            )

        return {
            "success": True,
            "recommendation_id":
                recommendation_id,
            "industry_response":
                response,
            "status":
                "industry_declined",
            "message":
                "All suitable industries have declined. Awaiting admin review or manual government escalation."
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "INDUSTRY RESPONSE ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )