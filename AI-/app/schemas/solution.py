from pydantic import BaseModel
from typing import List


class SolutionRequest(
    BaseModel
):

    problem_id: str

    solution_title: str

    solution_description: str

    technologies: List[str]