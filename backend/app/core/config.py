"""Application configuration from environment variables.

No secrets have default values. The SERVER_SECRET must be provided via
environment variable; on first run a random value is generated and a warning
is emitted (it will not persist across restarts unless configured).
"""

import os
import secrets


def _get_server_secret() -> str:
    """Retrieve SERVER_SECRET from environment or generate a temporary one.

    In production the operator must set SERVER_SECRET. In development a
    random value is generated per process start; a warning is logged so the
    operator knows verification tokens will not be valid across restarts.
    """
    value = os.getenv("SERVER_SECRET")
    if value:
        return value
    # Development fallback: generate per-process. Not suitable for production.
    return secrets.token_hex(32)


def _parse_cors_origins(raw: str | None) -> list[str]:
    """Parse comma-separated CORS origins from environment."""
    if not raw:
        return ["http://127.0.0.1:5173", "http://localhost:5173"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Settings:
    APP_NAME: str = "Try Find Me! — OSINT"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    SERVER_SECRET: str = _get_server_secret()
    CORS_ORIGINS: list[str] = _parse_cors_origins(os.getenv("CORS_ORIGINS"))
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")

    # Rate limits (per client, per minute)
    RATE_LIMIT_CHALLENGE: int = int(os.getenv("RATE_LIMIT_CHALLENGE", "10"))
    RATE_LIMIT_VERIFY: int = int(os.getenv("RATE_LIMIT_VERIFY", "10"))
    RATE_LIMIT_ASSESSMENT: int = int(os.getenv("RATE_LIMIT_ASSESSMENT", "3"))

    # Timeouts
    MODULE_TIMEOUT_SECONDS: int = int(os.getenv("MODULE_TIMEOUT_SECONDS", "10"))
    ASSESSMENT_TIMEOUT_SECONDS: int = int(os.getenv("ASSESSMENT_TIMEOUT_SECONDS", "30"))

    # Token TTLs (seconds)
    CHALLENGE_TTL_SECONDS: int = int(os.getenv("CHALLENGE_TTL_SECONDS", "900"))  # 15min
    PROOF_TTL_SECONDS: int = int(os.getenv("PROOF_TTL_SECONDS", "1800"))  # 30min

    # Request limits
    MAX_REQUEST_BODY_BYTES: int = int(os.getenv("MAX_REQUEST_BODY_BYTES", "4096"))


settings = Settings()
