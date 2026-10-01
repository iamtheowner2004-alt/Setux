import json
import re
from datetime import datetime
from bson import ObjectId

from app.services.problem_analyzer import client, _executor, api_key
from app.database.mongodb import (
    problems_collection,
    government_reports_collection,
    industry_recommendations_collection
)


# =====================================================
# FALLBACK REPORT (when AI is unavailable)
# =====================================================

def fallback_government_report(problem, recommendation, industry_response, escalation_reason="all_failed"):
    title = problem.get("title", "Societal Challenge")
    location = problem.get("location", problem.get("address", "India"))
    category = problem.get("ai_analysis", {}).get("category", "Civic & Infrastructure")
    severity = problem.get("ai_analysis", {}).get("severity", "High")

    sol = {}
    if recommendation:
        sol = recommendation.get("solution", {})
    sol_title = sol.get("solution_title", "Academic Research Prototype")

    if escalation_reason == "university_rejected":
        industry_text = "Industry partnership phase was not reached as university collaboration failed."
        reason = (
            "All university institutions contacted through the SetuX academic outreach pipeline "
            "declined the research collaboration. The problem requires direct government-sponsored "
            "R&D funding and a state-supported municipal pilot deployment."
        )
    elif escalation_reason == "all_failed":
        industry_text = (
            f"Public-Private Partnership outreach was conducted with verified Indian industrial "
            f"partners. Commercial partner declined due to: {industry_response}."
        )
        reason = (
            "Both academic institutional collaboration and industrial market mechanisms failed to "
            "resolve the societal bottleneck. Public authority intervention, state-sponsored "
            "municipal pilot funding, and direct government R&D allocation are required to "
            "implement and field-test the validated academic solution."
        )
    else:
        industry_text = f"Industry response: {industry_response}"
        reason = "No viable private-sector solution pathway was established. Government intervention required."

    return {
        "report_title": f"Executive Government Policy Briefing: {title}",
        "escalation_date": datetime.now().strftime("%d %B %Y"),
        "problem_location": location,
        "problem_category": category,
        "severity_level": severity,
        "problem_summary": (
            f"A verified civic challenge titled '{title}' was reported from {location}. "
            f"The problem falls under the {category} domain and has been assessed at {severity} severity. "
            f"Community-level impact requires coordinated technological and policy resolution."
        ),
        "solution_summary": (
            f"Partner university researched and submitted the academic solution '{sol_title}'. "
            f"Prototyping and technical validation were completed at the academic level. "
            f"The solution is deployment-ready pending government-level field trials."
        ),
        "industry_outreach_summary": industry_text,
        "reason_for_escalation": reason,
        "recommended_government_actions": [
            f"Allocate Special Purpose Vehicle (SPV) or municipal innovation grant for field trial of '{sol_title}'",
            f"Direct the State {category} Department to facilitate physical site testing in {location}",
            "Incorporate validated university research findings into upcoming regional public works tenders",
            "Commission an independent government-appointed technical committee to oversee pilot deployment",
            "Notify concerned Gram Panchayat / Ward Committee and District Magistrate for on-ground facilitation"
        ],
        "suggested_authority_type": _suggest_authority(category),
        "suggested_ministry": _suggest_ministry(category),
        "urgency": severity if severity in ["Critical", "High", "Medium"] else "High",
        "escalation_reason_code": escalation_reason
    }


def _suggest_authority(category):
    mapping = {
        "Water": "State Water Resources Department / Jal Shakti Ministry",
        "Agriculture": "Ministry of Agriculture & Farmers Welfare / State Agriculture Department",
        "Urban": "Ministry of Housing and Urban Affairs / Smart Cities Mission",
        "Rural": "Ministry of Rural Development / District Rural Development Agency",
        "Health": "Ministry of Health and Family Welfare / State NHM",
        "Education": "Ministry of Education / State Education Department",
        "Environment": "Ministry of Environment, Forest and Climate Change / State SPCB",
        "Transport": "Ministry of Road Transport / State PWD",
        "Energy": "Ministry of New and Renewable Energy / State DISCOM",
    }
    for key, val in mapping.items():
        if key.lower() in category.lower():
            return val
    return "Ministry of Housing and Urban Affairs / District Administration"


def _suggest_ministry(category):
    mapping = {
        "Water": "Jal Shakti Ministry",
        "Agriculture": "Ministry of Agriculture & Farmers Welfare",
        "Urban": "Ministry of Housing and Urban Affairs",
        "Rural": "Ministry of Rural Development",
        "Health": "Ministry of Health and Family Welfare",
        "Education": "Ministry of Education",
        "Environment": "Ministry of Environment, Forest and Climate Change",
        "Transport": "Ministry of Road Transport & Highways",
        "Energy": "Ministry of New and Renewable Energy",
    }
    for key, val in mapping.items():
        if key.lower() in category.lower():
            return val
    return "Ministry of Science and Technology"


# =====================================================
# AI-POWERED GOVERNMENT REPORT GENERATOR
# =====================================================

def generate_government_report(
    problem,
    recommendation,
    industry_response,
    escalation_reason="all_failed"
):
    location = problem.get("location", problem.get("address", "India"))
    category = problem.get("ai_analysis", {}).get("category", "Civic & Infrastructure")
    severity = problem.get("ai_analysis", {}).get("severity", "High")

    sol = {}
    if recommendation:
        sol = recommendation.get("solution", {})

    prompt = f"""
You are an AI Government Escalation Policy Agent for the SetuX Societal Innovation Collaboration Portal.

ORIGINAL SOCIETAL PROBLEM:
Title: {problem.get("title", "")}
Description: {problem.get("description", "")}
Location: {location}
Category: {category}
Severity: {severity}

UNIVERSITY SOLUTION SUBMITTED:
Solution Title: {sol.get("solution_title", "Academic Research Prototype")}
Solution Description: {sol.get("solution_description", "Technical academic solution developed")}
Technologies: {sol.get("technologies", [])}

ESCALATION REASON: {escalation_reason}
INDUSTRY/PATHWAY RESPONSE: {industry_response}

Prepare a formal executive policy escalation briefing for the Indian government authority.
Return ONLY valid JSON (no markdown, no ```):
{{
    "report_title": "Executive Government Policy Briefing: [problem title]",
    "escalation_date": "{datetime.now().strftime('%d %B %Y')}",
    "problem_location": "{location}",
    "problem_category": "{category}",
    "severity_level": "{severity}",
    "problem_summary": "2-3 sentence civic impact summary",
    "solution_summary": "2-3 sentence university solution summary and deployment readiness",
    "industry_outreach_summary": "What industry outreach was done and what was the outcome",
    "reason_for_escalation": "Detailed reason why government must intervene now",
    "recommended_government_actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
    "suggested_authority_type": "Specific Ministry / Department / State Body",
    "suggested_ministry": "Primary central ministry",
    "urgency": "Critical|High|Medium",
    "escalation_reason_code": "{escalation_reason}"
}}
"""
    if client and api_key and (api_key.startswith("AIza") or api_key.startswith("AQ.") or len(api_key) > 20):
        for model in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                future = _executor.submit(
                    lambda m=model: client.models.generate_content(
                        model=m,
                        contents=prompt
                    ).text.strip()
                )
                result = future.result(timeout=12.0)
                if result:
                    # Strip markdown fences
                    result = re.sub(r"```json|```JSON|```", "", result).strip()
                    json_match = re.search(r'\{.*\}', result, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        parsed["escalation_date"] = datetime.now().strftime("%d %B %Y")
                        return parsed
            except Exception as error:
                print(f"Government Report AI ({model}) notice: {error}")

    return fallback_government_report(problem, recommendation, industry_response, escalation_reason)


# =====================================================
# AUTO-ESCALATE FROM INDUSTRY RECOMMENDATION
# =====================================================

def automatically_escalate_to_government(
    recommendation_id: str,
    escalation_reason: str = "all_failed"
):
    recommendation = industry_recommendations_collection.find_one(
        {"_id": ObjectId(recommendation_id)}
    )

    if not recommendation:
        raise ValueError("Industry recommendation not found")

    problem = problems_collection.find_one(
        {"_id": recommendation["problem_id"]}
    )

    if not problem:
        raise ValueError("Original problem not found")

    industry_response = recommendation.get("industry_response", "declined")

    # Generate AI government report
    report = generate_government_report(
        problem=problem,
        recommendation=recommendation,
        industry_response=industry_response,
        escalation_reason=escalation_reason
    )

    # Save report in MongoDB
    report_document = {
        "problem_id": recommendation["problem_id"],
        "recommendation_id": ObjectId(recommendation_id),
        "report": report,
        "status": "pending_government_review",
        "escalation_reason": escalation_reason,
        "escalation_timestamp": datetime.now().isoformat(),
        "escalated_by": "SetuX AI Multi-Agent Pipeline"
    }

    save_result = government_reports_collection.insert_one(report_document)

    # Update recommendation and problem status
    industry_recommendations_collection.update_one(
        {"_id": ObjectId(recommendation_id)},
        {"$set": {"status": "escalated_to_government"}}
    )

    problems_collection.update_one(
        {"_id": recommendation["problem_id"]},
        {
            "$set": {
                "status": "escalated_to_government",
                "government_report_id": str(save_result.inserted_id),
                "escalation_timestamp": datetime.now().isoformat()
            }
        }
    )

    return {
        "government_report_id": str(save_result.inserted_id),
        "status": "pending_government_review",
        "report": report
    }


# =====================================================
# ESCALATE DIRECTLY FROM PROBLEM ID (University failure path)
# =====================================================

def escalate_from_problem(
    problem_id: str,
    escalation_reason: str = "university_rejected"
):
    problem = problems_collection.find_one({"_id": ObjectId(problem_id)})

    if not problem:
        raise ValueError("Problem not found")

    # Generate report with no industry recommendation
    report = generate_government_report(
        problem=problem,
        recommendation=None,
        industry_response="N/A — escalated before industry phase",
        escalation_reason=escalation_reason
    )

    report_document = {
        "problem_id": ObjectId(problem_id),
        "recommendation_id": None,
        "report": report,
        "status": "pending_government_review",
        "escalation_reason": escalation_reason,
        "escalation_timestamp": datetime.now().isoformat(),
        "escalated_by": "SetuX AI Multi-Agent Pipeline"
    }

    save_result = government_reports_collection.insert_one(report_document)

    problems_collection.update_one(
        {"_id": ObjectId(problem_id)},
        {
            "$set": {
                "status": "escalated_to_government",
                "government_report_id": str(save_result.inserted_id),
                "escalation_timestamp": datetime.now().isoformat()
            }
        }
    )

    return {
        "government_report_id": str(save_result.inserted_id),
        "status": "pending_government_review",
        "report": report
    }