import os


class Settings:
    APP_NAME = "Try Find Me! — OSINT"
    APP_ENV = os.getenv("APP_ENV", "development")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
