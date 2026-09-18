from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seeds.seed_data import seed_all_demo_data

# Import API routers
from app.api import (
    auth, organizations, users, tasks, schedules, 
    escalations, notifications, analytics, audit, simulation
)

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
