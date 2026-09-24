from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": ".pdf",
}


def ensure_upload_directories():

    directories = [
        Path(settings.UPLOAD_DIR) / "employees",
        Path(settings.UPLOAD_DIR) / "company" / "logo",
        Path(settings.UPLOAD_DIR) / "badges",
        Path(settings.UPLOAD_DIR) / "decks",
        Path(settings.UPLOAD_DIR) / "imports",
        Path(settings.QR_CODE_DIR),
    ]

    for directory in directories:
        directory.mkdir(
            parents=True,
            exist_ok=True,
        )


async def save_employee_picture(
    file: UploadFile,
) -> str:

    ensure_upload_directories()

    extension = ALLOWED_IMAGE_TYPES.get(
        file.content_type
    )

    if not extension:
        raise ValueError(
            "Only JPG, PNG and WEBP images are allowed."
        )

    filename = f"{uuid4().hex}{extension}"

    directory = (
        Path(settings.UPLOAD_DIR)
        / "employees"
    )

    file_path = directory / filename

    content = await file.read()

    max_size = (
        settings.MAX_UPLOAD_SIZE_MB
        * 1024
        * 1024
    )

    if len(content) > max_size:
        raise ValueError(
            "File size exceeds the allowed limit."
        )

    file_path.write_bytes(content)

    return str(file_path)


async def save_company_logo(
    file: UploadFile,
) -> str:

    ensure_upload_directories()

    extension = ALLOWED_IMAGE_TYPES.get(
        file.content_type
    )

    if not extension:
        raise ValueError(
            "Only JPG, PNG and WEBP images are allowed."
        )

    filename = f"{uuid4().hex}{extension}"

    directory = (
        Path(settings.UPLOAD_DIR)
        / "company"
        / "logo"
    )

    file_path = directory / filename

    content = await file.read()
    file_path.write_bytes(content)

    return str(file_path)


async def save_badge_image(
    file: UploadFile,
) -> str:

    ensure_upload_directories()

    extension = ALLOWED_IMAGE_TYPES.get(
        file.content_type
    )

    if not extension:
        raise ValueError(
            "Only JPG, PNG and WEBP images are allowed."
        )

    filename = f"{uuid4().hex}{extension}"

    directory = (
        Path(settings.UPLOAD_DIR)
        / "badges"
    )

    file_path = directory / filename

    content = await file.read()
    file_path.write_bytes(content)

    return str(file_path)


async def save_company_deck(
    file: UploadFile,
) -> str:

    ensure_upload_directories()

    extension = ALLOWED_DOCUMENT_TYPES.get(
        file.content_type
    )

    if not extension:
        raise ValueError(
            "Only PDF company decks are allowed."
        )

    filename = f"{uuid4().hex}{extension}"

    directory = (
        Path(settings.UPLOAD_DIR)
        / "decks"
    )

    file_path = directory / filename

    content = await file.read()
    file_path.write_bytes(content)

    return str(file_path)


async def save_import_file(
    file: UploadFile,
) -> str:

    ensure_upload_directories()

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    if extension not in {".xlsx", ".xls"}:
        raise ValueError(
            "Only XLSX and XLS files are allowed."
        )

    filename = (
        f"{uuid4().hex}{extension}"
    )

    directory = (
        Path(settings.UPLOAD_DIR)
        / "imports"
    )

    file_path = directory / filename

    content = await file.read()
    file_path.write_bytes(content)

    return str(file_path)