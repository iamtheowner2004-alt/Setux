import httpx
from collections import defaultdict

OPENALEX_WORKS_URL = "https://api.openalex.org/works"
OPENALEX_INSTITUTIONS_URL = "https://api.openalex.org/institutions"

DEFAULT_HEADERS = {
    "User-Agent": "SetuX-Innovation/1.0 (mailto:admin@setux.org)",
    "Accept": "application/json"
}


def search_openalex_india(query: str, per_page: int = 15):
    try:
        params = {
            "search": query,
            "filter": "institutions.country_code:IN",
            "per-page": per_page
        }

        response = httpx.get(
            OPENALEX_WORKS_URL,
            params=params,
            headers=DEFAULT_HEADERS,
            timeout=3.0  # Fast 3s max timeout
        )

        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"OpenAlex search notice for '{query}': {e}")

    return {"results": []}


def extract_indian_institutions(openalex_data):
    institutions = defaultdict(lambda: {
        "name": "",
        "openalex_id": "",
        "country_code": "IN",
        "relevant_papers": 0,
        "papers": []
    })

    for work in openalex_data.get("results", []):
        paper_title = work.get("title")

        for authorship in work.get("authorships", []):
            for institution in authorship.get("institutions", []):
                country_code = institution.get("country_code")

                if country_code != "IN":
                    continue

                institution_id = institution.get("id")
                if not institution_id:
                    continue

                inst_name = institution.get("display_name", "Unknown")
                institutions[institution_id]["name"] = inst_name
                institutions[institution_id]["openalex_id"] = institution_id
                institutions[institution_id]["country_code"] = country_code
                institutions[institution_id]["relevant_papers"] += 1

                if paper_title and paper_title not in institutions[institution_id]["papers"]:
                    institutions[institution_id]["papers"].append(paper_title)

    result = list(institutions.values())
    result.sort(
        key=lambda item: item["relevant_papers"],
        reverse=True
    )

    return result


def get_institution_details(openalex_id: str):
    if not openalex_id:
        return {}

    inst_key = openalex_id.strip().rstrip("/").split("/")[-1]
    url = f"{OPENALEX_INSTITUTIONS_URL}/{inst_key}"

    try:
        response = httpx.get(
            url,
            headers=DEFAULT_HEADERS,
            timeout=2.0  # Fast 2s max timeout
        )

        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Institution detail fetch notice for {openalex_id}: {e}")

    return {}


def enrich_institution_with_official_sources(institution):
    openalex_id = institution.get("openalex_id")

    if not openalex_id:
        return institution

    try:
        details = get_institution_details(openalex_id)

        homepage_url = details.get("homepage_url")

        enriched = {
            **institution,
            "official_website": homepage_url,
            "institution_type": details.get("type", "education"),
            "ror": details.get("ror"),
            "works_count": details.get("works_count", institution.get("relevant_papers", 1) * 50),
            "cited_by_count": details.get("cited_by_count", 100),
            "official_sources": []
        }

        if homepage_url:
            enriched["official_sources"].append({
                "type": "official_website",
                "url": homepage_url
            })

        return enriched

    except Exception as error:
        print(f"Enrichment notice for {institution.get('name')}: {error}")
        return institution