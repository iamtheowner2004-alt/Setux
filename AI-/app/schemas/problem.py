from pydantic import BaseModel, Field
from typing import List


from typing import Optional

class ProblemRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    description: str = Field(..., min_length=5)
    location: Optional[str] = ""
    address: Optional[str] = ""
    submittedBy: Optional[str] = None
    images: Optional[List[str]] = []
    videos: Optional[List[str]] = []
    documents: Optional[List[str]] = []


class ProblemAnalysis(BaseModel):
    summary: str
    category: str
    subcategory: str
    severity: str
    priority_score: int = Field(..., ge=1, le=100)
    keywords: List[str]
    required_expertise: List[str]