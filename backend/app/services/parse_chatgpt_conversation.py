import json
from datetime import datetime
from typing import List, Dict
from openai import OpenAI
from dotenv import load_dotenv
import os

# --- Configuration ---
# Load environment variables
load_dotenv()

# Get OpenAI settings from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COMPLETION_MODEL = os.getenv("COMPLETION_MODEL", "gpt-4-turbo-preview")

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

def chunk_conversation(conversation_text: str, max_length: int = 1000) -> List[str]:
    """
    Split a long conversation text into chunks of up to max_length characters.
    (This simple implementation splits by character count; you may wish to improve it.)
    """
    return [conversation_text[i:i+max_length] for i in range(0, len(conversation_text), max_length)]

def extract_themes_from_chunk(chunk_text: str) -> Dict:
    """
    Uses the OpenAI API to extract themes and sub-themes from a conversation chunk.
    The prompt instructs the API to return a JSON structure with theme details.
    """
    client = OpenAI(api_key=OPENAI_API_KEY)

    prompt = f"""
You are an AI that analyzes conversations and extracts themes. Given the conversation below, identify the main themes and sub-themes, and provide a short summary.
Please respond with valid JSON in the following format:

{{
    "themes": [
        {{
            "theme": "Theme title",
            "subthemes": ["Subtheme1", "Subtheme2"],
            "summary": "A short summary of this conversation chunk as it relates to this theme.",
            "nodeType": "informational"  // or "personal"
        }},
        ...
    ]
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
        print("\nRaw OpenAI response:", extracted_content)  # Debug print
        themes_data = json.loads(extracted_content)
    except Exception as e:
        print(f"Error extracting themes: {str(e)}")
        print(f"Response content type: {type(response) if 'response' in locals() else 'No response'}")
        themes_data = {"themes": []}
    
    return themes_data

def process_conversation(conversation_text: str) -> List[Dict]:
    """
    Processes a conversation text by splitting it into chunks,
    extracting themes from each chunk, and combining the results.
    """
    chunks = chunk_conversation(conversation_text)
    for idx, chunk in enumerate(chunks):
        print(f"\nProcessing chunk {idx+1}/{len(chunks)}...")
        themes_data = extract_themes_from_chunk(chunk)
        print("\nExtracted Themes for this chunk:")
        print(json.dumps(themes_data.get("themes", []), indent=2))
    return []

# --- Entry Points for API Integration ---

def run_conversation_parsing(file_path: str) -> List[Dict]:
    """
    Entry point for conversation parsing.
    Loads conversation JSON from a file and parses it.
    """
    chat_data = load_chatgpt_json(file_path)
    return parse_conversations(chat_data)

def run_theme_extraction(conversation_text: str) -> List[Dict]:
    """
    Entry point for theme extraction.
    Processes a conversation text to extract themes.
    """
    return process_conversation(conversation_text)

# --- Main Function for Testing Purposes ---
if __name__ == "__main__":
    # Test Conversation Parsing
    try:
        file_path = "../../../userdata/conversations.json"  # Update path as needed
        parsed_convos = run_conversation_parsing(file_path)
        # Take the first conversation for testing
        if parsed_convos:
            first_convo = parsed_convos[0]
            print(f"\nAnalyzing conversation: {first_convo['title']}\n")
            full_text = "\n".join(msg["content"] for msg in first_convo["messages"])
            process_conversation(full_text)
    except Exception as e:
        print("Conversation parsing test failed:", e)
