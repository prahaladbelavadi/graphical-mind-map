from typing import List
from openai import OpenAI
import json
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from opensearchpy import OpenSearch
from colorama import Fore, Style
import re
import logging
from src.config.settings import (
    OPENAI_API_KEY,
    OPENSEARCH_HOST,
    OPENSEARCH_PORT,
    OPENSEARCH_USER,
    OPENSEARCH_PASSWORD,
    INDEX_NAME,
    COMPLETION_MODEL,
    MAX_CHUNKS_PER_QUERY,
    EMBEDDING_MODEL
)

logger = logging.getLogger(__name__)

class QAService:
    def __init__(self):
        self.client = OpenSearch(
            hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
            http_auth=(OPENSEARCH_USER, OPENSEARCH_PASSWORD),
            use_ssl=False
        )
        self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
        self.llm = ChatOpenAI(
            model_name=COMPLETION_MODEL,
            temperature=0,
            openai_api_key=OPENAI_API_KEY
        )
        # Add colors list for cycling through reference colors
        self.ref_colors = [Fore.CYAN, Fore.GREEN, Fore.YELLOW, Fore.MAGENTA, Fore.BLUE, Fore.RED, Fore.LIGHTBLUE_EX]

    def _search_similar_chunks(self, question: str) -> List[dict]:
        """Search for similar chunks using hybrid search (KNN + text similarity)."""
        # Get the embedding for the input question
        response = self.openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=question
        )
        question_embedding = response.data[0].embedding

        # Build hybrid query with both vector and text search
        hybrid_query = {
            "knn": {
                "embedding": {
                    "vector": question_embedding,
                    "k": 75,
                    "boost": 1.0
                }
            }
        }

        # Run the search query with lower min_score
        response = self.client.search(
            index=INDEX_NAME,
            body={
                "query": hybrid_query,
                "size": MAX_CHUNKS_PER_QUERY,
                "_source": ["text_content", "title", "page_number"],
                "min_score": .5
            }
        )

        results = response['hits']['hits']
        # Log scores for debugging
        for hit in results:
            logger.debug(f"Score: {hit['_score']}, Title: {hit['_source']['title']}")
        
        logger.info(f"Found {len(results)} results for question: {question}")
        return results

    def _highlight_references(self, text: str) -> str:
        """Highlight reference tags with cycling colors."""
        # Find all unique reference numbers
        pattern = r'\[Ref(\d+)\]'
        matches = re.finditer(pattern, text)
        
        # Create a mapping of reference numbers to colors
        ref_color_map = {}
        for match in matches:
            ref_num = int(match.group(1))
            if ref_num not in ref_color_map:
                ref_color_map[ref_num] = self.ref_colors[(ref_num - 1) % len(self.ref_colors)]
        
        # Apply colors to all references
        result = text
        for ref_num, color in sorted(ref_color_map.items(), reverse=True):
            ref_tag = f'[Ref{ref_num}]'
            colored_ref = f'{color}{ref_tag}{Style.RESET_ALL}'
            result = result.replace(ref_tag, colored_ref)
        
        return result

    def answer_question(self, question: str) -> str:
        """Answer a question using the indexed papers."""
        # Refine user question, breakdown into one or many searchable queries
        queries = self._refine_question(question)

        # for each query, get relevant chunks
        similar_chunks = []
        for query in queries:
            # Get relevant chunks
            partial_chunks = self._search_similar_chunks(query)
            similar_chunks.extend(partial_chunks)
            
        if not similar_chunks:
            # Fallback to general knowledge with a disclaimer
            prompt_template = """
            The user asked a question but no relevant documents were found in the knowledge base.
            Please provide a brief, general answer based on your knowledge. Let the user know that no personal documents were used to help answer their question

            Question: {question}

            Answer:"""

            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["question"]
            )

            response = self.llm.invoke(
                prompt.format(question=question)
            ).content

            return f"{Fore.YELLOW}Note: No relevant documents found in the index. Providing a general answer:{Style.RESET_ALL}\n\n{response}"

        # Prepare context from chunks
        context = "\n\n".join([
            f"[Ref{idx+1}] {hit['_source']['text_content']}"
            for idx, hit in enumerate(similar_chunks)
        ])

        # Prepare prompt
        prompt_template = """
        Answer the question based on the following context. Use the reference numbers [Ref1], [Ref2], etc. 
        when citing information from the context or if the reference has the same information. If you cannot answer the question based on the context, 
        say so and provide a general answer based on your knowledge.  Rememeber Always cite sources at the time you use them. provide an answer that is betwee n1 and 3 paragraphs.
        Consider all the given sources, your own internal knowledge, and think critically about the information provided and the question before answering.


        -------------------------
        Context:
        {context}
        -------------------------
        Question: {question}
        -------------------------
        Answer:"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        # Get answer from LLM using invoke instead of predict
        response = self.llm.invoke(
            prompt.format(
                context=context,
                question=question
            )
        ).content  # Add .content to get the string response

        # Add reference legend
        reference_legend = "\n\nReferences:"
        for idx, hit in enumerate(similar_chunks):
            source = hit['_source']
            reference_legend += f"\n[Ref{idx+1}] Document: {source['title']}, Page: {source['page_number']}"

        response_with_refs = response + reference_legend
        return self._highlight_references(response_with_refs)
    
    def _refine_question(self, question: str) -> List[str]:
        """Refine user question into one or many searchable queries."""

        prompt_template = """
        I have a RAG system for answering questions about a knowledge base.
        Given the following "user question", break it down into discrete searchable queries that capture the user's intention.
        The queries will be used in a cosine similarity search on a vector database so they should be short and concise.
        Phrase the queries as statements rather than questions.
        If the users question is complex, break it down into multiple queries.
        Do not produce multiple queries that capture the same information.

        IMPORTANT: Return only a valid JSON array of strings, and nothing else.
        For example: ["query one", "query two"]

        User Question: {question}

        Searchable Queries:
        """

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["question"]
        )

        response = self.llm.invoke(
            prompt.format(
                question=question
            )
        ).content

        # convert response to list of strings
        list_of_queries = json.loads(response)

        logger.info(f"Refined question into {len(list_of_queries)} queries: {list_of_queries}")
        return list_of_queries
