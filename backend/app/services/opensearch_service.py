from opensearchpy import OpenSearch
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = str(Path(__file__).resolve().parents[2])
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from .models import Theme, Message
from typing import List
import json
from datetime import datetime

class OpenSearchService:
    def __init__(self, client: OpenSearch):
        self.client = client

    async def store_conversation(self, messages: List[Message]):
        pass

    async def search_conversations(self, query: str):
        pass

    def insert_data_into_opensearch(self, themes: List[Theme], index_name: str = "themes") -> None:
        """
        Insert theme data into OpenSearch
        """
        try:
            # Create index if it doesn't exist
            if not self.client.indices.exists(index=index_name):
                mapping = {
                    "mappings": {
                        "properties": {
                            "theme": {"type": "text"},
                            "subthemes": {"type": "keyword"},
                            "summary": {"type": "text"},
                            "nodeType": {"type": "keyword"},
                            "text_data": {"type": "text"},
                            "conversation_title": {"type": "keyword"},
                            "timestamp": {"type": "date"}
                        }
                    }
                }
                self.client.indices.create(index=index_name, body=mapping)

            # Insert each theme as a document
            for theme in themes:
                document = {
                    "theme": theme.theme,
                    "subthemes": theme.subthemes,
                    "summary": theme.summary,
                    "nodeType": theme.nodeType,
                    "text_data": theme.text_data,
                    "conversation_title": theme.conversation_title,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.client.index(
                    index=index_name,
                    body=document,
                    refresh=True
                )
            
            print(f"Successfully inserted {len(themes)} themes into OpenSearch")
            
        except Exception as e:
            print(f"Error inserting data into OpenSearch: {str(e)}")
            raise 