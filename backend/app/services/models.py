from dataclasses import dataclass
from typing import List

@dataclass
class Message:
    author: str
    content: str
    timestamp: str

@dataclass
class Theme:
    theme: str
    subthemes: List[str]
    summary: str
    nodeType: str = "informational"
    text_data: str = ""

@dataclass
class Chunk:
    text: str
    themes: List[Theme]
    start_index: int
    end_index: int
    messages: List[Message] 