# Chat Analysis Platform

A platform for analyzing chat conversations using AI to extract themes and insights.

## Setup

1. Create and activate virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

   2. Create virtual env and Install dependencies:
    `python -m venv myenv`
    `source myenv/bin/activate`
    `pip install -r requirements.txt`

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Create a `.env` file with required environment variables:
   ```
   OPENAI_API_KEY=your_openai_key
   OPENSEARCH_URL=https://localhost:9200
   ```

4. Start the services:
   ```bash
   docker-compose up
   ```

5. Start the backend:
   ```bash
   cd backend
   ./run.sh
   ```

## Development

### Backend
- Built with FastAPI
- API docs available at http://localhost:8000/docs

### Frontend
- Built with Next.js
- Access at http://localhost:3000 