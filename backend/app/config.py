from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # MongoDB
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "ai_secure_qa"
    class Config:
        env_file = ".env"


settings = Settings()