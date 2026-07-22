from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # MongoDB
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB:  str = "ai_secure_qa"

    # JWT
    SECRET_KEY: str = "changeme"

    # Upload de código
    MAX_UPLOAD_SIZE_MB:    int = 25
    ALLOWED_UPLOAD_EXTENSIONS: tuple = (
        ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go",
        ".rb", ".php", ".cs", ".c", ".cpp", ".rs", ".zip",
    )

    class Config:
        env_file = ".env"


settings = Settings()
# Trigger reload