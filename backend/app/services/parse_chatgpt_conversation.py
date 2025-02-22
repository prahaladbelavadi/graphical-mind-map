import json
from datetime import datetime
from typing import List, Dict
import openai
from dotenv import load_dotenv
import os
from models import Message, Theme, Chunk
from openai import OpenAI
from pathlib import Path
import sys

# Add the backend directory to Python path
backend_dir = str(Path(__file__).resolve().parents[2])
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.services.opensearch_service import OpenSearchService
from opensearchpy import OpenSearch

# --- Configuration ---
# Load environment variables
load_dotenv()

# Get OpenAI settings from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COMPLETION_MODEL = os.getenv("COMPLETION_MODEL", "gpt-4-turbo-preview")

# OpenSearch settings
OPENSEARCH_HOST = os.getenv("OPENSEARCH_HOST", "localhost")
OPENSEARCH_PORT = int(os.getenv("OPENSEARCH_PORT", "9200"))
OPENSEARCH_USER = os.getenv("OPENSEARCH_USERNAME", "admin")
OPENSEARCH_PASS = os.getenv("OPENSEARCH_PASSWORD", "admin")

# Initialize OpenSearch client
opensearch_client = OpenSearch(
    hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
    http_auth=(OPENSEARCH_USER, OPENSEARCH_PASS),
    use_ssl=False
)
opensearch_service = OpenSearchService(opensearch_client)

# --- Conversation Parsing Functions ---

def load_chatgpt_json(file_path: str) -> List[Dict]:
    """
    Load ChatGPT JSON data from a file.
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def format_timestamp(timestamp) -> str:
    """
    Convert a timestamp to a readable string.
    """
    if timestamp:
        return datetime.utcfromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
    return "N/A"

def process_content_parts(parts: List) -> str:
    """
    Process content parts to ensure all items are strings.
    """
    processed = []
    for part in parts:
        if isinstance(part, str):
            processed.append(part)
        elif isinstance(part, dict):
            # Convert dictionary to a JSON string for readability
            processed.append(json.dumps(part, ensure_ascii=False))
        else:
            processed.append(str(part))
    return "\n".join(processed)

def parse_conversations(data: List[Dict]) -> List[Dict]:
    """
    Extract conversations from the JSON dump.
    """
    conversations = []
    for convo in data:
        title = convo.get("title", "Untitled Conversation")
        create_time = format_timestamp(convo.get("create_time"))
        messages = []
        mapping = convo.get("mapping", {})
        for message_id, message_data in mapping.items():
            message = message_data.get("message")
            if message:
                author = message["author"]["role"]
                content_parts = message.get("content", {}).get("parts", [])
                text_content = process_content_parts(content_parts) if content_parts else ""
                timestamp = format_timestamp(message.get("create_time"))
                messages.append({
                    "author": author,
                    "content": text_content,
                    "timestamp": timestamp
                })
        conversations.append({
            "title": title,
            "create_time": create_time,
            "messages": messages
        })
    return conversations

def display_conversations(conversations: List[Dict]):
    """
    Print out the conversation summaries.
    """
    for convo in conversations:
        print(f"Title: {convo['title']}")
        print(f"Created: {convo['create_time']}")
        print("=" * 50)
        for msg in convo["messages"]:
            print(f"[{msg['timestamp']}] {msg['author'].capitalize()}: {msg['content']}\n")
        print("\n" + "=" * 50 + "\n")

# --- Theme Extraction Functions ---

def chunk_conversation(conversation_text: str, max_length: int = 1000) -> List[Chunk]:
    """Split conversation into chunks with metadata."""
    chunks = []
    current_chunk = []
    current_length = 0
    messages = conversation_text.split('\n')
    
    for i, message in enumerate(messages):
        message_length = len(message)
        if current_length + message_length > max_length and current_chunk:
            # Create a new chunk from the current set of messages.
            chunk_text = '\n'.join(current_chunk)
            chunk_messages = [
                Message(
                    author=msg.split(': ')[0],
                    content=': '.join(msg.split(': ')[1:]) if ': ' in msg else msg,
                    timestamp="N/A"
                ) for msg in current_chunk
            ]
            chunks.append(Chunk(
                text=chunk_text,
                themes=[],
                start_index=i - len(current_chunk),
                end_index=i,
                messages=chunk_messages
            ))
            current_chunk = []
            current_length = 0
        
        current_chunk.append(message)
        current_length += message_length
    
    # Process the final chunk
    if current_chunk:
        chunk_text = '\n'.join(current_chunk)
        chunk_messages = [
            Message(
                author=msg.split(': ')[0],
                content=': '.join(msg.split(': ')[1:]) if ': ' in msg else msg,
                timestamp="N/A"
            ) for msg in current_chunk
        ]
        chunks.append(Chunk(
            text=chunk_text,
            themes=[],
            start_index=len(messages) - len(current_chunk),
            end_index=len(messages),
            messages=chunk_messages
        ))
    
    return chunks

def extract_themes_from_chunk(chunk_text: str) -> Dict:
    """
    Uses the OpenAI API to extract a theme and sub-themes from a conversation chunk.
    The prompt instructs the API to return a JSON structure with theme details.
    """
    extracted_content = ""
    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = f"""
    You are an AI that analyzes conversations and extracts a theme. Given the conversation below, identify the main theme and sub-themes, and provide a short summary.
    Please respond with valid JSON in the following format:

    {{
        "theme": "Theme title",
        "subthemes": ["Subtheme1", "Subtheme2"],
        "summary": "A short summary of this conversation chunk as it relates to this theme.",
        "nodeType": "informational"
    }}

    Conversation:
    \"\"\"{chunk_text}\"\"\"
    """

    try:
        response = client.chat.completions.create(
            model=COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": "You are an assistant that extracts structured themes from conversations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=500,
        )
        extracted_content = response.choices[0].message.content
        print("\nRaw OpenAI response:", extracted_content)

        # Clean and parse the JSON
        extracted_content = extracted_content.strip()
        start = extracted_content.find("{")
        end = extracted_content.rfind("}")
        if start != -1 and end != -1:
            extracted_content = extracted_content[start:end + 1]
            return json.loads(extracted_content)
        else:
            raise ValueError("No valid JSON found in response")
    except Exception as e:
        print(f"Error extracting themes: {str(e)}")
        print(f"Raw response was: {extracted_content}")
        return {"theme": "", "subthemes": [], "summary": "", "nodeType": "informational"}

def process_conversation(conversation_text: str) -> List[Theme]:
    """
    Processes a conversation text by splitting it into chunks,
    extracting themes from each chunk, and combining the results.
    """
    chunks = chunk_conversation(conversation_text)
    all_themes = []
    for idx, chunk in enumerate(chunks):
        print(f"\nProcessing chunk {idx+1}/{len(chunks)}...")
        themes_data = extract_themes_from_chunk(chunk.text)
        # Create a Theme object from the returned JSON
        theme_obj = Theme(
            theme=themes_data.get("theme", ""),
            subthemes=themes_data.get("subthemes", []),
            summary=themes_data.get("summary", ""),
            nodeType=themes_data.get("nodeType", "informational"),
            text_data=chunk.text
        )
        chunk.themes = [theme_obj]
        print("\nExtracted Theme for this chunk:")
        print(json.dumps([vars(t) for t in chunk.themes], indent=2))
        all_themes.append(theme_obj)
        print("All themes so far:", all_themes)
    return all_themes

# --- Entry Points for API Integration ---

def run_conversation_parsing(file_path: str) -> List[Dict]:
    """
    Entry point for conversation parsing.
    Loads conversation JSON from a file and parses it.
    """
    chat_data = load_chatgpt_json(file_path)
    return parse_conversations(chat_data)

def run_theme_extraction(conversation_text: str) -> List[Theme]:
    """
    Entry point for theme extraction.
    Processes a conversation text to extract themes.
    """
    return process_conversation(conversation_text)

# --- Main Function for Testing Purposes ---
if __name__ == "__main__":
    try:
        # Get the absolute path to the project root
        project_root = Path(__file__).resolve().parents[3]
        file_path = project_root / "userdata" / "test_conversations.json"
        parsed_convos = run_conversation_parsing(file_path)
        # Process all conversations
        print(f"\nFound {len(parsed_convos)} conversations to analyze")
        for convo in parsed_convos:
            print(f"\n\nAnalyzing conversation: {convo['title']}\n")
            print("=" * 50)
            full_text = "\n".join(msg["content"] for msg in convo["messages"])
            data_obj = process_conversation(full_text)
            opensearch_service.insert_data_into_opensearch(data_obj)
            print("=" * 50)
    except Exception as e:
        print("Conversation parsing test failed:", e)
