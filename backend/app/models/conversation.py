from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    author: str
    content: str
    timestamp: str

class Conversation(BaseModel):
    title: str
    create_time: str
    messages: List[Message]
    
    def get_full_text(self) -> str:
        """Get the full conversation text"""
        return "\n".join(msg.content for msg in self.messages)

class Theme(BaseModel):
    theme: str
    subthemes: List[str]
    summary: str
    nodeType: str = "informational"  # or "personal"

class ThemeResponse(BaseModel):
    themes: List[Theme] 