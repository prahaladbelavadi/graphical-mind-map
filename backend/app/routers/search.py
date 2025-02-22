from fastapi import APIRouter, Depends, Query
from app.dependencies import get_opensearch_client
from app.models import SearchQuery
from enum import Enum
from typing import Literal

router = APIRouter()

@router.post("/")
async def search(query: SearchQuery, client = Depends(get_opensearch_client)):
    # Perform a full text search on the OpenSearch database
    results = client.search(index="themes", body=query.model_dump())

    return results

@router.get("/suggestions")
async def get_suggestions(
    term: str, 
    source: Literal["opensearch", "chatgpt"] = Query(default="opensearch", description="Source for suggestions"),
    client = Depends(get_opensearch_client)
):
    if source == "opensearch":
        # Build a search query for suggestions from the themes index
        suggestion_query = {
            "suggest": {
                "theme-suggest": {
                    "prefix": term,
                    "completion": {
                        "field": "suggest",
                        "size": 5,
                        "skip_duplicates": True
                    }
                }
            }
        }
        
        results = client.search(index="themes", body=suggestion_query)
        return results
    else:  # chatgpt
        

        raise NotImplementedError("ChatGPT suggestions not yet implemented")


