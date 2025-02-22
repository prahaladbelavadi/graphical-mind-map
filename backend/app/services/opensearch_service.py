from opensearch_py import OpenSearch
from ..models import Theme, Conversation

class OpenSearchService:
    def __init__(self, client: OpenSearch):
        self.client = client

    async def store_conversation(self, conversation: Conversation):
        pass

    async def search_conversations(self, query: str):
        pass 