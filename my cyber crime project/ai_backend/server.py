import os
import fitz  # PyMuPDF library
from flask import Flask, request, jsonify
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
import logging
# Import for better text chunking
from langchain.text_splitter import RecursiveCharacterTextSplitter

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURATION ---
DOCS_FOLDER = "docs"
MODEL_ID = "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF"
MODEL_FILE = "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'

# --- INITIALIZE APP ---
app = Flask(__name__)
CORS(app)

# --- GLOBAL VARIABLES ---
llm = None
document_chunks = []
vector_store = None
embedding_model = None

# --- HELPER FUNCTIONS ---
def load_documents():
    docs_text = []
    logging.info(f"Searching for PDF documents in: {os.path.abspath(DOCS_FOLDER)}")
    if not os.path.exists(DOCS_FOLDER):
        logging.error(f"The directory '{DOCS_FOLDER}' was not found.")
        return docs_text
    
    for filename in os.listdir(DOCS_FOLDER):
        if filename.lower().endswith(".pdf"):
            filepath = os.path.join(DOCS_FOLDER, filename)
            try:
                with fitz.open(filepath) as doc:
                    full_text = "".join(page.get_text() for page in doc)
                    docs_text.append(full_text)
                logging.info(f"Successfully loaded and extracted text from {filename}")
            except Exception as e:
                logging.error(f"Failed to process {filename}: {e}")
    return docs_text

def create_vector_store(docs):
    """Creates vector embeddings for the document chunks."""
    global embedding_model, document_chunks, vector_store
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    full_text = "\n\n".join(docs)
    document_chunks = text_splitter.split_text(full_text)
    
    if not document_chunks:
        logging.error("No text chunks were created. Check PDF content.")
        return

    logging.info(f"Generating embeddings for {len(document_chunks)} text chunks...")
    embeddings = embedding_model.encode(document_chunks, show_progress_bar=True)
    
    dimension = embeddings.shape[1]
    vector_store = faiss.IndexFlatL2(dimension)
    vector_store.add(np.array(embeddings, dtype=np.float32))
    logging.info("Vector store created successfully.")

def retrieve_context(query, top_k=3):
    """Retrieves the most relevant document chunks for a given query."""
    query_embedding = embedding_model.encode([query])
    _, indices = vector_store.search(np.array(query_embedding, dtype=np.float32), top_k)
    return "\n---\n".join([document_chunks[i] for i in indices[0]])

def generate_prompt(query, context):
    """Generates a prompt for the LLM based on the user's query and retrieved context."""
    return f"""<|im_start|>system
You are a Cyber Crime Assistant. Answer the user's question based ONLY on the provided context. If the answer is not in the context, state that the information is not available in the provided documents. Be concise.<|im_end|>
<|im_start|>user
**Context:**
{context}

**Question:**
{query}<|im_end|>
<|im_start|>assistant
"""

def get_response(query):
    """
    Orchestrates the RAG pipeline: retrieves context, generates a prompt, 
    and gets a response from the LLM.
    """
    logging.info(f"Received query: {query}")
    if vector_store is None:
        return "Vector store not initialized. Cannot process query."

    context = retrieve_context(query)
    logging.info(f"Retrieved context for query.")

    prompt = generate_prompt(query, context)
    
    logging.info("Sending prompt to LLM...")
    response_text = llm(prompt, max_new_tokens=256, temperature=0.7, stop=["<|im_end|>"])
    logging.info("Received response from LLM.")

    return response_text

def initialize_ai():
    """Loads and initializes all the AI models and data."""
    global llm, embedding_model
    logging.info("Initializing AI models...")
    embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    
    docs = load_documents()
    if docs:
        create_vector_store(docs)
    else:
        logging.warning("No documents loaded. The chatbot will not have contextual information.")
    
    logging.info(f"Loading LLM: {MODEL_ID}...")
    llm = AutoModelForCausalLM.from_pretrained(
    MODEL_ID, 
    model_file=MODEL_FILE, 
    model_type="llama", 
    gpu_layers=0,
    context_length=2048  # <-- Add this line
)
    logging.info("LLM loaded successfully.")

# --- API ENDPOINT ---
# FIX 1: Change the route from "/get_response" to "/ask"
@app.route("/ask", methods=['POST'])
def handle_query():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Invalid request, 'message' not found in body"}), 400

        user_query = data['message']
        
        response = get_response(user_query)
        
        # FIX 2: Change the key from 'response' to 'answer'
        return jsonify({'answer': response})
        
    except Exception as e:
        logging.error(f"An error occurred while handling the request: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred on the server."}), 500

if __name__ == '__main__':
    initialize_ai()
    app.run(host='127.0.0.1', port=5000, debug=True)


