# Chat Analysis Platform

A platform for analyzing chat conversations using AI to extract themes and insights.

## Setup

1. Create and activate virtual environment:
   Create virtual env and Install dependencies:
    `python -m venv myenv`
    `source myenv/bin/activate`
    `pip install -r requirements.txt`


3. Create a `.env` file with required environment variables:
   ```
   OPENAI_API_KEY=your_openai_key
   OPENSEARCH_URL=https://localhost:9200
   ```

Start the OpenSearch container:
 - ```docker-compose up --build```
 #### You can verify opensearch is running with this command: ```curl http://localhost:9200```
 #### To access OpenSearch Dashboards: Open a web browser and navigate to: ```http://localhost:5601/app/home```



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