import os

class Settings:
    PROJECT_NAME: str = "AI Work Scheduler"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hackathon-ai-work-scheduler-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./scheduler.db")
    
    # Scheduling weights (Configurable)
    WEIGHT_SKILL: float = 0.30
    WEIGHT_DEPARTMENT: float = 0.20
    WEIGHT_AVAILABILITY: float = 0.20
    WEIGHT_EXPERIENCE: float = 0.10
    WEIGHT_WORKLOAD: float = 0.10
    WEIGHT_SCHEDULE_FIT: float = 0.10

    # Optional AI LLM API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

settings = Settings()
