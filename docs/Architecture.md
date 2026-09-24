# Architecture

## 1. Architecture Overview

The TeleGlobal Digital Card Platform follows a layered FastAPI architecture.

```text
                    User
                     |
                     v
              Web Browser
                     |
                     v
              FastAPI Application
                     |
        +------------+------------+
        |            |            |
        v            v            v
      Routes      Services     Templates
        |            |            |
        |            v            |
        |        SQLAlchemy       |
        |            |            |
        +------------+------------+
                     |
                     v
                SQLite DB
                     |
          +----------+----------+
          |          |          |
       Uploads    QR Codes    Data