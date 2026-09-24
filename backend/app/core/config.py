from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# ---------------------------------------------------------
# Backend base directory
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

# backend/data/
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):

    APP_NAME: str = "TeleGlobal Digital Card Platform"
    APP_VERSION: str = "1.0.0"

    DEBUG: bool = True

    SECRET_KEY: str = "change-this-secret-key-in-production"

    DATABASE_URL: str = (
        f"sqlite:///{(DATA_DIR / 'digital_card.db').as_posix()}"
    )

    # -----------------------------------------------------
    # Digital Card / QR configuration
    # -----------------------------------------------------
    #
    # IMPORTANT:
    # This must be the URL that a mobile phone can actually
    # access.
    #
    # Local network example:
    # http://10.11.12.182:8000
    #
    # Production example:
    # https://cards.teleglobals.com
    #
    CARD_BASE_URL: str = "http://10.11.12.182:8000"

    SESSION_COOKIE_NAME: str = "teleglobal_session"

    UPLOAD_DIR: str = str(BASE_DIR / "uploads")

    QR_CODE_DIR: str = str(BASE_DIR / "qr_codes")

    MAX_UPLOAD_SIZE_MB: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()


# ---------------------------------------------------------
# Resolve relative paths
# ---------------------------------------------------------

def _resolve_backend_path(value: str) -> str:

    path = Path(value)

    if path.is_absolute():
        return str(path)

    return str(BASE_DIR / path)


settings.UPLOAD_DIR = _resolve_backend_path(
    settings.UPLOAD_DIR
)

settings.QR_CODE_DIR = _resolve_backend_path(
    settings.QR_CODE_DIR
)


# ---------------------------------------------------------
# Resolve SQLite database path
# ---------------------------------------------------------

if settings.DATABASE_URL.startswith("sqlite:///./"):

    database_path = settings.DATABASE_URL.removeprefix(
        "sqlite:///./"
    )

    settings.DATABASE_URL = (
        f"sqlite:///"
        f"{(BASE_DIR / database_path).as_posix()}"
    )