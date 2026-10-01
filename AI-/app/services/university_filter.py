def is_higher_education_institution(institution):

    name = institution.get("name", "").lower()

    hei_keywords = [
        "university",
        "institute of technology",
        "iit",
        "national institute of technology",
        "nit",
        "indian institute of science",
        "college",
        "school of",
        "academy"
    ]

    excluded_keywords = [
        "hospital",
        "private limited",
        "pvt",
        "ltd",
        "company",
        "corporation",
        "laboratory",
        "laboratories"
    ]

    # Exclude obvious non-HEIs
    for keyword in excluded_keywords:
        if keyword in name:
            return False

    # Include likely HEIs
    for keyword in hei_keywords:
        if keyword in name:
            return True

    return False


def filter_higher_education_institutions(institutions):

    filtered = []

    for institution in institutions:

        if is_higher_education_institution(institution):
            filtered.append(institution)

    return filtered