# TeleGlobal Digital Card Platform

A digital employee visiting card and employee ID card platform for TeleGlobal.

## Features

- Admin login
- Employee login
- Employee profile management
- Admin employee management
- Company profile management
- Company locations
- Company badges and certificates
- Company deck
- Excel employee import
- Automatic QR code generation
- Permanent digital card URL
- Front and back digital employee card
- Responsive mobile-friendly card
- Employee social links
- Company information on digital card

---

## Technology Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Jinja2

### Frontend
- HTML
- CSS
- JavaScript
- Jinja2 Templates

### Utilities
- Pandas
- OpenPyXL
- QRCode
- Pillow

---

## Project Structure

```text
backend/
├── app/
│   ├── core/
│   ├── database/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   ├── templates/
│   └── static/
│
├── uploads/
├── qr_codes/
├── data/
├── tests/
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md