from app.services.openalex_service import (
    enrich_institution_with_official_sources
)


def verify_university_sources(universities):

    verified_universities = []

    for university in universities:

        enriched_university = (
            enrich_institution_with_official_sources(
                university
            )
        )

        official_website = enriched_university.get(
            "official_website"
        )

        # We only mark source availability here.
        # This does NOT mean the university is manually verified.
        source_available = bool(official_website)

        enriched_university["source_verification"] = {
            "official_source_available": source_available,
            "manual_verification_required": True,
            "verification_status": (
                "source_found"
                if source_available
                else "source_not_found"
            )
        }

        verified_universities.append(
            enriched_university
        )

    return verified_universities