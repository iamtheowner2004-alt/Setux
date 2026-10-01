from pydantic import BaseModel


class IndustrySearchRequest(BaseModel):

    problem_id: str

    solution_title: str

    solution_description: str

    technologies: list[str]