from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime

from app.database.mongodb import (
    problems_collection,
    industry_recommendations_collection,
    government_reports_collection
)

from app.services.government_agent import (
    generate_government_report,
    automatically_escalate_to_government,
    escalate_from_problem
)


router = APIRouter(
    prefix="/api/government",
    tags=["Government Escalation Agent"]
)


# =====================================================
# ESCALATE FROM INDUSTRY RECOMMENDATION (Industry declined)
# =====================================================

@router.post("/escalate/{recommendation_id}")
async def escalate_to_government(
    recommendation_id: str,
    escalation_reason: str = Query(
        default="all_failed",
        description="Reason code: all_failed | university_rejected | industry_declined"
    )
):
    try:
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(status_code=400, detail="Invalid recommendation ID")

        recommendation = industry_recommendations_collection.find_one(
            {"_id": ObjectId(recommendation_id)}
        )

        if not recommendation:
            raise HTTPException(status_code=404, detail="Industry recommendation not found")

        # Allow escalation from any failure-state
        allowed_statuses = [
            "industry_declined",
            "pending_next_industry",
            "admin_rejected",
            "all_industries_declined",
            "industry_approved",  # admin manually escalating
            "industry_invited",   # admin manually escalating
            "escalated_to_government",  # regenerate report
        ]

        current_status = recommendation.get("status", "")
        # We allow manual override escalation in all cases
        # but log if it seems unusual
        if current_status not in allowed_statuses:
            print(f"[GOV ESCALATION] Manual override escalation from status: {current_status}")

        problem = problems_collection.find_one(
            {"_id": recommendation["problem_id"]}
        )

        if not problem:
            raise HTTPException(status_code=404, detail="Original problem not found")

        industry_response = recommendation.get("industry_response", "not_interested")

        # Generate AI government report
        report = generate_government_report(
            problem=problem,
            recommendation=recommendation,
            industry_response=industry_response,
            escalation_reason=escalation_reason
        )

        # Save report (upsert)
        existing = government_reports_collection.find_one(
            {"problem_id": recommendation["problem_id"]}
        )

        if existing:
            government_reports_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "report": report,
                        "status": "pending_government_review",
                        "escalation_reason": escalation_reason,
                        "updated_at": datetime.now().isoformat()
                    }
                }
            )
            report_id = str(existing["_id"])
        else:
            save_result = government_reports_collection.insert_one({
                "problem_id": recommendation["problem_id"],
                "recommendation_id": ObjectId(recommendation_id),
                "report": report,
                "status": "pending_government_review",
                "escalation_reason": escalation_reason,
                "escalation_timestamp": datetime.now().isoformat(),
                "escalated_by": "Admin (SetuX HITL)"
            })
            report_id = str(save_result.inserted_id)

        # Update recommendation & problem
        industry_recommendations_collection.update_one(
            {"_id": ObjectId(recommendation_id)},
            {"$set": {"status": "escalated_to_government"}}
        )

        problems_collection.update_one(
            {"_id": recommendation["problem_id"]},
            {
                "$set": {
                    "status": "escalated_to_government",
                    "government_report_id": report_id,
                    "escalation_timestamp": datetime.now().isoformat()
                }
            }
        )

        return {
            "success": True,
            "message": "Government escalation report generated and submitted",
            "government_report_id": report_id,
            "status": "pending_government_review",
            "report": report
        }

    except HTTPException:
        raise
    except Exception as error:
        print("GOVERNMENT AGENT ERROR:", error)
        raise HTTPException(status_code=500, detail=str(error))


# =====================================================
# ESCALATE DIRECTLY FROM PROBLEM ID (University failure path)
# =====================================================

@router.post("/escalate-problem/{problem_id}")
async def escalate_problem_to_government(
    problem_id: str,
    escalation_reason: str = Query(
        default="university_rejected",
        description="Reason: university_rejected | all_failed | manual"
    )
):
    try:
        if not ObjectId.is_valid(problem_id):
            raise HTTPException(status_code=400, detail="Invalid problem ID")

        result = escalate_from_problem(
            problem_id=problem_id,
            escalation_reason=escalation_reason
        )

        return {
            "success": True,
            "message": "Government escalation policy brief generated",
            "government_report_id": result["government_report_id"],
            "status": result["status"],
            "report": result["report"]
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as error:
        print("GOVERNMENT PROBLEM ESCALATION ERROR:", error)
        raise HTTPException(status_code=500, detail=str(error))


# =====================================================
# GET ALL GOVERNMENT REPORTS
# =====================================================

@router.get("/reports")
async def get_all_government_reports():
    try:
        reports = list(government_reports_collection.find().sort("_id", -1))
        for r in reports:
            r["_id"] = str(r["_id"])
            r["problem_id"] = str(r.get("problem_id", ""))
            if r.get("recommendation_id"):
                r["recommendation_id"] = str(r["recommendation_id"])
        return {
            "success": True,
            "count": len(reports),
            "reports": reports
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# =====================================================
# GET GOVERNMENT REPORT FOR A SPECIFIC PROBLEM
# =====================================================

@router.get("/reports/problem/{problem_id}")
async def get_government_report_for_problem(problem_id: str):
    try:
        if not ObjectId.is_valid(problem_id):
            raise HTTPException(status_code=400, detail="Invalid problem ID")

        report = government_reports_collection.find_one(
            {"problem_id": ObjectId(problem_id)},
            sort=[("_id", -1)]  # Latest report for this problem
        )

        if not report:
            return {
                "success": False,
                "message": "No government escalation report found for this problem"
            }

        report["_id"] = str(report["_id"])
        report["problem_id"] = str(report["problem_id"])
        if report.get("recommendation_id"):
            report["recommendation_id"] = str(report["recommendation_id"])

        return {
            "success": True,
            "report": report
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# =====================================================
# UPDATE GOVERNMENT REPORT STATUS (Gov Action Taken)
# =====================================================

@router.patch("/reports/{report_id}/status")
async def update_government_report_status(
    report_id: str,
    status: str = Query(description="New status: under_review | action_taken | implemented | archived")
):
    try:
        if not ObjectId.is_valid(report_id):
            raise HTTPException(status_code=400, detail="Invalid report ID")

        allowed = ["under_review", "action_taken", "implemented", "archived", "pending_government_review"]
        if status not in allowed:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {allowed}")

        result = government_reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"status": status, "status_updated_at": datetime.now().isoformat()}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Government report not found")

        return {
            "success": True,
            "message": f"Government report status updated to '{status}'",
            "report_id": report_id,
            "new_status": status
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))