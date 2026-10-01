import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = None
if api_key and (api_key.startswith("AIza") or len(api_key) > 30):
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Gemini client init notice: {e}")