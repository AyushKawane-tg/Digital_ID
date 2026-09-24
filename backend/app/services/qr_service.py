from pathlib import Path
from urllib.parse import quote

import qrcode

from app.core.config import settings


def ensure_qr_directory() -> Path:
    directory = Path(settings.QR_CODE_DIR)
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def build_card_url(employee_id: str, base_url: str | None = None) -> str:
    employee_id = str(employee_id).strip()

    if not employee_id:
        raise ValueError("Employee ID is required.")

    if base_url is None:
        base_url = settings.CARD_BASE_URL

    base_url = str(base_url).strip().rstrip("/")

    if not base_url:
        raise ValueError("CARD_BASE_URL is not configured.")

    encoded_employee_id = quote(employee_id, safe="")

    return f"{base_url}/card/{encoded_employee_id}"


def generate_qr_code(
    employee_id: str,
) -> tuple[str, str]:

    return generate_qr_code_with_base(
        employee_id=employee_id,
        base_url=settings.CARD_BASE_URL,
    )


def generate_qr_code_with_base(
    employee_id: str,
    base_url: str,
) -> tuple[str, str]:

    directory = ensure_qr_directory()

    # Build the URL that will be stored inside the QR
    card_url = build_card_url(
        employee_id=employee_id,
        base_url=base_url,
    )

    # Generate QR
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )

    qr.add_data(card_url)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    # Save QR image
    filename = f"{str(employee_id).strip()}.png"
    file_path = directory / filename

    image.save(file_path)

    return card_url, str(file_path)