import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seeds.seed_data import seed_all_demo_data

# Import API routers
from app.api import (
    auth, organizations, users, tasks, schedules, 
    escalations, notifications, analytics, audit, simulation
)

# Path to the built frontend
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

# Ensure DB tables exist on load
Base.metadata.create_all(bind=engine)
db_init = SessionLocal()
try:
    seed_all_demo_data(db_init)
finally:
    db_init.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lifecycle hook
    yield

app = FastAPI(
    title="AI Work Scheduler API",
    description="Multi-Organization Workforce Scheduling, Task Allocation, Monitoring, Rescheduling and Escalation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["Organizations"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users & Availability"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Task Management"])
app.include_router(schedules.router, prefix="/api/v1/schedules", tags=["AI Scheduling Engine"])
app.include_router(escalations.router, prefix="/api/v1/escalations", tags=["Escalations"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics & KPIs"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit & AI Activity Logs"])
app.include_router(simulation.router, prefix="/api/v1/simulation", tags=["Demo Mode Simulation"])

# Serve frontend static assets (JS, CSS, images) if the build exists
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static-assets")

    # Catch-all: serve index.html for any non-API route (SPA client-side routing)
    @app.api_route("/{full_path:path}", methods=["GET"], include_in_schema=False)
    async def serve_spa(request: Request, full_path: str):
        # If a static file exists at the requested path, serve it
        file_path = FRONTEND_DIST / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        # Otherwise serve the SPA index.html
        return FileResponse(str(FRONTEND_DIST / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs_url": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
