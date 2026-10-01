from pydantic import BaseModel
from typing import List


class UniversityCreate(BaseModel):
    name: str
    city: str
    state: str
    departments: List[str]
    research_areas: List[str]
    faculty_expertise: List[str]
    labs: List[str]
    innovation_centers: List[str]
    website: str
    contact_email: str