from fastapi import APIRouter, Depends
from app.dependencies import get_opensearch_client
from app.models import Theme

router = APIRouter()

@router.get("/", response_model=list[Theme])
async def get_themes():
    return []

@router.get("/{theme_id}", response_model=Theme)
async def get_theme(theme_id: str):
    pass 