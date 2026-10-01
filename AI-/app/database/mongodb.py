import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "societal_innovation")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is missing in .env file")

client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000
)

database = client[DATABASE_NAME]

problems_collection = database["problems"]
universities_collection = database["universities"]
industry_recommendations_collection = database["industry_recommendations"]
government_reports_collection = database["government_reports"]
solutions_collection = database["solutions"]
users_collection = database["users"]