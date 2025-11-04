Cyber Crime Investigation Assistant
This project is a web-based dashboard designed to assist police officers in investigating cyber crimes. It provides two main features:

A Guided Investigation Chatbot that walks an officer through the Standard Operating Procedures (SOPs) for specific crime types.

An AI-Powered Assistant to answer free-form questions and provide additional support.

This tool is designed to standardize investigation protocols, provide quick access to legal sections and sample notices, and serve as a training and support tool for investigating officers.

Features
Interactive Guided Investigations: Step-by-step chatbot flows for 9 different cyber crime types, including Investment Fraud, UPI Fraud, SIM Swap Fraud, and Digital Arrest.

Dynamic SOP Display: Based on the officer's inputs, the chatbot provides specific action items, recommended legal sections, and templates for legal notices (e.g., for WhatsApp, ISPs, banks).

AI-Powered Assistant: A separate panel allows an officer to ask free-form questions (e.g., "What is Section 66C of the IT Act?") and receive answers from a generative AI backend.

Investigation History: The left panel keeps a clickable history of the guided investigations started during the current session.

Responsive Interface: A clean, modern UI designed for desktop use.

Technology Stack
Frontend:

HTML5

CSS3

Vanilla JavaScript (ES6+)

Backend (for AI Assistant):

Python

Flask

Flask-CORS

A Generative AI Python SDK (e.g., google-generativeai)

Project Structure
/
├── index.html          # The main application UI page
├── login.html          # A static login page
├── css/
│   └── style.css       # All styles for the application
├── js/
│   └── script.js       # Core frontend logic, including all interactive flows
├── data/
│   └── sopData.js      # Stores definitions and keywords for SOPs
├── ai_backend/
│   ├── server.py       # The Python Flask server for the AI assistant
│   ├── requirements.txt # Python dependencies
│   └── docs/           # Investigation manuals (PDFs)
├── assests/            # Logos, icons, and images
└── ...
Setup and Installation
This project has two parts that need to be run separately: the Frontend (the web interface) and the Backend (the AI server).

1. Frontend
The frontend is a static website. You can run it by simply opening the index.html file.

Clone this repository:

Bash

git clone https://github.com/your-username/cyber-crime-wing-chatbot.git
Navigate to the project directory:

Bash

cd cyber-crime-wing-chatbot/my\ cyber\ crime\ project/
Open the index.html file directly in your web browser.

2. Backend (AI Assistant)
The backend server powers the "AI Assistant" feature.

Navigate to the ai_backend directory:

Bash

cd ai_backend
(Recommended) Create and activate a Python virtual environment:

Bash

# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
Install the required Python dependencies from requirements.txt:

Bash

pip install -r requirements.txt
Configure API Key: You must have an API key from a generative AI provider (like Google AI Studio). Set this key as an environment variable, or modify server.py to include your key.

Bash

# Example for Windows
set GOOGLE_API_KEY="YOUR_API_KEY_HERE"

# Example for macOS / Linux
export GOOGLE_API_KEY="YOUR_API_KEY_HERE"
Run the Flask server:

Bash

python server.py
The server will start running on http://127.0.0.1:5000. The frontend is already configured to connect to this address.

How to Use
Start a Guided Investigation:

Open the index.html file.

In the top search bar, type a crime type or keyword (e.g., "upi fraud", "sim swap", "investment") and click the "Search" button or press Enter.

Follow the Steps:

The main "SOP Display" area will load the first step of the interactive flow.

Read the bot's message and click the buttons (e.g., "Yes, FIR Registered", "Need Sample Notice") to proceed through the investigation.

Use the AI Assistant:

For general questions, type your query into the "Officer's Query" box on the right-hand panel.

Click the "Ask" button.

The AI's response will appear in the "Assistant's Response" box above. (This requires the backend server to be running)
