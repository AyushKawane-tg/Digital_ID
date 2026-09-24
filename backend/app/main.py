from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.database.database import init_db

from app.routes import (
    auth,
    admin,
    employee,
    company,
    locations,
    badges,
    company_deck,
    employee_import,
    digital_card,
)

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="TeleGlobal Digital Visiting Card and Employee ID Card Platform",
)

# Static files
app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static",
)

# Uploaded files
uploads_dir = BASE_DIR.parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(uploads_dir)),
    name="uploads",
)

class _CompatJinja2Templates(Jinja2Templates):
    """Backwards-compatible TemplateResponse.

    Starlette 1.x changed the signature to ``TemplateResponse(request, name,
    context, ...)``. This project's routes still call the legacy form
    ``TemplateResponse(name, context, ...)``. This shim detects the old call
    style (first arg is the template name, context holds the request) and
    forwards to the new signature so both styles work.
    """

    def TemplateResponse(self, *args, **kwargs):
        if args and isinstance(args[0], str):
            name = args[0]
            context = args[1] if len(args) > 1 else kwargs.pop("context", {})
            context = context or {}
            request = context.get("request")
            rest = args[2:]
            return super().TemplateResponse(
                request, name, context, *rest, **kwargs
            )
        return super().TemplateResponse(*args, **kwargs)


templates = _CompatJinja2Templates(
    directory=str(BASE_DIR / "templates")
)

# Cache-busting asset version. Recomputed at each startup so the browser
# always fetches fresh CSS/JS after a change instead of using a stale copy.
import time as _time

ASSET_VERSION = str(int(_time.time()))
templates.env.globals["ASSET_V"] = ASSET_VERSION

# Make templates available to routes via request.app.state.templates
app.state.templates = templates

# Session support (login stores user_id / role in the session)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie=settings.SESSION_COOKIE_NAME,
)


@app.middleware("http")
async def no_cache_static(request: Request, call_next):
    """Prevent the browser from serving stale CSS/JS.

    Static assets are revalidated on every request so template/style
    changes are picked up immediately without a manual hard refresh.
    """
    response = await call_next(request)

    path = request.url.path
    if path.startswith("/static/"):
        response.headers["Cache-Control"] = (
            "no-cache, no-store, must-revalidate"
        )
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    # Open the app straight into the UI (login page) instead of
    # returning raw JSON.
    return RedirectResponse("/login", status_code=307)


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Routes
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(employee.router)
app.include_router(company.router)
app.include_router(locations.router)
app.include_router(badges.router)
app.include_router(company_deck.router)
app.include_router(employee_import.router)
app.include_router(digital_card.router)