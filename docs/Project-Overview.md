# TeleGlobal Digital Card Platform — Project Overview

## 1. Project Name

TeleGlobal Digital Card Platform

## 2. Purpose

The TeleGlobal Digital Card Platform is a web-based system for managing employee digital visiting cards and employee ID cards.

The platform allows employees to maintain their personal information while administrators manage employee records and company information.

## 3. Core Features

- Admin authentication
- Employee authentication
- Employee profile management
- Admin employee management
- Company profile management
- Company locations
- Company badges and certificates
- Company deck management
- Excel employee import
- Automatic QR code generation
- Digital employee card
- Front and back card design
- Responsive mobile card
- Permanent digital card URL

## 4. Employee Information

The platform stores:

- Employee picture
- Full name
- Designation
- Department / Business Unit
- Employee ID
- Official email
- Contact number
- Emergency contact
- Office location
- LinkedIn ID
- Instagram ID
- Facebook ID
- Blood group
- Date of birth

## 5. Company Information

The platform stores:

- Company logo
- Company name
- About company
- Company website
- Corporate office address
- Other company locations
- Company contact number
- Company email
- CEO name
- Founder name
- Mission
- Vision
- Badges and certificates
- Company deck

## 6. QR-Based Digital Card

Every employee receives a permanent digital card URL.

Example:

    /card/TG001

The QR code points to this URL.

When employee information changes, the same QR code continues to work because the QR points to the employee's permanent card URL.

## 7. Technology Stack

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

### Supporting Libraries

- Pandas
- OpenPyXL
- QRCode
- Pillow
- Pydantic
- Python-Jose
- Passlib

## 8. User Types

The platform contains two primary roles:

- ADMIN
- EMPLOYEE

## 9. Project Scope

This project is designed as a Digital Visiting Card and Employee ID Card platform.

It does not include unrelated modules such as:

- Payroll
- Attendance
- Recruitment
- CRM
- Sales analytics
- AI analytics