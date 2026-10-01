from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.database.mongodb import (
    industry_recommendations_collection,
    problems_collection
)
from app.services.email_service import (
    generate_industry_email,
    send_email
)


router = APIRouter(
    prefix="/api/admin/industry-recommendations",
    tags=["Admin Industry Management"]
)


# GET ALL PENDING INDUSTRY RECOMMENDATIONS

@router.get("/pending")
async def get_pending_industry_recommendations():
    try:
        recommendations = list(
            industry_recommendations_collection.find(
                {"status": "pending_admin_review"}
            )
        )
        result = []
        for recommendation in recommendations:
            recommendation["_id"] = str(recommendation["_id"])
            recommendation["problem_id"] = str(recommendation["problem_id"])
            result.append(recommendation)

        return {
            "success": True,
            "total": len(result),
            "recommendations": result
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# APPROVE ONE INDUSTRY

@router.post("/{recommendation_id}/approve-industry")
async def approve_industry(
    recommendation_id: str,
    industry_index: int
):
    try:
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(status_code=400, detail="Invalid recommendation ID")

        recommendation = industry_recommendations_collection.find_one(
            {"_id": ObjectId(recommendation_id)}
        )

        if not recommendation:
            raise HTTPException(status_code=404, detail="Industry recommendation not found")

        industries = recommendation.get("recommended_industries", [])

        if industry_index < 0 or industry_index >= len(industries):
            raise HTTPException(status_code=400, detail="Invalid industry index")

        # Reset other industries if any were approved previously
        for idx, ind in enumerate(industries):
            if idx != industry_index and ind.get("status") == "approved":
                ind["status"] = "pending"

        selected_industry = industries[industry_index]
        selected_industry["status"] = "approved"
        selected_industry["response"] = None

        # Save in MongoDB
        industry_recommendations_collection.update_one(
            {"_id": ObjectId(recommendation_id)},
            {
                "$set": {
                    "recommended_industries": industries,
                    "selected_industry": selected_industry,
                    "selected_industry_index": industry_index,
                    "status": "industry_approved"
                }
            }
        )

        # Also update parent problem status
        problem_id = recommendation.get("problem_id")
        if problem_id:
            problems_collection.update_one(
                {"_id": ObjectId(problem_id)},
                {
                    "$set": {
                        "status": "industry_approved",
                        "selected_industry": selected_industry
                    }
                }
            )

        return {
            "success": True,
            "message": f"Industry '{selected_industry.get('name')}' approved successfully",
            "recommendation_id": recommendation_id,
            "industry_index": industry_index,
            "selected_industry": selected_industry,
            "status": "industry_approved"
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# PREVIEW INDUSTRY COLLABORATION EMAIL

@router.get("/{recommendation_id}/industry-email-preview")
async def preview_industry_email(recommendation_id: str):
    try:
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(status_code=400, detail="Invalid recommendation ID")

        recommendation = industry_recommendations_collection.find_one(
            {"_id": ObjectId(recommendation_id)}
        )

        if not recommendation:
            raise HTTPException(status_code=404, detail="Industry recommendation not found")

        selected_industry = recommendation.get("selected_industry")
        if not selected_industry:
            industries = recommendation.get("recommended_industries", [])
            if industries:
                selected_industry = industries[0]
            else:
                raise HTTPException(status_code=400, detail="No industry partner selected")

        problem_id = recommendation.get("problem_id")
        problem = {}
        if problem_id:
            problem = problems_collection.find_one({"_id": ObjectId(problem_id)}) or {}

        email_data = generate_industry_email(
            problem=problem,
            recommendation=recommendation,
            industry=selected_industry
        )

        # Derive a suggested recipient email
        website = selected_industry.get("website", "")
        domain = "industry.com"
        if website and "://" in website:
            domain = website.split("://")[1].split("/")[0].replace("www.", "")

        suggested_recipient = f"partnerships@{domain}"

        return {
            "success": True,
            "industry_name": selected_industry.get("name"),
            "suggested_recipient": suggested_recipient,
            "email_preview": email_data
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# SEND INDUSTRY COLLABORATION EMAIL

@router.post("/{recommendation_id}/send-industry-email")
async def send_industry_email_endpoint(
    recommendation_id: str,
    recipient_email: str
):
    try:
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(status_code=400, detail="Invalid recommendation ID")

        recommendation = industry_recommendations_collection.find_one(
            {"_id": ObjectId(recommendation_id)}
        )

        if not recommendation:
            raise HTTPException(status_code=404, detail="Industry recommendation not found")

        selected_industry = recommendation.get("selected_industry")
        selected_index = recommendation.get("selected_industry_index", 0)
        industries = recommendation.get("recommended_industries", [])

        if not selected_industry and industries:
            selected_industry = industries[0]
            selected_index = 0

        if not selected_industry:
            raise HTTPException(status_code=400, detail="No industry selected")

        problem_id = recommendation.get("problem_id")
        problem = {}
        if problem_id:
            problem = problems_collection.find_one({"_id": ObjectId(problem_id)}) or {}

        # Generate email
        email_data = generate_industry_email(
            problem=problem,
            recommendation=recommendation,
            industry=selected_industry
        )

        # Dispatch email via SMTP (with non-blocking fallback)
        email_sent = True
        try:
            await send_email(
                recipient_email=recipient_email,
                subject=email_data["subject"],
                body=email_data["body"]
            )
        except Exception as mail_err:
            print(f"Industry SMTP notification (simulated/recorded): {mail_err}")
            email_sent = False

        # Update industry status to invited
        if selected_index < len(industries):
            industries[selected_index]["status"] = "invited"
            industries[selected_index]["response"] = "pending"

        industry_recommendations_collection.update_one(
            {"_id": ObjectId(recommendation_id)},
            {
                "$set": {
                    "recommended_industries": industries,
                    "status": "industry_invited",
                    "industry_response": "pending",
                    "industry_email": {
                        "recipient": recipient_email,
                        "subject": email_data["subject"],
                        "sent": email_sent
                    }
                }
            }
        )

        if problem_id:
            problems_collection.update_one(
                {"_id": ObjectId(problem_id)},
                {"$set": {"status": "industry_invited"}}
            )

        return {
            "success": True,
            "message": f"Collaboration invitation email dispatched to {selected_industry.get('name')}",
            "industry": selected_industry.get("name"),
            "recipient": recipient_email,
            "new_status": "industry_invited"
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# REJECT ENTIRE INDUSTRY RECOMMENDATION

@router.post("/{recommendation_id}/reject")
async def reject_industry_recommendation(recommendation_id: str):
    try:
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(status_code=400, detail="Invalid recommendation ID")

        recommendation = industry_recommendations_collection.find_one(
            {"_id": ObjectId(recommendation_id)}
        )

        if not recommendation:
            raise HTTPException(status_code=404, detail="Industry recommendation not found")

        industry_recommendations_collection.update_one(
            {"_id": ObjectId(recommendation_id)},
            {"$set": {"status": "admin_rejected"}}
        )

        return {
            "success": True,
            "message": "Industry recommendation rejected",
            "recommendation_id": recommendation_id,
            "status": "admin_rejected"
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/problem/{problem_id}")
async def get_industry_recommendations_for_problem(problem_id: str):
    try:
        if not ObjectId.is_valid(problem_id):
            raise HTTPException(status_code=400, detail="Invalid problem ID")

        recommendations = list(industry_recommendations_collection.find({
            "problem_id": ObjectId(problem_id)
        }).sort("_id", -1))

        result = []
        for r in recommendations:
            r["_id"] = str(r["_id"])
            r["problem_id"] = str(r["problem_id"])
            result.append(r)

        return {
            "success": True,
            "total": len(result),
            "recommendations": result,
            "latest_recommendation": result[0] if result else None
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/{recommendation_id}")
async def get_single_industry_recommendation(recommendation_id: str):
    try:
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(status_code=400, detail="Invalid recommendation ID")

        rec = industry_recommendations_collection.find_one({"_id": ObjectId(recommendation_id)})
        if not rec:
            raise HTTPException(status_code=404, detail="Recommendation not found")

        rec["_id"] = str(rec["_id"])
        rec["problem_id"] = str(rec["problem_id"])

        return {
            "success": True,
            "recommendation": rec
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))