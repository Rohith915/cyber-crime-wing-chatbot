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
    """(IMPROVED) This function now creates many small, effective chunks."""
    global embedding_model, document_chunks, vector_store
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )
    
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
    query_embedding = embedding_model.encode([query])
    _, indices = vector_store.search(np.array(query_embedding, dtype=np.float32), top_k)
    return "\n---\n".join([document_chunks[i] for i in indices[0]])

def generate_prompt(query, context):
    return f"""<|im_start|>system
You are a Cyber Crime Assistant. Answer the user's question based ONLY on the provided context. If the answer is not in the context, state that the information is not available in the provided documents. Be concise.<|im_end|>
<|im_start|>user
**Context:**
{context}

**Question:**
{query}<|im_end|>
<|im_start|>assistant
"""

def initialize_ai():
    global llm, embedding_model
    logging.info("Initializing AI models...")
    embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    docs = load_documents()
    if docs: create_vector_store(docs)
    
    logging.info(f"Loading LLM: {MODEL_ID}...")
    llm = AutoModelForCausalLM.from_pretrained(
        MODEL_ID, model_file=MODEL_FILE, model_type="llama", gpu_layers=0, hf=True
    )
    logging.info("LLM loaded successfully.")

# --- API ENDPOINT ---
@app.route('/ask', methods=['POST'])
def ask_assistant():
    """(FIXED) This is the final, correct version that avoids the 'tolist' error."""
    if not llm:
        return jsonify({"error": "LLM not initialized."}), 503

    data = request.get_json()
    query = data.get('question')
    if not query:
        return jsonify({"error": "No question provided."}), 400

    logging.info(f"Received query: {query}")
    context = retrieve_context(query)
    prompt = generate_prompt(query, context)
    
    # The correct way to call the ctransformers model is directly with the string
    response = llm(prompt, max_new_tokens=256, temperature=0.2, stop=["<|im_end|>"])
    
    logging.info(f"Generated response: {response}")
    return jsonify({"answer": response.strip()})

if __name__ == '__main__':
    initialize_ai()
    app.run(host='127.0.0.1', port=5000)