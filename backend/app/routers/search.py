from fastapi import APIRouter, Depends
from app.dependencies import get_opensearch_client
from app.models import SearchQuery

router = APIRouter()

@router.post("/")
async def search(query: SearchQuery):
    pass 