from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.routers.problem import router as problem_router
from app.routers.university import router as university_router
from app.routers.research import router as research_router
from app.routers.admin import router as admin_router
from app.routers.solution import router as solution_router
from app.routers.industry import router as industry_router  
from app.routers.admin_industry import router as admin_industry_router 
from app.routers.industry_response import router as industry_response_router
from app.routers.government import router as government_router
from app.database.mongodb import client


app = FastAPI(
    title="Societal Innovation AI Agent",
    description="AI agent for analyzing societal challenges",
    version="1.0.0"
)

# Enable CORS for frontend and cross-service communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(problem_router)
app.include_router(university_router) 
app.include_router(research_router)
app.include_router(admin_router)
app.include_router(admin_industry_router)
app.include_router(industry_response_router)
app.include_router(solution_router)
app.include_router(industry_router)
app.include_router(government_router)

@app.get("/")
def home():
    return {
        "message": "Societal Innovation AI Agent is running"
    }


@app.get("/health")
def health():
    try:
        client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as error:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(error)
        }