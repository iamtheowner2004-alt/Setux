def calculate_university_score(institution):

    score = 0

    # --------------------------------
    # 1. Related research evidence
    # Maximum 60 points
    # --------------------------------

    relevant_papers = institution.get(
        "relevant_papers",
        0
    )

    research_score = min(
        relevant_papers * 10,
        60
    )

    score += research_score


    # --------------------------------
    # 2. Official source available
    # Maximum 20 points
    # --------------------------------

    official_source_score = 0

    official_website = institution.get(
        "official_website"
    )

    if official_website:
        official_source_score = 20

    score += official_source_score


    # --------------------------------
    # 3. Research activity
    # Maximum 20 points
    # --------------------------------

    works_count = institution.get(
        "works_count",
        0
    )

    activity_score = 0

    if works_count >= 10000:
        activity_score = 20

    elif works_count >= 5000:
        activity_score = 15

    elif works_count >= 1000:
        activity_score = 10

    elif works_count > 0:
        activity_score = 5

    score += activity_score

    return min(score, 100)


def rank_universities(universities):

    ranked = []

    for university in universities:

        score = calculate_university_score(
            university
        )

        university_with_score = {
            **university,
            "match_score": score
        }

        ranked.append(
            university_with_score
        )

    ranked.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return ranked