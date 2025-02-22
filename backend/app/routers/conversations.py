from fastapi import APIRouter, Depends
from app.dependencies import get_opensearch_client
from app.models import Conversation

router = APIRouter()

@router.get("/", response_model=list[Conversation])
async def get_conversations(client = Depends(get_opensearch_client)):
    # Get all conversations from the OpenSearch database
    conversations = client.search(index="conversations", body={})
    return [Conversation(**conversation) for conversation in conversations]

@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str, client = Depends(get_opensearch_client)):
    # Get a specific conversation by ID from the OpenSearch database
    conversation = client.get(index="conversations", id=conversation_id)
    return Conversation(**conversation) 