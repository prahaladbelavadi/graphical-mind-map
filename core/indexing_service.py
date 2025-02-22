from typing import List
from opensearchpy import OpenSearch, helpers
from ..config.settings import (
    OPENSEARCH_HOST,
    OPENSEARCH_PORT,
    OPENSEARCH_USER,
    OPENSEARCH_PASSWORD,
    INDEX_NAME,
    VECTOR_DIMENSION
)
from ..models.chunk import ParagraphChunk
import logging

logger = logging.getLogger(__name__)
chunking_strategy = "basic" #todo: make this dynamic

class IndexingService:
    def __init__(self):
        self.client = OpenSearch(
            hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
            http_auth=(OPENSEARCH_USER, OPENSEARCH_PASSWORD),
            use_ssl=False
        )
        self.ensure_index()
        self.chunking_strategy = chunking_strategy

    def ensure_index(self):
        """Create the index if it doesn't exist."""
        if not self.client.indices.exists(index=INDEX_NAME):
            mapping = {
                "settings": {
                    "index": {
                        "knn": True  # Enable k-NN for knn_vector fields
                    }
                },
                "mappings": {
                    "properties": {
                        "title": {"type": "keyword"},
                        "documentChecksum": {"type": "keyword"},
                        "is_chart": {"type": "boolean"},
                        "page_number": {"type": "integer"},
                        "paragraph_or_chart_index": {"type": "keyword"},
                        "text_content": {"type": "text"},
                        "embedding_model": {"type": "keyword"},
                        "embedding": {
                            "type": "knn_vector",
                            "dimension": VECTOR_DIMENSION,
                            "method": {
                                "name": "hnsw",
                                "engine": "nmslib",
                                "space_type": "cosinesimil"
                            }
                        },
                        "pdf_loader": {"type": "keyword"}
                    }
                }
            }
            self.client.indices.create(INDEX_NAME, body=mapping)
            logger.info(f"Created index {INDEX_NAME} with mapping: {mapping}")

    def index_chunks(self, chunks: List[ParagraphChunk]):
        """Index a list of chunks into OpenSearch using the bulk helper."""
        try:
            # Build bulk actions list with deterministic _id for deduplication
            actions = [
                {
                    "_op_type": "index",
                    "_index": INDEX_NAME,
                    "_id": f"{chunk.documentChecksum}-{chunk.embedding_model}-{chunk.page_number}-{chunk.paragraph_or_chart_index}-{chunk.pdf_loader}-{self.chunking_strategy}",
                    "_source": {
                        "title": chunk.title,
                        "documentChecksum": chunk.documentChecksum,
                        "is_chart": chunk.is_chart,
                        "page_number": chunk.page_number,
                        "paragraph_or_chart_index": chunk.paragraph_or_chart_index,
                        "text_content": chunk.text_content,
                        "embedding_model": chunk.embedding_model,
                        "embedding": chunk.embedding,
                        "pdf_loader": chunk.pdf_loader
                    }
                }
                for chunk in chunks
            ]
            
            if actions:
                logger.info(f"Indexing {len(actions)} chunks")
                success, failed = helpers.bulk(self.client, actions, stats_only=True)
                logger.info(f"Successfully indexed: {success} documents")
                if failed:
                    logger.error(f"Encountered {failed} errors during bulk indexing")
                return {
                    'indexed': success,
                    'errors': failed
                }
        except Exception as e:
            logger.error(f"Error during bulk indexing: {str(e)}")
            raise

    def get_index_stats(self) -> dict:
        """Get statistics about the index."""
        try:
            stats = self.client.indices.stats(index=INDEX_NAME)
            total = stats['indices'][INDEX_NAME]['total']
            return {
                'doc_count': total['docs']['count'],
                'store_size': total['store']['size_in_bytes']
            }
        except Exception as e:
            raise Exception(f"Failed to get index stats: {str(e)}")

    def get_sample_documents(self, size: int = 5) -> list:
        """Get a sample of documents from the index."""
        try:
            response = self.client.search(
                index=INDEX_NAME,
                body={
                    "query": {"match_all": {}},
                    "size": size,
                    "sort": [{"_doc": "desc"}]  # Random sort
                }
            )
            return response['hits']['hits']
        except Exception as e:
            raise Exception(f"Failed to get sample documents: {str(e)}") 

    def check_existing_checksums(self, checksums: List[str]) -> set:
        """Check which checksums from the provided list already exist in the index."""
        try:
            response = self.client.search(
                index=INDEX_NAME,
                body={
                    "size": 0,
                    "query": {
                        "terms": {
                            "documentChecksum": checksums
                        }
                    },
                    "aggs": {
                        "existing_checksums": {
                            "terms": {
                                "field": "documentChecksum",
                                "size": len(checksums)
                            }
                        }
                    }
                }
            )
            return {bucket['key'] for bucket in response['aggregations']['existing_checksums']['buckets']}
        except Exception as e:
            print(f"Warning: Could not check checksums: {str(e)}")
            return set() 

    def delete_by_document_ids(self, document_ids: List[str]) -> dict:
        """Delete all chunks associated with given document IDs."""
        try:
            response = self.client.delete_by_query(
                index=INDEX_NAME,
                body={
                    "query": {
                        "terms": {
                            "document_id": document_ids
                        }
                    }
                },
                refresh=True  # Ensure deletion is immediately visible
            )
            
            return {
                'total_deleted': response['deleted'],
                'total_failed': response['failures']
            }
        except Exception as e:
            raise Exception(f"Failed to delete documents: {str(e)}") 

    def delete_all_documents(self) -> dict:
        """Delete all documents from the index."""
        try:
            response = self.client.delete_by_query(
                index=INDEX_NAME,
                body={
                    "query": {
                        "match_all": {}
                    }
                },
                refresh=True  # Ensure deletion is immediately visible
            )
            
            return {
                'total_deleted': response['deleted'],
                'total_failed': len(response.get('failures', []))
            }
        except Exception as e:
            raise Exception(f"Failed to delete all documents: {str(e)}") 