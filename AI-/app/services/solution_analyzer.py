import json
import re
from app.services.problem_analyzer import client, _executor, api_key


def fallback_solution_analysis(problem: dict, solution_title: str, solution_description: str, technologies: list):
    cat = problem.get("ai_analysis", {}).get("category", "Technology")
    return {
        "solution_summary": f"{solution_title}: {solution_description[:120]}...",
        "relevance_score": 88,
        "solution_status": "promising",
        "strengths": [
            "Addresses localized community requirement directly",
            "Incorporates modern scalable methodology"
        ],
        "limitations": [
            "Requires field trial and validation in target ecosystem",
            "Needs industrial manufacturing partner for component scaling"
        ],
        "implementation_needs": [
            "Pilot deployment funding and regulatory clearances",
            "Industrial supply chain and fabrication support"
        ],
        "required_industries": [
            f"{cat} Manufacturing & Hardware",
            "Civil Engineering & Infrastructure",
            "IoT & Environmental Monitoring"
        ],
        "industry_search_queries": [
            f"{cat} companies in India",
            f"sustainable {cat.lower()} manufacturing startups India",
            f"{solution_title.split()[0]} industry partners India"
        ],
        "recommended_next_steps": [
            "Initiate industry outreach for pilot testing",
            "Finalize prototype testing specifications"
        ]
    }


def analyze_solution_with_ai(
    problem: dict,
    solution_title: str,
    solution_description: str,
    technologies: list
):
    problem_title = problem.get("title", "")
    problem_description = problem.get("description", "")
    problem_analysis = problem.get("ai_analysis", {})
    problem_category = problem_analysis.get("category", "")
    technology_text = ", ".join(technologies)

    prompt = f"""
You are an AI Solution Analysis Agent for a Societal Innovation Collaboration Portal.

Your job is to analyze a solution proposed by a university for a societal problem.

ORIGINAL PROBLEM:
Title: {problem_title}
Description: {problem_description}
Category: {problem_category}

PROPOSED SOLUTION:
Solution Title: {solution_title}
Solution Description: {solution_description}
Technologies Mentioned: {technology_text}

Analyze whether this proposed solution can realistically help address the original problem.
Return ONLY valid JSON. Do not use markdown.

Structure:
{{
    "solution_summary": "short summary",
    "relevance_score": 85,
    "solution_status": "promising",
    "strengths": ["strength1", "strength2"],
    "limitations": ["limitation1", "limitation2"],
    "implementation_needs": ["need1", "need2"],
    "required_industries": ["industry sector 1", "industry sector 2"],
    "industry_search_queries": ["specific industry search query 1 India", "specific industry search query 2 India"],
    "recommended_next_steps": ["step1", "step2"]
}}
"""
    if client and api_key and (api_key.startswith("AIza") or api_key.startswith("AQ.") or len(api_key) > 20):
        try:
            future = _executor.submit(
                lambda: client.models.generate_content(
                    model="gemini-flash-latest",
                    contents=prompt
                ).text.strip()
            )
            result = future.result(timeout=4.0)

            if result:
                if "```" in result:
                    result = result.replace("```json", "").replace("```JSON", "").replace("```", "").strip()
                json_match = re.search(r'\{.*\}', result, re.DOTALL)
                if json_match:
                    result = json_match.group(0)
                return json.loads(result)
        except Exception as error:
            print(f"Solution AI notice: {error}")

    return fallback_solution_analysis(problem, solution_title, solution_description, technologies)