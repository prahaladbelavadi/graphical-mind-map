from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Theme(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

class Conversation(BaseModel):
    id: str
    content: str
    theme_id: str
    timestamp: datetime
    metadata: Optional[dict] = None

class SearchQuery(BaseModel):
    query: str
    filters: Optional[dict] = None
    size: int = 10
    from_: int = 0 