import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    groq_api_key: str=os.getenv("GROQ_API_KEY", "")
    host: str=os.getenv("HOST", "0.0.0.0")
    port: int=int(os.getenv("PORT", 8000))
    default_model: str="llama-3.3-70b-versatile"
    fallback_model: str="llama-3.1-8b-instant"
    max_steps_limit: int=25

settings=Settings()
