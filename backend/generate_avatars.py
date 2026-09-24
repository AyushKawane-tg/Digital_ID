"""
One-off utility: generate a professional initials-avatar PNG for every
employee that has no picture, save it under uploads/employees/, and set
the employee's `picture` field so it shows on the list, cards and QR.

Run from the backend/ folder:
  python -m generate_avatars
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from app.core.config import settings
from app.database.database import SessionLocal
from app.database.models import Employee


# A pleasant, professional palette (background gradients avoided for
# crisp scannable avatars). Chosen for good contrast with white text.
PALETTE = [
    (11, 92, 171),    # blue
    (6, 56, 106),     # navy
    (22, 132, 206),   # sky
    (26, 157, 110),   # green
    (155, 89, 182),   # purple
    (211, 84, 0),     # orange
    (192, 57, 43),    # red
    (41, 128, 185),   # ocean
    (39, 174, 96),    # emerald
    (142, 68, 173),   # violet
]


def _load_font(size: int):
    for name in ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def _initials(full_name: str) -> str:
    parts = [p for p in full_name.strip().split() if p]
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][0].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _color_for(name: str):
    return PALETTE[sum(ord(c) for c in name) % len(PALETTE)]


def make_avatar(full_name: str, size: int = 400) -> Image.Image:
    bg = _color_for(full_name)
    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)

    text = _initials(full_name)
    font = _load_font(int(size * 0.42))

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]

    draw.text((x, y), text, font=font, fill=(255, 255, 255))
    return img


def main():
    directory = Path(settings.UPLOAD_DIR) / "employees"
    directory.mkdir(parents=True, exist_ok=True)

    db = SessionLocal()
    created = 0
    skipped = 0

    try:
        employees = db.query(Employee).all()

        for emp in employees:
            # Always (re)generate an initials avatar for every employee.
            filename = f"avatar_{emp.employee_id}.png"
            file_path = directory / filename

            avatar = make_avatar(emp.full_name)
            avatar.save(file_path, format="PNG")

            emp.picture = f"employees/{filename}"
            created += 1

        db.commit()
        print(f"Avatars generated: {created}")
        print(f"Skipped (already had a photo): {skipped}")
        print(f"Saved to: {directory}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
