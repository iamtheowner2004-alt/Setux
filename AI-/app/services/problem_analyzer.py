import os
import json
import time
import re
import concurrent.futures
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load .env explicitly from AI- directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = None
if api_key and (api_key.startswith("AIza") or len(api_key) > 20):
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Gemini Client init notice: {e}")

_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)


def fallback_analyze_problem(title: str, description: str, location: str):
    """
    Instant rule-based & keyword extraction analyzer when LLM API is experiencing latency, invalid key, or 503 spikes.
    """
    text = f"{title} {description}".lower()

    category_map = {
        "Water Management": ["water", "groundwater", "drinking", "pipeline", "sewage", "drainage", "tap", "purification", "contamination"],
        "Sanitation": ["sanitation", "garbage", "waste", "trash", "dumping", "cleanliness", "toilet", "hygiene"],
        "Healthcare": ["health", "hospital", "clinic", "disease", "medical", "doctor", "medicine", "dengue", "malaria"],
        "Environment": ["pollution", "air", "smog", "trees", "forest", "toxic", "emission", "climate", "dust"],
        "Energy": ["power", "electricity", "solar", "blackout", "grid", "voltage", "energy", "renewable"],
        "Agriculture": ["crop", "farmer", "agriculture", "soil", "fertilizer", "pest", "irrigation", "farming"],
        "Urban Development": ["road", "pothole", "traffic", "bridge", "street light", "infrastructure", "footpath", "construction"],
        "Education": ["school", "college", "education", "student", "teacher", "books", "classroom", "literacy"],
        "Accessibility": ["disability", "elderly", "wheelchair", "ramp", "accessible", "blind", "pedestrian"],
        "Rural Livelihoods": ["livelihood", "village", "rural", "employment", "handicraft", "dairy", "livestock"]
    }

    matched_category = "Urban Development"
    for cat, keywords in category_map.items():
        if any(kw in text for kw in keywords):
            matched_category = cat
            break

    high_urgency_words = ["danger", "death", "critical", "severe", "urgent", "hazard", "poison", "toxic", "collapse", "crisis", "outbreak", "vomiting", "infection"]
    med_urgency_words = ["bad", "poor", "broken", "leak", "delay", "smell", "problem", "frequent", "damage", "affecting"]

    if any(w in text for w in high_urgency_words):
        severity = "Critical"
        priority_score = 88
    elif any(w in text for w in med_urgency_words):
        severity = "High"
        priority_score = 75
    else:
        severity = "Medium"
        priority_score = 60

    words = re.findall(r'\b[a-zA-Z]{4,}\b', f"{title} {description}")
    stopwords = {"this", "that", "with", "from", "have", "there", "their", "about", "which", "could", "should", "would", "these", "those", "being", "where", "please", "issue", "problem", "water"}
    filtered_keywords = [w.title() for w in words if w.lower() not in stopwords]
    unique_keywords = list(dict.fromkeys(filtered_keywords))[:5]
    if not unique_keywords:
        unique_keywords = [matched_category, "Community Action", "Public Infrastructure"]

    clean_title = title.replace(":", " ").replace("-", " ").strip()
    first_word = clean_title.split()[0] if clean_title.split() else "Community"
    research_queries = [
        f"{matched_category} solutions India",
        f"{first_word} technology intervention India",
        f"sustainable {matched_category.lower()} innovations India"
    ]

    return {
        "summary": f"{title}: {description[:130]}...",
        "category": matched_category,
        "subcategory": f"{matched_category} Technology & Infrastructure",
        "severity": severity,
        "priority_score": priority_score,
        "keywords": unique_keywords,
        "required_expertise": [
            f"{matched_category} Engineering",
            "Public Infrastructure & Policy",
            "Applied Community Technology"
        ],
        "research_queries": research_queries
    }


def _raw_gemini_call(prompt: str):
    if not client:
        return None
    for m in ["gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]:
        try:
            response = client.models.generate_content(
                model=m,
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            continue
    return None


def analyze_problem_with_ai(
    title: str,
    description: str,
    location: str
):
    prompt = f"""
You are an AI agent for the SetuX Societal Innovation Collaboration Portal.

Your task is to analyze a societal problem submitted by a citizen.

Problem Title:
{title}

Problem Description:
{description}

Location:
{location}

Return ONLY valid JSON.
Do not use markdown formatting.
Do not add explanations before or after the JSON.

Use exactly this structure:
{{
    "summary": "short clear summary of the problem",
    "category": "main societal category",
    "subcategory": "specific category",
    "severity": "Low, Medium, High, or Critical",
    "priority_score": 75,
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "required_expertise": ["expertise1", "expertise2"],
    "research_queries": ["specific academic research query 1", "specific academic research query 2", "specific academic research query 3"]
}}
"""
    if client and api_key and (api_key.startswith("AIza") or api_key.startswith("AQ.") or len(api_key) > 20):
        try:
            result = _raw_gemini_call(prompt)

            if result:
                if "```" in result:
                    result = result.replace("```json", "").replace("```JSON", "").replace("```", "").strip()

                json_match = re.search(r'\{.*\}', result, re.DOTALL)
                if json_match:
                    result = json_match.group(0)

                parsed = json.loads(result)
                if "category" in parsed and "priority_score" in parsed:
                    return parsed
        except Exception as error:
            print(f"Gemini AI notice: {error}")

    return fallback_analyze_problem(title, description, location)


def generate_problem_embedding(text: str):
    embedding_text = text if isinstance(text, str) else str(text)

    if client and api_key and (api_key.startswith("AIza") or api_key.startswith("AQ.") or len(api_key) > 20):
        try:
            future = _executor.submit(
                lambda: client.models.embed_content(
                    model="gemini-embedding-001",
                    contents=embedding_text
                )
            )
            response = future.result(timeout=2.5)

            if response and response.embeddings and len(response.embeddings) > 0:
                return response.embeddings[0].values
        except Exception as e:
            print(f"Embedding notice: {e}")

    # Deterministic fast text embedding vector (length 128)
    import hashlib
    h = hashlib.sha256(embedding_text.encode('utf-8')).hexdigest()
    vec = [(int(h[i % len(h)], 16) - 8) / 8.0 for i in range(128)]
    return vec