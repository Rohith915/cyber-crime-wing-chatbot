document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const sopDisplay = document.getElementById('sop-display');
    const assistantText = document.getElementById('assistant-text');
    const officerQuestionInput = document.getElementById('officer-question');
    const askButton = document.getElementById('ask-button');
    const historyList = document.getElementById('history-list');
    const newsText = document.getElementById('news-text');

    let currentCrime = null;
    let currentStepIndex = 0;
    const investigationHistory = new Set();

    // --- Initial Setup ---
    populateCrimeTypes();
    startNewsTicker();

    // --- Event Listeners ---
    searchButton.addEventListener('click', startInvestigation);
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') startInvestigation(); });
    askButton.addEventListener('click', handleOfficerQuestion);
    officerQuestionInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleOfficerQuestion(); });

    // --- Core Functions ---
    function populateCrimeTypes() {
        const dataList = document.getElementById('crime-types');
        if (!dataList) return;
        const crimeTypes = Object.keys(sopData);
        crimeTypes.forEach(crime => {
            const option = document.createElement('option');
            option.value = crime;
            dataList.appendChild(option);
        });
    }

    function startInvestigation() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            alert('Please enter a crime type or keyword.');
            return;
        }
        
        const crimeKey = Object.keys(sopData).find(key =>
            key.toLowerCase().includes(query) ||
            (sopData[key].keywords && sopData[key].keywords.some(k => k.toLowerCase().includes(query)))
        );
        
        if (crimeKey) {
            currentCrime = sopData[crimeKey];
            currentStepIndex = 0;
            displayStep(); // This function will now display the SOP correctly
            updateHistory(crimeKey, currentCrime.title);
        } else {
            sopDisplay.innerHTML = `<div class="sop-card"><p>No SOP found for "${searchInput.value}".</p></div>`;
        }
    }
    
    function proceedToNextStep() {
        currentStepIndex++;
        if (currentStepIndex < currentCrime.steps.length) {
            displayStep();
        } else {
            displaySummary();
        }
    }

    function displayStep() {
        sopDisplay.innerHTML = '';
        const stepData = currentCrime.steps[currentStepIndex];
        const stepHtml = `
        <div class="sop-card">
            <h2>${currentCrime.title} (Step ${stepData.step} of ${currentCrime.steps.length})</h2>
            <h3>Step Description:</h3><p class="step-description">${stepData.description}</p>
            <h3>Evidence Checklist:</h3><ul>${(stepData.evidenceChecklist || []).map(item => `<li>${item}</li>`).join('')}</ul>
            <h3>Legal Framework:</h3><p>${stepData.legal}</p>
            <div class="navigation-container" style="text-align:center; margin-top: 2rem;">
                <button id="nextStepButton" style="background-color: #437ed5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Proceed to Next Step</button>
            </div>
        </div>`;
        sopDisplay.innerHTML = stepHtml;
        document.getElementById('nextStepButton').addEventListener('click', proceedToNextStep);
    }

    function displaySummary() {
        const summaryHtml = `
        <div class="sop-card summary-card">
            <h2>End of Procedure: ${currentCrime.title}</h2>
            <p><strong>Note:</strong> Ensure all collected evidence is properly documented and filed according to procedure.</p>
        </div>`;
        sopDisplay.innerHTML = summaryHtml;
    }

    function updateHistory(crimeKey, crimeTitle) {
        if (investigationHistory.has(crimeKey)) return;
        investigationHistory.add(crimeKey);
        const placeholder = historyList.querySelector('.history-placeholder');
        if (placeholder) placeholder.remove();

        const historyItem = document.createElement('li');
        historyItem.textContent = crimeTitle;
        historyItem.dataset.crimeKey = crimeKey;
        
        historyItem.addEventListener('click', () => {
            searchInput.value = crimeKey;
            startInvestigation();
        });
        historyList.prepend(historyItem);
    }

    function startNewsTicker() {
        const newsItems = [
            "<span>ALERT:</span> New strain of phishing email targeting government employees detected.",
            "<span>UPDATE:</span> RBI issues new guidelines for digital payment security to combat rising online fraud.",
            "<span>NEWS:</span> Interpol launches global operation 'CyberSurge' against ransomware groups.",
        ];
        newsText.innerHTML = newsItems.join(' ••• ');
    }
    
    function updateAssistant(message, isThinking = false) {
        const assistantPanel = document.getElementById('assistant-text');
        assistantPanel.innerHTML = message;
    }

    // --- AI Assistant Handler ---
    async function handleOfficerQuestion() {
        const question = officerQuestionInput.value.trim();
        if (!question) return;
        officerQuestionInput.value = ""; 
        updateAssistant("Processing query...");

        try {
            const response = await fetch('http://127.0.0.1:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question }),
            });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            const data = await response.json();
            updateAssistant(data.answer);
        } catch (error) {
            console.error("Error communicating with the AI backend:", error);
            updateAssistant("Connection to AI assistant failed. Please ensure the backend server is running.");
        }
    }
});
