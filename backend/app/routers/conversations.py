from fastapi import APIRouter, Depends
from app.dependencies import get_opensearch_client
from app.models import Conversation

router = APIRouter()

@router.get("/", response_model=list[Conversation])
async def get_conversations():
    return []

@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    pass 