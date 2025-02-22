from fastapi import APIRouter, Depends
from app.dependencies import get_opensearch_client
from app.models import Theme

router = APIRouter()

@router.get("/", response_model=list[Theme])
async def get_themes(client = Depends(get_opensearch_client)):
    # Get all themes from the OpenSearch database   
    themes = client.search(index="themes", body={})
    return [Theme(**theme) for theme in themes]

@router.get("/{theme_id}", response_model=Theme)
async def get_theme(theme_id: str, client = Depends(get_opensearch_client)):
    # Get a specific theme by ID from the OpenSearch database
    theme = client.get(index="themes", id=theme_id)
    return Theme(**theme)