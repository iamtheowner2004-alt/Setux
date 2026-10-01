from fastapi import APIRouter, HTTPException

from app.services.openalex_service import (
    search_openalex_india,
    extract_indian_institutions
)

from app.services.university_filter import (
    filter_higher_education_institutions
)

from app.services.official_source_verifier import (
    verify_university_sources
)

from app.services.university_matcher import (
    rank_universities
)


router = APIRouter(
    prefix="/api/research",
    tags=["Research Discovery"]
)


@router.get("/match-universities")
async def match_universities(
    query: str,
    per_page: int = 25
):

    try:

        # --------------------------
        # STEP 1
        # Search OpenAlex
        # --------------------------

        data = search_openalex_india(
            query=query,
            per_page=per_page
        )


        # --------------------------
        # STEP 2
        # Extract institutions
        # --------------------------

        institutions = (
            extract_indian_institutions(
                data
            )
        )


        # --------------------------
        # STEP 3
        # Keep HEIs
        # --------------------------

        universities = (
            filter_higher_education_institutions(
                institutions
            )
        )


        # --------------------------
        # STEP 4
        # Get official source
        # --------------------------

        enriched_universities = (
            verify_university_sources(
                universities
            )
        )


        # --------------------------
        # STEP 5
        # Rank universities
        # --------------------------

        ranked_universities = (
            rank_universities(
                enriched_universities
            )
        )


        return {
            "success": True,
            "query": query,

            "total_institutions_found":
                len(institutions),

            "total_heis_found":
                len(universities),

            "top_universities":
                ranked_universities[:5]
        }


    except Exception as error:

        print("UNIVERSITY MATCH ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )