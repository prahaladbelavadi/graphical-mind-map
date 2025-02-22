from opensearchpy import OpenSearch
from dotenv import load_dotenv
import os

def delete_themes_index():
    # Load environment variables
    load_dotenv()

    # OpenSearch settings
    OPENSEARCH_HOST = os.getenv("OPENSEARCH_HOST", "localhost")
    OPENSEARCH_PORT = int(os.getenv("OPENSEARCH_PORT", "9200"))
    OPENSEARCH_USER = os.getenv("OPENSEARCH_USERNAME", "admin")
    OPENSEARCH_PASS = os.getenv("OPENSEARCH_PASSWORD", "admin")

    # Initialize OpenSearch client
    client = OpenSearch(
        hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
        http_auth=(OPENSEARCH_USER, OPENSEARCH_PASS),
        use_ssl=False
    )

    try:
        if client.indices.exists(index="themes"):
            client.indices.delete(index="themes")
            print("Successfully deleted 'themes' index")
        else:
            print("'themes' index does not exist")
    except Exception as e:
        print(f"Error deleting index: {str(e)}")

if __name__ == "__main__":
    delete_themes_index() 