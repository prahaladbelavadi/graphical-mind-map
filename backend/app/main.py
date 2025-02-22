from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import themes, conversations, search, upload

app = FastAPI(title="Chat Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(themes.router, prefix="/api/themes", tags=["themes"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

@app.get("/")
async def root():
    return {"message": "Welcome to Chat Analysis API"} 