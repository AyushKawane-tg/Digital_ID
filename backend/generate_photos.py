"""
One-off utility: download royalty-free Indian stock portraits for every
employee (gender matched from an explicit, hand-verified map), save them
under uploads/employees/, and set each employee's `picture` field.

Source: randomuser.me API with nat=in (Indian portraits).

NOTE: These are random stock faces (not the actual employees), used only to
make the demo data look realistic. Uploading a real photo via the admin
Edit page replaces the stock photo.

Run from the backend/ folder (internet required):
  python -m generate_photos
"""

import json
import urllib.request
from pathlib import Path

from app.core.config import settings
from app.database.database import SessionLocal
from app.database.models import Employee


UA = {"User-Agent": "Mozilla/5.0 (TeleGlobal seed script)"}


# Explicit, hand-verified gender per Employee ID (no guessing).
GENDER_BY_ID = {
    "TG001": "male",     # Demo Employee
    "TG002": "female",   # Priya Patil
    "TG003": "male",     # Amit Kulkarni
    "TG004": "female",   # Neha Joshi
    "TG005": "male",     # Rohit Patil
    "TG006": "female",   # Sneha Deshmukh
    "TG007": "male",     # Karan Mehta
    "TG008": "female",   # Anjali Shah
    "TG009": "male",     # Vivek More
    "TG010": "female",   # Simran Kaur
    "TG011": "male",     # Akash Jadhav
    "TG012": "female",   # Pooja Chavan
    "TG013": "male",     # Sachin Pawar
    "TG014": "female",   # Riya Kapoor
    "TG015": "male",     # Manish Gupta
    "TG016": "female",   # Kavita Shinde
    "TG017": "male",     # Saurabh Nair
    "TG018": "female",   # Isha Kulkarni
    "TG019": "male",     # Nikhil Verma
    "TG020": "female",   # Swati Joshi
    "TG021": "male",     # Aditya Desai
    "TG022": "female",   # Megha Rane
    "TG023": "male",     # Pratik Joshi
    "TG024": "female",   # Aarti More
    "TG025": "male",     # Raj Malhotra
    "TG026": "female",   # Tanvi Bhosale
    "TG027": "male",     # Omkar Sawant
    "TG028": "female",   # Divya Iyer
    "TG029": "male",     # Rahul Deshmukh
    "TG030": "female",   # Nikita Singh
    "TG031": "male",     # Arjun Pawar
    "TG032": "female",   # Komal Patil
    "TG033": "male",     # Yash Thakur
    "TG034": "female",   # Rutuja Kale
    "TG035": "male",     # Varun Shah
    "TG036": "female",   # Mansi Joshi
    "TG037": "male",     # Deepak Yadav
    "TG038": "female",   # Shruti Patil
    "TG039": "male",     # Akshay More
    "TG040": "female",   # Pallavi Naik
    "TG041": "male",     # Vishal Gupta
    "TG042": "female",   # Sonal Pawar
    "TG043": "male",     # Rohan Kulkarni
    "TG044": "female",   # Priya Nair
    "TG045": "male",     # Mohit Sharma
    "TG046": "female",   # Tejaswini Patil
    "TG047": "male",     # Abhishek Jain
    "TG048": "female",   # Manasi Shinde
    "TG049": "male",     # Sameer Khan
    "TG050": "female",   # Shreya Deshpande
    "TG100778": "male",  # Ashish Sakhare
    "TG100785": "male",  # Ayush Kawane
}


def _fetch_indian_portrait_url(gender: str, seed: str) -> str | None:
    api = (
        "https://randomuser.me/api/"
        f"?nat=in&gender={gender}&inc=picture&seed={seed}"
    )
    try:
        req = urllib.request.Request(api, headers=UA)
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data["results"][0]["picture"]["large"]
    except Exception as exc:
        print(f"  api failed: {exc}")
        return None


def _download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
        if not content or len(content) < 1000:
            return False
        dest.write_bytes(content)
        return True
    except Exception as exc:
        print(f"  download failed ({url}): {exc}")
        return False


def main():
    directory = Path(settings.UPLOAD_DIR) / "employees"
    directory.mkdir(parents=True, exist_ok=True)

    db = SessionLocal()
    downloaded = 0
    failed = 0

    try:
        employees = db.query(Employee).order_by(Employee.id.asc()).all()

        for emp in employees:
            gender = GENDER_BY_ID.get(emp.employee_id, "male")
            print(f"{emp.employee_id} {emp.full_name} -> {gender}")

            filename = f"photo_{emp.employee_id}.jpg"
            dest = directory / filename

            # Seed keeps the same face per employee on re-runs, but we
            # vary it so a fresh gender-correct face is fetched.
            url = _fetch_indian_portrait_url(
                gender, f"{emp.employee_id}-{gender}"
            )

            ok = _download(url, dest) if url else False

            if ok:
                emp.picture = f"employees/{filename}"
                downloaded += 1
            else:
                failed += 1

        db.commit()
        print("-" * 40)
        print(f"Indian portraits downloaded & linked: {downloaded}")
        print(f"Failed: {failed}")
        print(f"Saved to: {directory}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
