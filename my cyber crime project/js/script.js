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
    const historyToggle = document.getElementById('history-toggle');
    const leftPanel = document.getElementById('left-panel');
    const mainGrid = document.getElementById('main-grid'); 

    // *** NEW: Reference for the custom suggestion box ***
    const sopSuggestions = document.getElementById('sop-suggestions');
    // *** NEW: Array to hold all SOP titles for filtering ***
    let sopTitles = [];

    let currentCrime = null;
    let currentStepIndex = 0;
    const investigationHistory = new Set();

    // --- Initial Setup ---
    populateCrimeTypes(); // This function is now different
    startNewsTicker();

    // --- Event Listeners ---
    searchButton.addEventListener('click', startInvestigation);
    searchInput.addEventListener('keyup', (e) => { 
        if (e.key === 'Enter') {
            startInvestigation();
        }
    });

    // *** NEW: Show suggestions as user types ***
    searchInput.addEventListener('input', showSuggestions);
    
    // *** NEW: Show all suggestions on click/focus ***
    searchInput.addEventListener('focus', showSuggestions);

    // *** NEW: Handle clicking on a suggestion item ***
    sopSuggestions.addEventListener('click', selectSuggestion);

    // *** NEW: Hide suggestions when clicking outside ***
    document.addEventListener('click', (e) => {
        // Hide if clicked outside the search wrapper
        if (!e.target.closest('.search-wrapper')) {
            sopSuggestions.style.display = 'none';
        }
    });

    askButton.addEventListener('click', handleOfficerQuestion);
    officerQuestionInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleOfficerQuestion(); });

    historyToggle.addEventListener('click', () => {
        leftPanel.classList.toggle('collapsed');
        mainGrid.classList.toggle('left-panel-collapsed');
        
        if (leftPanel.classList.contains('collapsed')) {
            historyToggle.innerHTML = '&#9776;'; // Hamburger icon
            historyToggle.title = "Show History";
        } else {
            historyToggle.innerHTML = '&times;'; // Close icon
            historyToggle.title = "Hide History";
        }
    });
    
    // --- Core Functions ---
    
    // *** MODIFIED: Populates the sopTitles array for our custom list ***
    function populateCrimeTypes() {
        // This function assumes sopData is loaded and available
        if (typeof sopData !== 'undefined') {
            sopTitles = Object.values(sopData).map(sop => sop.title);
        } else {
            console.error("sopData.js is not loaded or sopData object is not defined.");
        }
    }

    // *** MODIFIED: Filters and displays the suggestion box ***
    function showSuggestions() {
        const query = searchInput.value.toLowerCase();
        sopSuggestions.innerHTML = ''; // Clear old suggestions
        
        let titlesToShow = [];

        if (query.length === 0) {
            // If query is empty (on focus), show all titles
            titlesToShow = sopTitles;
        } else {
            // If query is not empty (on input), filter titles
            titlesToShow = sopTitles.filter(title => 
                title.toLowerCase().includes(query)
            );
        }
        
        if (titlesToShow.length > 0) {
            titlesToShow.forEach(title => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = title;
                sopSuggestions.appendChild(item);
            });
            sopSuggestions.style.display = 'block';
        } else {
            // Hide only if no titles match the filter
            sopSuggestions.style.display = 'none';
        }
    }

    // *** NEW: Handles clicking on a suggestion item ***
    function selectSuggestion(e) {
        if (e.target.classList.contains('suggestion-item')) {
            searchInput.value = e.target.textContent; // Set input value to the clicked title
            sopSuggestions.style.display = 'none'; // Hide the suggestion box
        }
    }

    // *** MODIFIED: Hides suggestion box on search start ***
    function startInvestigation() {
        sopSuggestions.style.display = 'none'; // Hide suggestions
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter or select a crime type.');
            return;
        }
        
        // Find the correct SOP key
        const crimeKey = Object.keys(sopData).find(key => {
            const title = sopData[key].title.toLowerCase();
            const keywords = sopData[key].keywords || [];
            const queryLower = query.toLowerCase();

            // Check 1: Does the query match the full title? (e.g., from datalist)
            if (title.toLowerCase() === queryLower) {
                return true;
            }
            // Check 2: Does the query match the key? (e.g., "otp fraud")
            if (key.toLowerCase().includes(queryLower)) {
                return true;
            }
            // Check 3: Does the query match a keyword? (e.g., "vishing")
            return keywords.some(k => k.toLowerCase().includes(queryLower));
        });
        
        // *** MODIFIED to handle new interactive flows ***
        if (crimeKey) {
            // Check for interactive flows first
            if (crimeKey === "investment fraud") {
                startInvestmentFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "upi fraud") { // Assumed key from sopData.js
                startUpiFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "card fraud") { // Assumed key from sopData.js
                startCardFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "internet banking fraud") { // Assumed key from sopData.js
                startInternetBankingFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "online financial fraud") { // *** NEWLY ADDED ***
                startOnlineFinancialFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "otp fraud") { // *** NEWLY ADDED ***
                startOtpFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "sim swap fraud") { // *** NEWLY ADDED ***
                startSimSwapFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "social media impersonation") { // *** NEWLY ADDED ***
                startSocialMediaImpersonationFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else if (crimeKey === "digital arrest") { // *** NEWLY ADDED ***
                startDigitalArrestFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else {
                // Original functionality for any remaining standard SOPs
                currentCrime = sopData[crimeKey];
                if (currentCrime.steps && currentCrime.steps.length > 0) {
                    currentStepIndex = 0;
                    displayStep(); // This uses the old (non-chat) display
                    updateHistory(crimeKey, currentCrime.title);
                } else {
                    sopDisplay.innerHTML = `<div class="sop-card"><p>SOP for "${sopData[crimeKey].title}" is in development.</p></div>`;
                }
            }
            // Reset input after successful search
            searchInput.value = "";
        } else {
            sopDisplay.innerHTML = `<div class="sop-card"><p>No SOP found for "${searchInput.value}".</p></div>`;
        }
    }
    
    // --- Standard SOP Functions (for other crimes) ---
    function proceedToNextStep() {
        currentStepIndex++;
        if (currentStepIndex < currentCrime.steps.length) {
            displayStep();
        } else {
            displaySummary();
        }
    }

    function displayStep() {
        sopDisplay.innerHTML = ''; // Clear display for standard SOP
        const stepData = currentCrime.steps[currentStepIndex];
        const stepHtml = `
        <div class="sop-card">
            <h2>${currentCrime.title} (Step ${stepData.step} of ${currentCrime.steps.length})</h2>
            <h3>Step Description:</h3><p class="step-description">${stepData.description}</p>
            <h3>Evidence Checklist:</h3><ul>${(stepData.evidenceChecklist || []).map(item => `<li>${item}</li>`).join('')}</ul>
            <h3>Legal Framework:</h3><p>${stepData.legal}</p>
            <div class="navigation-container" style="text-align:center; margin-top: 2rem;">
                <button id="nextStepButton" style="background-color: #007acc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Proceed to Next Step</button>
            </div>
        </div>`;
        sopDisplay.innerHTML = stepHtml;
        // Need to find the new button and add its listener
        const nextButton = document.getElementById('nextStepButton');
        if (nextButton) {
            nextButton.addEventListener('click', proceedToNextStep);
        }
    }

    function displaySummary() {
        const summaryHtml = `
        <div class="sop-card summary-card">
            <h2>End of Procedure: ${currentCrime.title}</h2>
            <p><strong>Note:</strong> Ensure all collected evidence is properly documented and filed according to procedure.</p>
        </div>`;
        sopDisplay.innerHTML = summaryHtml;
    }

    // --- History and News Ticker ---
    
    function updateHistory(crimeKey, crimeTitle) {
        if (investigationHistory.has(crimeKey)) return;
        investigationHistory.add(crimeKey);
        const placeholder = historyList.querySelector('.history-placeholder');
        if (placeholder) placeholder.remove();

        const historyItem = document.createElement('li');
        historyItem.textContent = crimeTitle;
        historyItem.dataset.crimeKey = crimeKey; // Still store key for reference
        
        historyItem.addEventListener('click', () => {
            searchInput.value = crimeTitle; // Set input to the full title
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
    
    // --- AI Assistant Handler (Right Panel - No Change) ---
    function updateAssistant(message, isThinking = false) {
        const assistantPanel = document.getElementById('assistant-text');
        assistantPanel.innerHTML = message;
    }
    
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

    // --- *** START OF INTERACTIVE FLOWS *** ---

    // --- *** Investment Fraud Interactive Flow (Existing) *** ---
// --- *** Investment Fraud Interactive Flow (MODIFIED) *** ---
const investmentFraudFlow = {
    'start': {
        message: "Welcome, Officer. This is the Cybercrime Investigation Assistant. Let's begin the investigation. Have you received a detailed written complaint from the victim?",
        options: [
            { text: "Yes", action: 'p1_checklist_1' },
            { text: "No", action: 'p1_action_complaint' }
        ]
    },
    'p1_action_complaint': {
        message: "<strong>Action Required:</strong> Please obtain a formal written complaint from the victim first. This is the legal foundation for the investigation.",
        options: [
            { text: "Back", action: 'start' }
        ]
    },
    'p1_checklist_1': {
        message: "Great. Let's start with the preliminary evidence.<br><br><strong>Evidence Checklist Item 1/1:</strong><br>Do you have the victim's <strong>bank account statements</strong> showing the fraudulent transactions?",
        options: [
            { text: "Yes, Collected", action: 'p1_fir_check' },
            { text: "No, Not Yet", action: 'p1_action_checklist_1' },
            { text: "Fund Trial Analysis", action: 'financial_menu' }
        ]
    },
    'p1_action_checklist_1': {
        message: "<strong>Action Required:</strong> Please obtain the bank statements first. They are the primary document for the financial investigation.",
        options: [
            { text: "Back", action: 'p1_checklist_1' },
            { text: "Fund Trial Analysis", action: 'financial_menu' }
        ]
    },
    
    'p1_fir_check': {
        message: "Now that the preliminary evidence is in order, have you registered the First Information Report (FIR)?",
        options: [
            { text: "Yes, FIR Registered", action: 'p1_fir_sections' },
            { text: "No, Not Yet", action: 'p1_action_fir' }
        ]
    },
    'p1_action_fir': {
        message: "<strong>Action Required:</strong> Please register the FIR immediately. A registered FIR number is mandatory for sending legal notices under Section 91 CrPC.",
        options: [
            { text: "Back", action: 'p1_fir_check' }
        ]
    },

    'p1_fir_sections': { 
        message: "Please ensure the recommended sections are included:<br><ul><li><strong>Indian Penal Code (IPC):</strong> Section <strong>419</strong> (Cheating by Personation) & Section <strong>420</strong> (Cheating).</li><li><strong>Information Technology (IT) Act:</strong> Section <strong>66D</strong> (Cheating by Personation using a computer resource) & Section <strong>66C</strong> (Identity Theft).</li></ul>",
        options: [
            { text: "Continue to Digital Evidence", action: 'digital_evidence_menu' }
        ]
    },
    
    // --- Digital Evidence Branch (NEW) ---
    'digital_evidence_menu': { 
        message: "Does your complaint involve any of the following? Please select one.<br><ol><li>Facebook</li><li>WhatsApp</li><li>Website</li><li>App Store</li><li>Play Store</li><li>APK file</li><li>Trace an IP Address</li></ol>",
        options: [
            { text: "1. Facebook", action: 'digital_facebook' },
            { text: "2. WhatsApp", action: 'digital_whatsapp' },
            { text: "3. Website", action: 'digital_website' },
            { text: "4. App Store", action: 'digital_app_store' },
            { text: "5. Play Store", action: 'digital_play_store' },
            { text: "6. APK file", action: 'digital_apk' },
            { text: "7. Trace an IP Address", action: 'digital_ip_trace' },
            { text: "No / Nothing Else", action: 'field_menu' }
        ]
    },

    'digital_app_store': { // MODIFIED
        message: "You've selected <strong>Apple App Store</strong>. You need to send a legal notice to Apple Inc. to get developer details and request a takedown.",
        options: [
            { text: "Show Sample Notice", action: 'digital_app_store_sample' },
            { text: "Back to Evidence List", action: 'digital_evidence_menu' }
        ]
    },
    'digital_app_store_sample': { // NEW STEP
        message: `Here is a sample notice for Apple. Send it to their legal compliance team.
        <hr>
        <pre class="notice-sample">
To:
    Legal Department (Law Enforcement Response)
    Apple Inc.
    One Apple Park Way
    Cupertino, CA 95014, USA

NOTICE UNDER SECTION 91 CrPC

Ref: Case FIR No. [Enter Your FIR Number]...
Subject: Request for Information and Takedown of Fraudulent Application.

Sir/Madam,

This office is investigating a cybercrime case (FIR No. ...) wherein a fraudulent application hosted on the Apple App Store is being used to defraud citizens.

Details of the application:
- App Name: [Name of the Fraudulent App]
- App Store URL: [Paste the URL of the App]
- Developer Name: [Name of Developer as seen on store]

You are hereby directed under Section 91 CrPC to provide the following details:
1.  Complete developer/registrant details (Name, address, email, phone number).
2.  Payment details used to register the developer account.
3.  IP logs for developer account creation and app management.

Furthermore, you are requested under Sec 79(3)(b) of the IT Act, 2000, to immediately take down/block access to this fraudulent application to prevent further offenses.

(Signature and Official Seal)

[Your Name]
[Your Designation]
        </pre>
        <hr>
        <p>Once the notice is prepared, send it to the appropriate legal portal for Apple.</p>`,
        options: [
            { text: "Notice Sent", action: 'digital_evidence_menu' },
            { text: "Back", action: 'digital_app_store' }
        ]
    },

    'digital_play_store': { // MODIFIED
        message: "You've selected <strong>Google Play Store</strong>. You need to send a legal notice to Google LLC to get developer details and request a takedown.",
        options: [
            { text: "Show Sample Notice", action: 'digital_play_store_sample' },
            { text: "Back to Evidence List", action: 'digital_evidence_menu' }
        ]
    },
    'digital_play_store_sample': { // NEW STEP
        message: `Here is a sample notice for Google. Send it via Google's Law Enforcement Request System (LERS).
        <hr>
        <pre class="notice-sample">
To:
    Law Enforcement Response Team
    Google LLC
    1600 Amphitheatre Parkway
    Mountain View, CA 94043, USA

NOTICE UNDER SECTION 91 CrPC

Ref: Case FIR No. [Enter Your FIR Number]...
Subject: Request for Information and Takedown of Fraudulent Application.

Sir/Madam,

This office is investigating a cybercrime case (FIR No. ...) wherein a fraudulent application hosted on the Google Play Store is being used to defraud citizens.

Details of the application:
- App Name: [Name of the Fraudulent App]
- Play Store URL: [Paste the URL of the App]
- Developer Name/Email: [Developer info from store]

You are hereby directed under Section 91 CrPC to provide the following details:
1.  Complete developer/registrant details (Name, address, email, phone number).
2.  Payment details used to register the developer account.
3.  IP logs for developer account creation and app management.

Furthermore, you are requested under Sec 79(3)(b) of the IT Act, 2000, to immediately take down/block access to this fraudulent application to prevent further offenses.

(Signature and Official Seal)

[Your Name]
[Your Designation]
        </pre>
        <hr>
        <p>Once the notice is prepared, submit it via Google's online LERS portal.</p>`,
        options: [
            { text: "Notice Sent", action: 'digital_evidence_menu' },
            { text: "Back", action: 'digital_play_store' }
        ]
    },

    'digital_apk': { 
        message: "<strong>Action Required:</strong> The .apk file should be sent to FSL for reverse engineering to find server IPs or other leads.",
        options: [ { text: "Back to Evidence List", action: 'digital_evidence_menu' } ]
    },

    // --- Existing Digital Flows (Unchanged from last time) ---
    'digital_whatsapp': {
        message: "You've selected the attacker's WhatsApp number (<code>+91xxxxx xxxxx</code>). Have you prepared a legal notice under Section 91 of the Code of Criminal Procedure (CrPC) for WhatsApp LLC?",
        options: [
            { text: "Yes, it's ready", action: 'digital_whatsapp_sent' },
            { text: "No, I need assistance", action: 'digital_whatsapp_assist' }
        ]
    },
    'digital_whatsapp_sent': {
        message: "Perfect. Have you submitted the scanned, signed, and sealed notice via your official government email ID to WhatsApp's Law Enforcement portal?",
        options: [
            { text: "Yes, Submitted", action: 'digital_evidence_menu' }, 
            { text: "Not Yet", action: 'digital_whatsapp_sent' }
        ]
    },
    'digital_whatsapp_assist': {
        message: "I can help with that. Would you like a sample notice? I can display it here and provide a download link.",
        options: [
            { text: "Yes, show me the sample", action: 'digital_whatsapp_sample' },
            { text: "No, I'll draft it myself", action: 'digital_whatsapp_draft' }
        ]
    },
    'digital_whatsapp_draft': {
        message: "Understood. Please ensure you request subscriber info and IP logs. Let me know once it has been sent.",
        options: [
            { text: "Notice has been sent", action: 'digital_evidence_menu' }, 
            { text: "Back", action: 'digital_whatsapp' }
        ]
    },
    'digital_whatsapp_sample': {
        message: `Of course. Here is the sample notice. Please replace the bracketed <code>[...]</code> information with your case details.
        <hr>
        <a href="data/sample_notices/whatsapp_notice.docx" class="sop-button download-button" download="Sample_WhatsApp_Notice.docx">Download Sample Notice as .docx</a>
        <pre class="notice-sample">
From:
[Your Name and Designation]
[Name of Police Station/Unit]
[City, State, PIN Code]
[Official Email ID]

To:
Law Enforcement Response Team
WhatsApp LLC
1601 Willow Road
Menlo Park, California 94025
United States of America.

NOTICE UNDER SECTION 91 OF THE CODE OF CRIMINAL PROCEDURE, 1973

Ref: Case FIR No. [Enter Your FIR Number], dated [DD/MM/YYYY]
Police Station: [Police Station Name]
Under Sections: 419, 420 IPC & 66C, 66D of the IT Act, 2000.

Subject: Request for Provision of User Data for Mobile Number +91 xxxxx xxxxx.

Sir/Madam,

This is to inform you that the aforementioned case has been registered at this police station, and the investigation is in progress. During the investigation, it has been revealed that the WhatsApp mobile number +91 xxxxx xxxxx was used by the accused to commit the offense of cheating and impersonation.

In the interest of the investigation, you are hereby directed under Section 91 CrPC to provide the following information associated with the WhatsApp number +91 xxxxx xxxxx for the period [Start Date] to [End Date]:

1.  Basic subscriber details (Name, registration email address, status, creation date).
2.  IP address logs of account creation.
3.  IP address logs for all sessions (login/logout activity) with date, timestamp (in UTC), and source port numbers for the specified period.

The requested information is crucial for the investigation and for tracing the accused. Kindly treat this matter as MOST URGENT. The information may be sent to the official email ID mentioned above.

A scanned copy of this signed notice is attached.

Sincerely,

(Signature and Official Seal)

[Your Name]
[Your Designation]
[Police Station Name]
Date: [DD/MM/YYYY]
        </pre>
        <hr>
        <p>Once you have filled in your details, signed, sealed, and sent the notice through the official portal (www.whatsapp.com/records/), please let me know.</p>`,
        options: [
            { text: "Notice has been sent", action: 'digital_evidence_menu' }, 
            { text: "Back", action: 'digital_whatsapp_assist' }
        ]
    },
        
    'digital_facebook': {
        message: "You've selected <strong>Facebook</strong>. The next step is to send a legal notice under Section 91 CrPC for the suspected Facebook profile URL. Do you need a sample notice for Meta Platforms, Inc.?",
        options: [
            { text: "Yes, provide a sample", action: 'digital_facebook_sample' },
            { text: "No, I have it ready", action: 'digital_facebook_ready' }
        ]
    },
    'digital_facebook_ready': {
        message: "Excellent. Please proceed to send it through the official Meta portal (facebook.com/records/login). We will await their response.",
        options: [
            { text: "Done", action: 'digital_evidence_menu' } 
        ]
    },
    'digital_facebook_sample': {
        message: `Certainly. Please adapt the following template with your specific case details.
        <hr>
        <a href="data/sample_notices/meta_notice.docx" class="sop-button download-button" download="Sample_Meta_Notice.docx">Download Sample Notice as .docx</a>
        <pre class="notice-sample">
From:
[Your Name and Designation]
[Name of Police Station/Unit]
[City, State, PIN Code]

To:
Nodal Officer, Law Enforcement Response
Meta Platforms, Inc.
1601 Willow Road
Menlo Park, CA 94025, USA.

NOTICE UNDER SECTION 91 CrPC

Ref: Case FIR No. [Enter Your FIR Number], dated [DD/MM/YYYY]
Police Station: [Police Station Name]
Under Sections: 419, 420 IPC & 66C, 66D of the IT Act, 2000.

Subject: Request for Data related to Facebook Profile: [Paste the Suspect Facebook Profile URL here]

Sir/Madam,

This is in connection with the investigation of the above-cited case, wherein the accused has used the aforementioned Facebook profile to cheat the complainant.

To proceed with the investigation, you are hereby directed under Section 91 CrPC to provide the following information associated with the Facebook profile URL mentioned above for the period [Start Date] to [End Date]:

1.  Subscriber details used for registration (Name, mobile no., email ID, date of birth).
2.  IP address logs for account creation and all login/logout activities with date, timestamp (UTC), and port numbers.
3.  History of all password changes and recovery email/phone numbers linked to the account.

This information is vital for identifying and apprehending the accused. Please send the data to my official email ID: [Your Official Email ID].

(Signature and Official Seal)

[Your Name]
[Your Designation]
        </pre>
        <hr>
        <p>After preparing the notice, please submit it via the official Meta Law Enforcement portal (facebook.com/records/login). Let me know when this is done.</p>`,
        options: [
            { text: "Notice has been sent", action: 'digital_evidence_menu' }, 
            { text: "Back", action: 'digital_facebook' }
        ]
    },
    
    'digital_website': {
        message: "You've selected the fraudulent website. The first step is to find its registrar and hosting provider. Have you performed a 'Whois' lookup?",
        options: [
            { text: "Yes, I have the details", action: 'digital_website_notice' },
            { text: "No, I haven't done that yet", action: 'digital_website_action' }
        ]
    },
    'digital_website_action': {
        message: "<strong>Action Required:</strong> Please use a tool like <code>www.who.is</code> or <code>www.centralops.net</code> to find these details. You will need them to proceed.",
        options: [
            { text: "Back", action: 'digital_website' }
        ]
    },
    'digital_website_notice': {
        message: "Great. Have you prepared and sent a notice under Section 91 CrPC to the legal/abuse contact email of the registrar/hosting provider?",
        options: [
            { text: "Yes, notice sent", action: 'digital_website_done' },
            { text: "No, I need a sample notice", action: 'digital_website_sample' }
        ]
    },
    'digital_website_done': {
        message: "Perfect. The digital footprint investigation is well underway. We await responses from the service providers.",
        options: [
            { text: "Continue", action: 'digital_evidence_menu' } 
        ]
    },
    'digital_website_sample': {
        message: `I can help with that. Here is a general template you can adapt for the registrar or hosting company.
        <hr>
        <a href="data/sample_notices/registrar_notice.docx" class="sop-button download-button" download="Sample_Registrar_Notice.docx">Download Sample Notice as .docx</a>
        <pre class="notice-sample">
To:
The Nodal/Legal Officer,
[Name of Registrar/Hosting Company]
[Company Address]

NOTICE UNDER SECTION 91 CrPC

Ref: Case FIR No. [Enter Your FIR Number]...

Subject: Request for Information regarding domain "www.exampledomain.com"

Sir/Madam,

This office is investigating a cybercrime case wherein the domain "www.exampledomain.com", registered with your service, has been used to defraud a citizen.

You are hereby directed under Section 91 CrPC to provide the following details:
1.  Registrant's complete details (Name, address, email, phone number).
2.  IP address used to register and manage the domain.
3.  All payment details used for domain registration and hosting services.
4.  Server access logs for the website hosted on this domain.

This information is critical for the investigation. Please treat this as urgent.

(Signature and Official Seal)

[Your Name]
[Your Designation]
        </pre>
        <hr>
        <p>Please send this notice to the email address found in the Whois record.</p>`,
        options: [
            { text: "Notice has been sent", action: 'digital_website_done' },
            { text: "Back", action: 'digital_website_notice' }
        ]
    },
        
    'digital_ip_trace': {
        message: "So, a service provider has responded with IP logs. Have you identified the corresponding Internet Service Provider (ISP) for a specific IP address using a WHOIS lookup?",
        options: [
            { text: "Yes, I know the ISP", action: 'digital_ip_notice' },
            { text: "No, not yet", action: 'digital_ip_action' }
        ]
    },
    'digital_ip_action': {
        message: "<strong>Action Required:</strong> Use <code>whois.domaintools.com</code> or a similar tool to find the ISP. An IP address without its owner is a dead end.",
        options: [
            { text: "Back", action: 'digital_ip_trace' }
        ]
    },
    'digital_ip_notice': {
        message: "Have you sent a notice under Section 91 CrPC to that ISP requesting the Subscriber Detail Record (SDR) for that IP address at the specific date and time (in IST)?",
        options: [
            { text: "Yes, notice sent", action: 'digital_evidence_menu' }, 
            { text: "No, I need a sample notice for an ISP", action: 'digital_ip_sample' }
        ]
    },
    'digital_ip_sample': {
        message: `Understood. Here is a template for requesting subscriber details from an Indian ISP.
        <hr>
        <a href="data/sample_notices/isp_notice.docx" class="sop-button download-button" download="Sample_ISP_Notice.docx">Download Sample Notice as .docx</a>
        <pre class="notice-sample">
To:
The Nodal Officer,
[Name of the ISP, e.g., Reliance Jio Infocomm Ltd.]
[Address of the ISP's Nodal Office]

NOTICE UNDER SECTION 91 CrPC

Ref: Case FIR No. [Enter Your FIR Number]...

Subject: Request for Subscriber Details for IP Address [Enter the IP Address e.g., 103.22.XX.XX]

Sir/Madam,

In connection with the investigation of the above case, the IP address mentioned above was used by the accused on [Date: DD/MM/YYYY] at [Time: HH:MM:SS IST].

You are directed under Section 91 CrPC to provide the Subscriber Detail Record (SDR) / IP User Details for the following session:
- IP Address: [Enter the IP Address]
- Date: [DD/MM/YYYY]
- Time: [HH:MM:SS IST]
- Port No (if available): [Port Number]

The details should include the user's name, registered address, and linked mobile number (CAF/SDR details).

(Signature and Official Seal)

[Your Name]
[Your Designation]
        </pre>
        <hr>`,
        options: [
            { text: "Notice has been sent", action: 'digital_evidence_menu' }, 
            { text: "Back", action: 'digital_ip_notice' }
        ]
    },

    // --- Financial Trail Branch (Now "Fund Trial Analysis") ---
    'financial_menu': {
        message: "You've selected <strong>Fund Trial Analysis</strong>. Have you analyzed the victim's bank statement and identified the beneficiary (mule) bank accounts?", 
        options: [
            { text: "Yes, I have the account numbers", action: 'financial_mule_notice' },
            { text: "No, I haven't identified them", action: 'financial_action_identify' }
        ]
    },
    'financial_action_identify': {
        message: "<strong>Action Required:</strong> Please meticulously review the victim's bank statement to list out all beneficiary account numbers. This is the starting point for following the money.",
        options: [
            { text: "Back", action: 'financial_menu' }
        ]
    },
    'financial_mule_notice': {
        message: "Excellent. Have you sent a notice to the nodal officers of the respective beneficiary banks to freeze the accounts and request KYC documents, the Account Opening Form (AOF), and the full account statement?",
        options: [
            { text: "Yes, notice sent", action: 'financial_mule_docs' },
            { text: "No, notice not sent yet", action: 'financial_action_send_notice' }
        ]
    },
    'financial_action_send_notice': {
        message: "<strong>Action Required:</strong> This is extremely time-sensitive. Send the notice to the banks immediately to prevent the accused from withdrawing the stolen money.",
        options: [
            { text: "Back", action: 'financial_mule_notice' }
        ]
    },
    'financial_mule_docs': {
        message: "Good. The accounts should be frozen. Have you received the statements and KYC documents from the banks yet?",
        options: [
            { text: "Yes, I have the documents", action: 'financial_mule_analysis' },
            { text: "No, still waiting", action: 'financial_mule_docs' },
            { text: "Proceed to Digital Evidence", action: 'digital_evidence_menu' } 
        ]
    },
    'financial_mule_analysis': {
        message: "Now, analyze the mule account statements. Did you find either of the following?",
        options: [
            { text: "Further transfers to other bank accounts", action: 'financial_mule_layer_2' },
            { text: "Cash withdrawals from an ATM", action: 'financial_mule_atm' },
            { text: "Trail ends here / Go to Digital Evidence", action: 'digital_evidence_menu' } 
        ]
    },
    'financial_mule_layer_2': {
        message: "<strong>New Lead:</strong> A second layer of mule accounts has been found. You must repeat the process: <strong>Immediately send a new notice</strong> to these new banks to freeze the accounts and request their KYC and statement details. This is a critical loop in the investigation.",
        options: [
            { text: "Done", action: 'financial_mule_analysis' },
            { text: "Back to Analysis", action: 'financial_mule_analysis' }
        ]
    },
    'financial_mule_atm': {
        message: "<strong>New Lead:</strong> This gives us a chance to identify the suspect physically. Note the ATM ID, location, date, and time. Have you sent a notice to the concerned bank requesting the CCTV footage for that specific withdrawal?",
        options: [
            { text: "Yes, notice sent", action: 'financial_mule_analysis' },
            { text: "No, I need help with that", action: 'financial_action_atm' }
        ]
    },
    'financial_action_atm': {
        message: "<strong>Action Required:</strong> Send a notice requesting the CCTV footage immediately, as banks may overwrite it. Mention the ATM ID, exact date, and time of withdrawal.",
        options: [
            { text: "Back", action: 'financial_mule_atm' }
        ]
    },
    // --- Field Investigation Branch (Remains the same) ---
    'field_menu': {
        message: "It appears you have gathered leads from Digital and Financial investigations. Are you ready to proceed to <strong>Phase 4: Field Investigation and Culmination</strong>?",
        options: [
            { text: "Yes, I have enough leads", action: 'field_correlate' },
            { text: "No, I need more evidence", action: 'digital_evidence_menu' } 
        ]
    },
    'field_correlate': {
        message: "Let's consolidate. Have you correlated the physical addresses obtained from ISPs (for IP addresses) and Banks (from KYC documents of mule accounts)?",
        options: [
            { text: "Yes, addresses are correlated", action: 'field_verify' },
            { text: "Not yet", action: 'field_action_correlate' }
        ]
    },
    'field_action_correlate': {
        message: "<strong>Action Required:</strong> Please consolidate all addresses and names from different sources into a single file. Cross-referencing them can reveal the main perpetrator.",
        options: [
            { text: "Back", action: 'field_correlate' }
        ]
    },
    'field_verify': {
        message: "Have you conducted physical verification at these addresses to confirm the suspects' identities and locations?",
        options: [
            { text: "Yes, suspects verified", action: 'field_apprehend' },
            { text: "Not yet", action: 'field_action_verify' }
        ]
    },
    'field_action_verify': {
        message: "<strong>Action Required:</strong> Please conduct physical verification (field work) to confirm the leads are accurate before taking any further action.",
        options: [
            { text: "Back", action: 'field_verify' }
        ]
    },
    'field_apprehend': {
        message: "Based on the solid evidence and verification, have you apprehended the accused?",
        options: [
            { text: "Yes, accused apprehended", action: 'field_seize' },
            { text: "Not yet", action: 'field_action_apprehend' }
        ]
    },
    'field_action_apprehend': {
        message: "<strong>Action Required:</strong> Plan and execute the apprehension based on your verified intelligence.",
        options: [
            { text: "Back", action: 'field_apprehend' }
        ]
    },
    'field_seize': {
        message: "Crucial next step: Have you seized the devices used to commit the offense (mobiles, laptops, SIM cards) by preparing a proper seizure mahazar, ensuring the devices are isolated from any network?",
        options: [
            { text: "Yes, devices seized", action: 'field_fsl' },
            { text: "No, not yet", action: 'field_action_seize' }
        ]
    },
    'field_action_seize': {
        message: "<strong>Action Required:</strong> Seize the devices immediately following legal procedure. They contain the primary evidence.",
        options: [
            { text: "Back", action: 'field_seize' }
        ]
    },
    'field_fsl': {
        message: "Have the seized electronic devices been sent to the Forensic Science Laboratory (FSL) for data extraction and analysis?",
        options: [
            { text: "Yes, sent to FSL", action: 'field_complete' },
            { text: "No, not yet", action: 'field_action_fsl' }
        ]
    },
    'field_action_fsl': {
        message: "<strong>Action Required:</strong> Please send the devices to FSL. The forensic report will serve as irrefutable scientific evidence in court.",
        options: [
            { text: "Back", action: 'field_fsl' }
        ]
    },
    'field_complete': {
        message: "<strong>Investigation Complete.</strong> You have followed all the critical steps. Once the FSL report is received, compile all documentary, digital, and physical evidence and file the final report (Charge Sheet) in the jurisdictional court. Excellent work, Officer.",
        options: [
            { text: "Start New Investigation", action: 'start_new' }
        ]
    }
};

    // --- *** NEW: UPI Fraud Interactive Flow *** ---
// --- *** NEW: UPI Fraud Interactive Flow (REFACTORED) *** ---
    const upiFraudFlow = {
        'start': {
            message: "Welcome, Officer. This is the UPI Fraud Investigation Assistant. Have you received a detailed written complaint from the victim?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> Please obtain a formal written complaint from the victim. This is the legal foundation for the investigation.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Great. Let's start with the preliminary evidence.<br><br><strong>Evidence Checklist 1/1:</strong><br>Do you have the victim's <strong>bank account statements</strong> showing the fraudulent transactions?",
            options: [
                { text: "Yes, Collected", action: 'p1_fir_check' },
                { text: "No, Not Yet", action: 'p1_action_checklist_1' },
                { text: "Fund Trial Analysis", action: 'financial_menu' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> Please obtain the bank statements first. They are the primary document for the financial investigation.",
            options: [
                { text: "Back", action: 'p1_checklist_1' },
                { text: "Fund Trial Analysis", action: 'financial_menu' }
            ]
        },
        // Old checklists removed
        'p1_fir_check': {
            message: "Now that the evidence is in order, have you registered the First Information Report (FIR)?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 420 (Cheating).</li><li><strong>IT Act:</strong> Sec 66D (Cheating by personation using a computer resource).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'digital_evidence_menu' }, // Go to new menu
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately. A registered FIR number is mandatory for sending legal notices under Section 91 CrPC.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        
        // --- NEW Digital Evidence Menu ---
        'digital_evidence_menu': {
            message: "Does your complaint involve any of the following? Please select one.",
            options: [
                { text: "Trace Fraudster's Mobile Number", action: 'digital_mobile' },
                { text: "No / Nothing Else", action: 'field_menu' }
            ]
        },

        // --- Fund Trial (Financial) ---
        'financial_menu': {
            message: "You've chosen <strong>Fund Trial Analysis</strong>. Based on the victim's statement, was the money transferred to a UPI ID linked to a Bank Account or a Mobile E-wallet (like Paytm, PhonePe)?",
            options: [
                { text: "Bank Account", action: 'fin_bank' },
                { text: "Mobile E-wallet", action: 'fin_wallet' }
            ]
        },
        'fin_bank': {
            message: "You have the beneficiary bank account details. Have you sent a notice under Section 91 CrPC to the beneficiary bank's nodal officer?<br>👉 The notice should request:<ul><li>An immediate <strong>freeze</strong> of the account.</li><li>The Account Opening Form (AOF) and full <strong>KYC</strong> documents.</li><li>The complete <strong>account statement</strong> from the date of opening.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'fin_bank_sent' },
                { text: "No, Need Sample", action: 'fin_bank_sample' }
            ]
        },
        'fin_bank_sample': {
            message: `Of course. Here is a sample notice. Please replace bracketed [...] information with your case details.
            <pre class="notice-sample">
From:
    [Your Name and Designation]
    [Name of Police Station/Unit]
To:
    The Nodal Officer,
    [Beneficiary Bank Name],
    [Bank Address].

NOTICE UNDER SECTION 91 Cr.P.C. / BANKERS' BOOK OF EVIDENCE ACT, 1891

Ref: Case FIR No. [Your FIR No.], dated [Date]
Police Station: [Your PS Name]
Under Sections: 420 IPC & 66D of the IT Act, 2000.

Subject: Request to Freeze Account and Provide Details for Account No. [Beneficiary Acct No.].

Sir/Madam,
This office is investigating the aforementioned cybercrime case, wherein the complainant was fraudulently induced to transfer money via UPI. The funds were credited to the following account held with your bank:

- Account Holder Name: [As per victim's statement]
- Account Number: [Beneficiary Acct No.]
- Amount: Rs. [Amount]
- Date of Transaction: [Date]
- UPI Transaction ID: [Transaction ID]

In the interest of the investigation, you are hereby directed under Section 91 CrPC to:
1.  <strong>IMMEDIATELY</strong> place a debit freeze on the aforementioned bank account to prevent further withdrawal of fraudulent funds.
2.  Provide a certified copy of the complete <strong>statement of account</strong> from its opening date to the present.
3.  Provide certified copies of the <strong>Account Opening Form (AOF)</strong> and all supporting <strong>KYC documents</strong> (ID proof, Address proof, PAN Card, Photo).
4.  Provide the <strong>mobile number(s)</strong> and <strong>email ID</strong> linked to this account for transaction alerts and internet banking.

The requested information is crucial and time-sensitive. Kindly treat this matter as MOST URGENT and send the details to the official email ID mentioned above.

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'fin_bank_sent' },
                { text: "Back", action: 'fin_bank' }
            ]
        },
        'fin_bank_sent': {
            message: "Good. The account should be frozen. Have you received the KYC documents and statement from the bank yet?",
            options: [
                { text: "Yes, Received", action: 'fin_bank_received' },
                { text: "Not Yet", action: 'fin_bank_waiting' }
            ]
        },
        'fin_bank_waiting': {
            message: "Please follow up with the bank for the documents. They are critical to proceed.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'fin_bank_received': {
            message: "Now, analyze the mule account statement. What is the subsequent transaction?",
            options: [
                { text: "Further Bank Transfer", action: 'fin_bank_layer2' },
                { text: "ATM Withdrawal", action: 'fin_bank_atm' },
                { text: "E-commerce Purchase", action: 'fin_bank_ecommerce' }
            ]
        },
        'fin_bank_layer2': {
            message: "<strong>New Lead:</strong> A second layer of mule accounts found. You must repeat the process: <strong>Immediately send a new notice</strong> to these new banks to freeze the accounts and request their KYC and statement details.",
            options: [
                { text: "Understood", action: 'fin_bank_received' }
            ]
        },
        'fin_bank_atm': {
            message: "<strong>New Lead:</strong> This provides a physical identifier. Note the ATM ID, location, date, and time. Have you sent a notice to the concerned bank requesting the CCTV footage for that specific withdrawal?",
            options: [
                { text: "Yes, Sent", action: 'fin_bank_atm_sent' },
                { text: "Not Yet", action: 'fin_bank_atm_action' }
            ]
        },
        'fin_bank_atm_sent': {
            message: "Excellent. Awaiting footage. This can help identify the suspect.",
            options: [
                { text: "Back to Analysis", action: 'fin_bank_received' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'fin_bank_atm_action': {
            message: "<strong>Action Required:</strong> Send the notice for CCTV footage immediately. Banks may overwrite footage after a certain period.",
            options: [
                { text: "Back", action: 'fin_bank_atm' }
            ]
        },
        'fin_bank_ecommerce': {
            message: "<strong>New Lead:</strong> Contact the e-commerce platform (e.g., Amazon, Flipkart). Send a notice with the transaction details and request the delivery address, registered mobile number, and account details for that purchase.",
            options: [
                { text: "Understood", action: 'fin_bank_received' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'fin_wallet': {
            message: "You are tracing funds to a mobile wallet. Have you sent a notice under Sec 91 CrPC to the nodal officer of the wallet service provider (e.g., Paytm, PhonePe, Google Pay)?<br>👉 The notice should request:<ul><li><strong>KYC details</strong> of the wallet holder.</li><li>The <strong>mobile number</strong> and <strong>email ID</strong> used for registration.</li><li>Complete <strong>transaction history</strong>.</li><li>Details of any <strong>bank accounts</strong> linked to the wallet.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'fin_wallet_sent' },
                { text: "Not Yet", action: 'fin_wallet_action' }
            ]
        },
        'fin_wallet_sent': {
            message: "Good. Once you receive the details, check if the money was transferred to a bank account. If so, proceed with the bank investigation path.",
            options: [
                { text: "OK, Received & Linked to Bank", action: 'fin_bank' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'fin_wallet_action': {
            message: "<strong>Action Required:</strong> Send the notice immediately to the wallet provider to prevent the funds from being moved.",
            options: [
                { text: "Back", action: 'fin_wallet' }
            ]
        },

        // --- Digital Trail ---
        'digital_mobile': {
            message: "You've chosen <strong>Digital Footprint Investigation</strong>. The primary digital lead is the mobile number linked to the UPI ID. Have you sent a notice under Section 91 CrPC to the relevant Mobile Service Provider (MSP)?<br>👉 The notice should request:<ul><li><strong>Subscriber Detail Record (SDR)</strong> / Customer Application Form (CAF).</li><li><strong>Call Detail Records (CDR)</strong> for the period of the crime.</li><li><strong>Tower location details</strong> for the time of the crime.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'digital_sent' },
                { text: "Not Yet", action: 'digital_action' }
            ]
        },
        'digital_sent': {
            message: "Excellent. Awaiting the SDR and CDR. This will provide the suspect's identity and location data.",
            options: [
                { text: "Proceed to Field Investigation", action: 'field_menu' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'digital_action': {
            message: "<strong>Action Required:</strong> Send the notice to the MSP immediately. The subscriber details are essential for identifying the accused.",
            options: [
                { text: "Back", action: 'digital_mobile' }
            ]
        },

        // --- Field Investigation ---
        'field_menu': {
            message: "You have gathered leads from both financial and digital investigations. Are you ready to proceed to <strong>Field Investigation</strong>?",
            options: [
                { text: "Yes, I have leads", action: 'field_correlate' },
                { text: "Need more information", action: 'digital_evidence_menu' }
            ]
        },
        'field_correlate': {
            message: "Let's consolidate. Have you correlated the physical addresses from the bank's KYC documents with the addresses from the MSP's subscriber forms (CAF/SDR)?",
            options: [
                { text: "Yes, addresses correlated", action: 'field_verify' },
                { text: "Not yet", action: 'field_action_correlate' }
            ]
        },
        'field_action_correlate': {
            message: "<strong>Action Required:</strong> Consolidate all addresses and names from the bank and MSP into a single file. Cross-referencing them can reveal the main perpetrator.",
            options: [
                { text: "Back", action: 'field_correlate' }
            ]
        },
        'field_verify': {
            message: "Have you conducted physical verification at these addresses to confirm the suspect's identity and location?",
            options: [
                { text: "Yes, suspect verified", action: 'field_apprehend' },
                { text: "Not yet", action: 'field_action_verify' }
            ]
        },
        'field_action_verify': {
            message: "<strong>Action Required:</strong> Please conduct physical verification (field work) to confirm the leads are accurate before taking further action.",
            options: [
                { text: "Back", action: 'field_verify' }
            ]
        },
        'field_apprehend': {
            message: "Based on the evidence and verification, have you apprehended the accused?",
            options: [
                { text: "Yes, accused apprehended", action: 'field_seize' },
                { text: "Not yet", action: 'field_action_apprehend' }
            ]
        },
        'field_action_apprehend': {
            message: "<strong>Action Required:</strong> Plan and execute the apprehension based on your verified intelligence.",
            options: [
                { text: "Back", action: 'field_apprehend' }
            ]
        },
        'field_seize': {
            message: "<strong>Critical Step:</strong> Have you seized the devices used to commit the offense (mobile phone, SIM card) by preparing a proper seizure mahazar?<br>👉 <strong>Evidence Preservation:</strong> Ensure the seized mobile is immediately put into Airplane Mode or placed in a Faraday bag/aluminium foil to prevent remote data wiping.",
            options: [
                { text: "Yes, devices seized & preserved", action: 'field_fsl' },
                { text: "No, not yet", action: 'field_action_seize' }
            ]
        },
        'field_action_seize': {
            message: "<strong>Action Required:</strong> Seize the devices immediately following legal procedure. They contain the primary evidence of the crime.",
            options: [
                { text: "Back", action: 'field_seize' }
            ]
        },
        'field_fsl': {
            message: "Have the seized electronic devices been sent to the Forensic Science Laboratory (FSL) for data extraction and analysis?",
            options: [
                { text: "Yes, sent to FSL", action: 'field_complete' },
                { text: "No, not yet", action: 'field_action_fsl' }
            ]
        },
        'field_action_fsl': {
            message: "<strong>Action Required:</strong> Please send the devices to FSL. The forensic report will serve as crucial scientific evidence in court.",
            options: [
                { text: "Back", action: 'field_fsl' }
            ]
        },
        'field_complete': {
            message: "<strong>Investigation Complete.</strong> Once the FSL report is received, compile all documentary, digital, and physical evidence and file the final report (Charge Sheet) in the jurisdictional court. Excellent work, Officer.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };

    // --- *** NEW: ATM/Card Fraud Interactive Flow (REFACTORED) *** ---
    const cardFraudFlow = {
        'start': {
            message: "Welcome, Officer. This is the Card Fraud Investigation Assistant. Have you received a detailed written complaint from the victim?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> A formal written complaint is necessary to begin the investigation.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Let's begin the evidence checklist.<br><br><strong>Evidence Checklist 1/1:</strong><br>The victim's <strong>bank account/credit card statement</strong> showing the fraudulent transaction(s), including date, time, and amount?",
            options: [
                { text: "Collected", action: 'p1_fir_check' },
                { text: "Not Yet", action: 'p1_action_checklist_1' },
                { text: "Fund Trial Analysis", action: 'financial_menu' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> The bank/card statement is the foundational document. Please obtain it first.",
            options: [
                { text: "Back", action: 'p1_checklist_1' },
                { text: "Fund Trial Analysis", action: 'financial_menu' }
            ]
        },
        // Old checklists removed
        'p1_fir_check': {
            message: "Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 420 (Cheating), Sec 379 (Theft, if card was stolen).</li><li><strong>IT Act:</strong> Sec 66C (Identity theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'financial_menu' }, // Go to fund trial
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR. It is mandatory for sending legal notices and proceeding with the investigation.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        
        // --- Fund Trial (Financial) ---
        'financial_menu': {
            message: "<strong>Fund Trial Analysis</strong><br>Based on the victim's statement, what was the nature of the fraudulent transaction?",
            options: [
                { text: "🏧 ATM Withdrawal", action: 'p2_atm' },
                { text: "🛒 Online/E-commerce Purchase", action: 'p2_ecommerce' },
                { text: "💳 POS Transaction", action: 'p2_pos' }
            ]
        },
        'p2_atm': {
            message: "You've selected <strong>ATM Withdrawal</strong>. This could be a card skimming case. Have you sent a notice to the victim's bank to get the ATM ID, Bank Name, and Location for the fraudulent withdrawal?",
            options: [
                { text: "Yes, details received", action: 'p2_atm_details' },
                { text: "Not Yet", action: 'p2_atm_action' }
            ]
        },
        'p2_atm_action': {
            message: "<strong>Action Required:</strong> First, get the ATM ID and location from the victim's bank. You cannot proceed without this information.",
            options: [
                { text: "Back", action: 'financial_menu' }
            ]
        },
        'p2_atm_details': {
            message: "Now that you have the ATM ID and location, have you sent a notice under Sec 91 CrPC to the concerned bank (where the withdrawal happened)?<br>👉 The notice must request:<ul><li><strong>CCTV footage</strong> of the ATM lobby for the specific date and time.</li><li><strong>Pin-hole camera image</strong> of the person performing the transaction.</li><li><strong>Electronic Journal (EJ) Log</strong> for the transaction.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_atm_chargeback' },
                { text: "No, Need Sample", action: 'p2_atm_sample' }
            ]
        },
        'p2_atm_sample': {
            message: `Here is a sample notice for requesting ATM footage.
            <pre class="notice-sample">
From:
    [Your Name and Designation]
    [Name of Police Station/Unit]
To:
    The Nodal Officer / Branch Manager,
    [Acquiring Bank Name],
    [Bank Address].

NOTICE UNDER SECTION 91 Cr.P.C.

Ref: Case FIR No. [Your FIR No.], dated [Date]
Police Station: [Your PS Name]
Subject: Request for CCTV Footage and Transaction Logs for Fraudulent ATM Withdrawal.

Sir/Madam,
This office is investigating a case of fraudulent ATM withdrawal. The details are as follows:
- Victim's Card Number (masked): [XXXX-XXXX-XXXX-1234]
- Your ATM ID: [ATM ID]
- ATM Location: [ATM Location]
- Date of Transaction: [Date]
- Time of Transaction: [Time]
- Amount Withdrawn: Rs. [Amount]

In the interest of the investigation, you are directed under Section 91 CrPC to provide the following:
1.  Certified copy of the complete <strong>CCTV camera footage</strong> from the ATM lobby and surrounding areas for the period [Time From] to [Time To] on the specified date.
2.  Certified copy of the <strong>pin-hole camera image</strong>/doom camera footage of the person who conducted the transaction.
3.  Certified copy of the <strong>Electronic Journal (EJ) Log</strong> for the specified transaction.

This evidence is extremely time-sensitive as footage may be overwritten. Please treat this as MOST URGENT.

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'p2_atm_chargeback' },
                { text: "Back", action: 'p2_atm_details' }
            ]
        },
        'p2_atm_chargeback': {
            message: "Excellent. The CCTV footage is the most critical evidence. Have you also requested the bank to initiate the chargeback procedure?",
            options: [
                { text: "Yes, Initiated", action: 'digital_evidence_menu' },
                { text: "Not Yet", action: 'p2_atm_chargeback_action' }
            ]
        },
        'p2_atm_chargeback_action': {
            message: "Please advise the victim to coordinate with their bank for the chargeback procedure.",
            options: [
                { text: "Done", action: 'digital_evidence_menu' }
            ]
        },
        'p2_ecommerce': {
            message: "You've selected <strong>Online Purchase</strong>. Have you identified the merchant/e-commerce platform (e.g., Amazon, Flipkart, etc.) from the transaction description in the bank statement?",
            options: [
                { text: "Yes, merchant identified", action: 'p2_ecommerce_notice' },
                { text: "No, merchant unknown", action: 'p2_ecommerce_action' }
            ]
        },
        'p2_ecommerce_action': {
            message: "<strong>Action Required:</strong> Send a notice to the victim's bank with the transaction details and ask them to provide the full merchant details from their payment gateway records.",
            options: [
                { text: "Back", action: 'financial_menu' }
            ]
        },
        'p2_ecommerce_notice': {
            message: "Have you sent a notice under Sec 91 CrPC to the nodal officer of the merchant/platform?<br>👉 The notice should request:<ul><li>Details of the product/service purchased.</li><li><strong>Delivery address</strong> for the product.</li><li><strong>Registered mobile number and email ID</strong> of the account holder.</li><li><strong>IP address</strong> used to place the order.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'digital_evidence_menu' },
                { text: "Not Yet", action: 'p2_ecommerce_notice_action' }
            ]
        },
        'p2_ecommerce_notice_action': {
            message: "<strong>Action Required:</strong> Send the notice to the merchant immediately. The delivery details are a critical and perishable lead.",
            options: [
                { text: "Back", action: 'p2_ecommerce_notice' }
            ]
        },
        'p2_pos': {
            message: "You've selected <strong>POS Transaction</strong>. Have you identified the name and location of the merchant establishment from the bank statement?",
            options: [
                { text: "Yes, identified", action: 'p2_pos_notice' },
                { text: "No, not clear", action: 'p2_pos_action' }
            ]
        },
        'p2_pos_action': {
            message: "<strong>Action Required:</strong> Contact the victim's bank to get clearer details about the POS merchant from the transaction record.",
            options: [
                { text: "Back", action: 'financial_menu' }
            ]
        },
        'p2_pos_notice': {
            message: "Have you sent a notice to the merchant's acquiring bank (the bank that provided the POS machine)?<br>👉 The notice should request:<ul><li>Full details of the merchant (Name, address, contact).</li><li>Transaction slip details.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_pos_visit' },
                { text: "Not Yet", action: 'p2_pos_notice_action' }
            ]
        },
        'p2_pos_notice_action': {
            message: "<strong>Action Required:</strong> Send the notice to the acquiring bank to get the merchant's details.",
            options: [
                { text: "Back", action: 'p2_pos_notice' }
            ]
        },
        'p2_pos_visit': {
            message: "Once you have the merchant's exact location, the next step is to visit the establishment and request to see their CCTV footage for the time of the transaction and to interview the staff.",
            options: [
                { text: "Understood", action: 'digital_evidence_menu' }
            ]
        },

        // --- NEW Digital Evidence Menu ---
        'digital_evidence_menu': {
            message: "Based on the responses from banks and merchants, what is your next step?",
            options: [
                { text: "Trace IP Address (from Online Purchase)", action: 'p3_ip' },
                { text: "Field Verification (from ATM/POS/Delivery Address)", action: 'p3_field' },
                { text: "No / Nothing Else", action: 'p4_apprehend' }
            ]
        },
        'p3_ip': {
            message: "You have received an IP address from an e-commerce platform. Have you identified the Internet Service Provider (ISP) for this IP using a WHOIS lookup tool (e.g., <code>www.whois.domaintools.com</code>)?",
            options: [
                { text: "Yes, ISP identified", action: 'p3_ip_notice' },
                { text: "Not Yet", action: 'p3_ip_action' }
            ]
        },
        'p3_ip_action': {
            message: "<strong>Action Required:</strong> Use a Whois tool to find the ISP. An IP address without its owner is a dead end.",
            options: [
                { text: "Back", action: 'digital_evidence_menu' }
            ]
        },
        'p3_ip_notice': {
            message: "Have you sent a notice under Sec 91 CrPC to the ISP, requesting the Subscriber Detail Record (SDR) for that IP address at the specific date and time (in IST)?",
            options: [
                { text: "Yes, Notice Sent", action: 'p3_ip_sent' },
                { text: "No, Need Sample", action: 'p3_ip_sample' }
            ]
        },
        'p3_ip_sent': {
            message: "Excellent. The SDR will provide the name and address of the internet connection user, a crucial lead.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p3_ip_sample': {
            message: `Here is a sample notice for an ISP.
            <pre class="notice-sample">
To:
    The Nodal Officer,
    [ISP Name, e.g., Reliance Jio]

NOTICE UNDER SECTION 91 CrPC

Ref: Case FIR No. [Your FIR No.]...
Subject: URGENT - Request for Subscriber Details for IP Address [Enter the IP Address]

Sir/Madam,
In connection with the investigation of the above case, the IP address mentioned above was used by the accused to commit an online financial fraud on [Date] at [Time, IST].

You are directed under Section 91 CrPC to provide the Subscriber Detail Record (SDR) / IP User Details for the following session:
- IP Address: [Enter the IP Address]
- Date: [Date]
- Time: [Time, IST]
- Port No (if available): [Port Number]

The details should include the user's name, registered installation address, and linked mobile number (CAF/SDR details).

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'p3_ip_sent' },
                { text: "Back", action: 'p3_ip_notice' }
            ]
        },
        'p3_field': {
            message: "You have a physical lead (suspect image from CCTV or a delivery address). Have you proceeded with field verification to identify the suspect?",
            options: [
                { text: "Yes, suspect identified", action: 'p4_apprehend' },
                { text: "Verification in Progress", action: 'p3_field_pending' }
            ]
        },
        'p3_field_pending': {
            message: "Understood. Continue with the field enquiry.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },

        // --- Field Investigation ---
        'p4_apprehend': {
            message: "You have identified a suspect through physical or digital evidence. Have you apprehended the accused?",
            options: [
                { text: "Yes, accused apprehended", action: 'p4_seize' },
                { text: "Not yet", action: 'p4_action_apprehend' }
            ]
        },
        'p4_action_apprehend': {
            message: "<strong>Action Required:</strong> Plan and execute the apprehension based on your verified intelligence.",
            options: [
                { text: "Back", action: 'p4_apprehend' }
            ]
        },
        'p4_seize': {
            message: "<strong>Critical Step:</strong> Have you seized the devices used (mobile, laptop, card skimmers, cloned cards) under a proper seizure mahazar?",
            options: [
                { text: "Yes, devices seized", action: 'p4_preserve' },
                { text: "No, not yet", action: 'p4_action_seize' }
            ]
        },
        'p4_action_seize': {
            message: "<strong>Action Required:</strong> Seize the instruments of the crime immediately.",
            options: [
                { text: "Back", action: 'p4_seize' }
            ]
        },
        'p4_preserve': {
            message: "<strong>Evidence Preservation:</strong> Have you isolated all electronic devices from networks (Airplane Mode, Faraday bags) and packaged physical evidence (cloned cards) correctly?",
            options: [
                { text: "Yes, Preserved", action: 'p4_fsl' },
                { text: "No", action: 'p4_action_preserve' }
            ]
        },
        'p4_action_preserve': {
            message: "<strong>Action Required:</strong> Preserve the evidence correctly to maintain its integrity for court.",
            options: [
                { text: "Back", action: 'p4_preserve' }
            ]
        },
        'p4_fsl': {
            message: "Have the seized electronic devices been sent to FSL for analysis?",
            options: [
                { text: "Yes, sent to FSL", action: 'p4_complete' },
                { text: "No, not yet", action: 'p4_action_fsl' }
            ]
        },
        'p4_action_fsl': {
            message: "<strong>Action Required:</strong> Send devices to FSL for forensic analysis to link the accused to the crime scientifically.",
            options: [
                { text: "Back", action: 'p4_fsl' }
            ]
        },
        'p4_complete': {
            message: "<strong>Investigation Complete.</strong> Once the FSL report is received, compile all evidence (CCTV footage, bank documents, merchant records, FSL report) and file the final report (Charge Sheet). Excellent work.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };

    // --- *** NEW: Internet Banking Fraud Interactive Flow (REFACTORED) *** ---
    const internetBankingFraudFlow = {
        'start': {
            message: "Welcome, Officer. This is the Internet Banking Fraud Investigation Assistant. Have you received a detailed written complaint from the victim?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> A formal written complaint is the necessary first step for any investigation.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Let's proceed with the preliminary evidence checklist.<br><br><strong>Evidence Checklist 1/1:</strong><br>The victim's <strong>bank account statement</strong> showing the fraudulent transaction(s)?",
            options: [
                { text: "Collected", action: 'p1_fir_check' },
                { text: "Not Yet", action: 'p1_action_checklist_1' },
                { text: "Fund Trial Analysis", action: 'p2_financial' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> The bank statement is the primary document. Please obtain it first.",
            options: [
                { text: "Back", action: 'p1_checklist_1' },
                { text: "Fund Trial Analysis", action: 'p2_financial' }
            ]
        },
        // Old checklists removed
        'p1_fir_check': {
            message: "Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 419 (Cheating by personation), Sec 420 (Cheating), Sec 468 (Forgery for purpose of cheating).</li><li><strong>IT Act:</strong> Sec 66C (Identity theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'digital_evidence_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately to proceed with the investigation.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        
        // --- Fund Trial (Financial) ---
        'p2_financial': {
            message: "You've chosen <strong>Fund Trial Analysis</strong>. Have you sent a notice to the victim's bank requesting details of the fraudulent transaction?<br>👉 The notice should request:<ul><li>The <strong>beneficiary account details</strong> (Account No, Name, Bank, IFSC).</li><li>The <strong>IP address</strong> from which the fraudulent internet banking session was logged.</li><li>The date and timestamp of the login and transaction.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_financial_sent' },
                { text: "Not Yet", action: 'p2_financial_action' }
            ]
        },
        'p2_financial_action': {
            message: "<strong>Action Required:</strong> Send this notice to the victim's bank immediately.",
            options: [
                { text: "Back", action: 'start' } // Go back to start
            ]
        },
        'p2_financial_sent': {
            message: "Have you received the beneficiary account details and the login IP address from the bank?",
            options: [
                { text: "Yes, Received Both", action: 'p2_financial_received' },
                { text: "Not Yet", action: 'p2_financial_waiting' }
            ]
        },
        'p2_financial_waiting': {
            message: "Please follow up with the victim's bank. The beneficiary details and IP address are the most critical pieces of information.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p2_financial_received': {
            message: "Excellent. You now have two strong leads. Which would you like to pursue now?",
            options: [
                { text: "Trace Beneficiary Account", action: 'p2_financial_trace_account' },
                { text: "Trace Login IP Address", action: 'p2_digital_ip' }
            ]
        },
        'p2_financial_trace_account': {
            message: "You have the beneficiary account details. Send a notice under Sec 91 CrPC to the beneficiary bank to <strong>immediately freeze the account</strong> and provide KYC, AOF, and the full statement.<br>👉 (This path now follows the standard financial fraud investigation flow for analyzing mule accounts.)",
            options: [
                { text: "OK, I'll follow the standard procedure", action: 'digital_evidence_menu' },
                { text: "I need a sample notice", action: 'p2_financial_sample' }
            ]
        },
        'p2_financial_sample': {
            message: `Please use the sample notice from the UPI Fraud flow. It is almost identical. Just ensure you specify the transaction type as "Internet Banking / NEFT / IMPS".`,
            options: [
                 { text: "Got it", action: 'p2_financial_trace_account' }
            ]
        },

        // --- NEW Digital Evidence Menu ---
        'digital_evidence_menu': {
            message: "<strong>Digital Footprint Investigation</strong><br>What is the primary digital evidence you have?",
            options: [
                { text: "📧 Phishing Email", action: 'p2_digital_email' },
                { text: "🌐 Fake Website URL", action: 'p2_digital_website' },
                { text: "Trace Login IP Address (from bank)", action: 'p2_digital_ip' },
                { text: "No / Nothing Else", action: 'p3_field' }
            ]
        },
        'p2_digital_email': {
            message: "You are investigating a phishing email. Have you analyzed the <strong>full email headers</strong> to find the 'Received: from' IP address, which indicates the sender's true IP?",
            options: [
                { text: "Yes, IP found", action: 'p2_digital_ip' },
                { text: "No, need help", action: 'p2_digital_email_help' }
            ]
        },
        'p2_digital_email_help': {
            message: "<strong>Action Required:</strong> Ask the victim to forward the email as an attachment or provide the 'Show Original' / 'View Full Header' text. The IP address is usually found in the topmost 'Received' line.<br><br>Additionally, have you sent a notice to the email service provider (e.g., Gmail, Yahoo) with the sender's email ID, requesting subscriber details and IP logs?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_digital_email_sent' },
                { text: "No, Need Sample", action: 'p2_digital_email_sample' }
            ]
        },
        'p2_digital_email_sent': {
            message: "Good. Awaiting response from the email provider.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p2_digital_email_sample': {
            message: "Please use the sample notice for Google/Yahoo/Microsoft from the Social Media SOPs and adapt it for this case.",
            options: [
                { text: "Got it", action: 'p2_digital_email_help' }
            ]
        },
        'p2_digital_website': {
            message: "You are investigating a fake website. First, perform a <strong>Whois lookup</strong> on the domain URL (e.g., using <code>www.whois.domaintools.com</code>). Have you done this?",
            options: [
                { text: "Yes, I have details", action: 'p2_digital_website_details' },
                { text: "Not Yet", action: 'p2_digital_website_action' }
            ]
        },
        'p2_digital_website_action': {
            message: "<strong>Action Required:</strong> A Whois lookup is the essential first step for any website investigation.",
            options: [
                { text: "Back", action: 'digital_evidence_menu' }
            ]
        },
        'p2_digital_website_details': {
            message: "From the Whois record, have you identified the <strong>Domain Registrar</strong> and the <strong>Hosting Provider</strong>?",
            options: [
                { text: "Yes, identified", action: 'p2_digital_website_notice' },
                { text: "No", action: 'p2_digital_website_action_2' }
            ]
        },
        'p2_digital_website_action_2': {
             message: "<strong>Action Required:</strong> Analyze the Whois record to find the legal/abuse contact emails for the registrar and host.",
             options: [
                { text: "Back", action: 'p2_digital_website_details' }
            ]
        },
        'p2_digital_website_notice': {
            message: "Send a Section 91 CrPC notice to both the registrar and the hosting provider.<br>👉 Request:<ul><li><strong>Registrant details</strong> (Name, address, email, phone).</li><li><strong>Payment details</strong> used for registration/hosting.</li><li><strong>Server access logs</strong> and the IP address of the server.</li></ul>",
            options: [
                { text: "Yes, Notices Sent", action: 'p2_digital_website_sent' },
                { text: "Not Yet", action: 'p2_digital_website_action_3' }
            ]
        },
        'p2_digital_website_action_3': {
            message: "<strong>Action Required:</strong> Send these notices. Also, send a notice under Sec 79(3)(b) of the IT Act for content removal to get the fake site taken down.",
            options: [
                { text: "Back", action: 'p2_digital_website_notice' }
            ]
        },
        'p2_digital_website_sent': {
            message: "Excellent. The registrant details could lead directly to the suspect.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p2_digital_ip': {
            message: "<strong>Sub-Branch: IP Address Tracing</strong><br>You have an IP address. Have you used a Whois tool to identify the Internet Service Provider (ISP) that owns this IP?",
            options: [
                { text: "Yes, ISP identified", action: 'p2_digital_ip_notice' },
                { text: "Not Yet", action: 'p2_digital_ip_action' }
            ]
        },
        'p2_digital_ip_action': {
            message: "<strong>Action Required:</strong> The ISP is the gatekeeper to the suspect's identity. Use a Whois tool to find the ISP.",
             options: [
                { text: "Back", action: 'digital_evidence_menu' }
            ]
        },
        'p2_digital_ip_notice': {
            message: "Have you sent a notice under Sec 91 CrPC to that ISP requesting the Subscriber Detail Record (SDR) for that IP address at the specific date and time (in IST)?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_digital_ip_sent' },
                { text: "No, Need Sample", action: 'p2_digital_ip_sample' }
            ]
        },
        'p2_digital_ip_sent': {
            message: "Excellent. The SDR will provide the name and physical address of the user of that internet connection at that exact time.",
            options: [
                { text: "Proceed to Field Investigation", action: 'p3_field' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p2_digital_ip_sample': {
            message: "Please use the standard ISP notice template provided in the Card Fraud flow.",
            options: [
                { text: "Got it", action: 'p2_digital_ip_notice' }
            ]
        },

        // --- Field Investigation ---
        'p3_field': {
            message: "You have gathered physical addresses from bank KYC and/or ISP subscriber records. Have you correlated these leads?",
            options: [
                { text: "Yes, addresses correlated", action: 'p3_field_verify' },
                { text: "No, addresses don't match", action: 'p3_field_no_match' },
                { text: "Not yet", action: 'p3_field_action_correlate' }
            ]
        },
        'p3_field_action_correlate': {
            message: "<strong>Action Required:</strong> Consolidate all addresses and names from different sources into a single file. Cross-referencing them can reveal the main perpetrator.",
            options: [
                { text: "Back", action: 'p3_field' }
            ]
        },
        'p3_field_no_match': {
            message: "This indicates the use of fake documents or a proxy. Re-investigate the digital trail. Did the hosting provider give you payment details? Tracing the payment method could be a new lead.",
            options: [
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p3_field_verify': {
            message: "Have you conducted a field enquiry to physically verify the suspect's location and identity?",
            options: [
                { text: "Yes, suspect verified", action: 'p4_apprehend' },
                { text: "Not yet", action: 'p3_field_action_verify' }
            ]
        },
        'p3_field_action_verify': {
            message: "<strong>Action Required:</strong> Conduct physical verification to confirm your digital leads.",
            options: [
                { text: "Back", action: 'p3_field_verify' }
            ]
        },
        'p4_apprehend': {
            message: "Based on the verified intelligence, have you apprehended the accused?",
            options: [
                { text: "Yes, accused apprehended", action: 'p4_seize' },
                { text: "Not yet", action: 'p4_action_apprehend' }
            ]
        },
        'p4_action_apprehend': {
            message: "<strong>Action Required:</strong> Plan and execute the apprehension.",
            options: [
                { text: "Back", action: 'p4_apprehend' }
            ]
        },
        'p4_seize': {
            message: "<strong>Critical Step:</strong> Have you seized the devices used in the offense (computer, laptop, mobile, hard drives) under a proper seizure mahazar?",
            options: [
                { text: "Yes, devices seized", action: 'p4_preserve' },
                { text: "No, not yet", action: 'p4_action_seize' }
            ]
        },
        'p4_action_seize': {
            message: "<strong>Action Required:</strong> Seize the instruments of the crime immediately.",
            options: [
                { text: "Back", action: 'p4_seize' }
            ]
        },
        'p4_preserve': {
            message: "<strong>Evidence Preservation:</strong> If a computer was seized while ON, was the power cord pulled from the back of the CPU to preserve volatile memory data? Were all devices isolated from networks?",
            options: [
                { text: "Yes, procedure followed", action: 'p4_fsl' },
                { text: "No", action: 'p4_action_preserve' }
            ]
        },
        'p4_action_preserve': {
            message: "<strong>Action Required:</strong> Follow correct seizure procedures to avoid evidence tampering.",
            options: [
                { text: "Back", action: 'p4_preserve' }
            ]
        },
        'p4_fsl': {
            message: "Have the seized devices been sent to FSL for forensic analysis?",
            options: [
                { text: "Yes, sent to FSL", action: 'p4_complete' },
                { text: "No, not yet", action: 'p4_action_fsl' }
            ]
        },
        'p4_action_fsl': {
            message: "<strong>Action Required:</strong> Send the devices to FSL to find evidence of the phishing kit, victim's credentials, and other artifacts.",
            options: [
                { text: "Back", action: 'p4_fsl' }
            ]
        },
        'p4_complete': {
            message: "<strong>Investigation Complete.</strong> Once the FSL report is received, compile all evidence (bank records, ISP records, FSL report, phishing emails) and file the final report (Charge Sheet). Excellent work.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };

    // --- *** NEW: Online Financial Fraud Interactive Flow (REFACTORED) *** ---
    const onlineFinancialFraudFlow = {
        'start': {
            message: "Welcome to the Cybercrime Investigation Assistant. Let's begin the investigation for Online Financial Fraud. Have you received a detailed written complaint from the victim?",
            options: [
                { text: "Yes, Received", action: 'p1_checklist_1' },
                { text: "Not Yet", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> Please obtain a formal written complaint from the victim first. This is mandatory to register an FIR and proceed legally.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Excellent.<br><br><strong>Evidence Checklist 1/1:</strong> Have you collected the victim's <strong>bank statement</strong> with the fraudulent transactions clearly identified?",
            options: [
                { text: "Collected", action: 'p1_fir_check' },
                { text: "Not Yet", action: 'p1_action_checklist_1' },
                { text: "Fund Trial Analysis", action: 'p2_triage' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> This is the most critical piece of evidence. Please instruct the complainant to procure it from their bank immediately.",
            options: [
                { text: "Back", action: 'p1_checklist_1' },
                { text: "Fund Trial Analysis", action: 'p2_triage' }
            ]
        },
        // Old checklists removed
        'p1_fir_check': {
            message: "Now that the preliminary evidence is noted, have you <strong>registered the First Information Report (FIR)</strong>?",
            options: [
                { text: "Yes, FIR Registered", action: 'p1_fir_sections' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately. A registered FIR is mandatory to issue notices under Section 91 Cr.P.C. to banks and intermediaries.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_sections': {
            message: "Thank you. Based on the nature of the crime, have the following sections been applied?<br>⚖️ <strong>IPC:</strong> Section 419 (Cheating by Personation), Section 420 (Cheating).<br>⚖️ <strong>IT Act:</strong> Section 66C (Identity Theft), Section 66D (Cheating by personation).",
            options: [
                { text: "Continue to Fund Trial", action: 'p2_triage' }
            ]
        },
        
        // --- Fund Trial (Financial) ---
        'p2_triage': {
            message: "<strong>Fund Trial Analysis</strong><br>We must trace the funds. Please select the primary method used by the fraudster to receive or withdraw the money, as per the victim's bank statement.",
            options: [
                { text: "ATM Withdrawal", action: 'p3_1_atm_start' },
                { text: "UPI / Wallet Transfer", action: 'p3_2_upi_start' },
                { text: "Bank Transfer (NEFT/RTGS/IMPS)", action: 'p3_2_upi_start' },
                { text: "E-Commerce Purchase", action: 'p3_3_ecommerce_start' },
                { text: "SIM Swap / OTP Fraud", action: 'p3_4_simswap_start' }
            ]
        },
        // --- 3.1 ATM ---
        'p3_1_atm_start': {
            message: "<strong>Sub-Flow: ATM / Card Fraud</strong><br>You have selected ATM Withdrawal. First, let's confirm the point of compromise. Did the fraud involve:",
            options: [
                { text: "Skimming/Cloning", action: 'p3_1_atm_details' },
                { text: "Physical Card Theft", action: 'p3_1_atm_details' }
            ]
        },
        'p3_1_atm_details': {
            message: "From the victim's bank statement or SMS, have you identified the <strong>ATM ID, Bank Name, and Location</strong> of the fraudulent withdrawal?",
            options: [
                { text: "Yes, Identified", action: 'p3_1_atm_notice' },
                { text: "Not Yet Identified", action: 'p3_1_atm_action_identify' }
            ]
        },
        'p3_1_atm_action_identify': {
            message: "<strong>Action Required:</strong> Send a notice to the victim's bank with the transaction details and request them to provide the ATM ID and location. This is the first step.",
            options: [
                { text: "Back", action: 'p2_triage' }
            ]
        },
        'p3_1_atm_notice': {
            message: "<strong>URGENT ACTION:</strong> Have you sent a notice to the concerned bank's nodal officer requesting to preserve and provide the <strong>CCTV footage</strong> for the specified ATM at the exact date and time?",
            options: [
                { text: "Notice Sent", action: 'p3_1_atm_pattern' },
                { text: "Need Sample Notice", action: 'p3_1_atm_sample' }
            ]
        },
        'p3_1_atm_sample': {
            message: `📄 Here is a sample notice. Please fill in the details and send it immediately, as footage is often overwritten.
            <pre class="notice-sample">
NOTICE UNDER SECTION 91 Cr.P.C.
From: [Your Name, Designation, Police Station]
To: The Nodal Officer, [Bank Name]

Ref: Cr.No. [FIR No.], u/s [Sections]
Sub: Request for preservation and provision of CCTV footage and transaction logs.

In the investigation of the above case, a fraudulent withdrawal was made from:
- ATM ID: [ATM ID]
- Location: [ATM Location]
- Date: [Date]
- Time: [Time]
- Amount: Rs. [Amount]
- Victim's Card No: [Last 4 digits]

You are directed under Sec 91 Cr.P.C. to immediately preserve and provide:
1. CCTV footage from all cameras (lobby, machine, entrance) for the period.
2. The complete Electronic Journal (EJ) log for the transaction.
3. Pin-hole camera images from the ATM machine.
This evidence is critical and time-sensitive.
(Signature & Seal of IO)
            </pre>`,
            options: [
                { text: "Notice Sent", action: 'p3_1_atm_pattern' },
                { text: "Back", action: 'p3_1_atm_notice' }
            ]
        },
        'p3_1_atm_pattern': {
            message: "✅ Excellent. Have you also requested the bank to check for other similar MO complaints linked to the same ATM (potential skimming point)?",
            options: [
                { text: "Yes, Requested", action: 'p3_1_atm_await' },
                { text: "Not Yet", action: 'p3_1_atm_await' } // Continue anyway
            ]
        },
        'p3_1_atm_await': {
            message: "Once the footage is received, analyze it to identify the suspect. We will await the response.",
            options: [
                { text: "Footage Received", action: 'digital_evidence_menu' },
                { text: "Return to Fund Trial Menu", action: 'p2_triage' }
            ]
        },
        // --- 3.2 UPI / Bank ---
        'p3_2_upi_start': {
            message: "<strong>Sub-Flow: UPI / Wallet / Bank Transfer</strong><br><strong>URGENT ACTION:</strong> The first priority is to prevent further fund movement. Have you sent a notice to the beneficiary bank/wallet provider to immediately place a <strong>debit freeze</strong> on the account?",
            options: [
                { text: "Yes, Notice Sent", action: 'p3_2_upi_docs' },
                { text: "Need Sample Notice", action: 'p3_2_upi_sample' },
                { text: "No, Not Yet", action: 'p3_2_upi_action_critical' }
            ]
        },
        'p3_2_upi_action_critical': {
            message: "<strong>CRITICAL ACTION:</strong> Send this notice immediately. Any delay will likely result in the complete withdrawal of the stolen funds, making recovery impossible.",
            options: [
                { text: "Back", action: 'p2_triage' }
            ]
        },
        'p3_2_upi_sample': {
            message: `📄 Here is a sample notice to freeze the account and request KYC.
            <pre class="notice-sample">
NOTICE UNDER SECTION 91 Cr.P.C.
From: [Your Name, Designation, Police Station]
To: The Nodal Officer, [Beneficiary Bank/Wallet]

Ref: Cr.No. [FIR No.], u/s [Sections]
Sub: Request to Freeze Account and Provide Holder Details in Online Fraud Case.

In the investigation of the above case, Rs. [Amount] was fraudulently transferred from the victim's account to the following beneficiary:
- Account/Wallet Holder Name: [Name]
- Account Number / UPI ID / Wallet No: [Beneficiary Details]
- IFSC Code: [IFSC]
- Transaction Date & Time: [Date, Time]
- Transaction ID: [Txn ID]

You are directed under Sec 91 Cr.P.C. to:
1.  <strong>IMMEDIATELY</strong> place a <strong>DEBIT FREEZE</strong> on this account.
2.  Furnish the complete details of the account holder:
    a. Account Opening Form (AOF) with color photo.
    b. All KYC documents (ID and Address Proof).
    c. Registered mobile number and email ID.
    d. Complete account statement from opening date.
    e. IP logs for internet/mobile banking access.
Please provide details with a 65B certificate.
(Signature & Seal of IO)
            </pre>`,
            options: [
                { text: "Notice Sent", action: 'p3_2_upi_docs' },
                { text: "Back", action: 'p3_2_upi_start' }
            ]
        },
        'p3_2_upi_docs': {
            message: "✅ Excellent. Have you received the KYC documents and the full statement for the beneficiary account?",
            options: [
                { text: "Yes, Received", action: 'p3_2_upi_analyze' },
                { text: "Awaiting Response", action: 'p3_2_upi_await' }
            ]
        },
        'p3_2_upi_await': {
            message: "Understood. Follow up with the nodal officer. In the meantime, you can trace other digital leads.",
            options: [
                { text: "Go to Digital Evidence Menu", action: 'digital_evidence_menu' },
                { text: "Return to Fund Trial Menu", action: 'p2_triage' }
            ]
        },
        'p3_2_upi_analyze': {
            message: "Now, analyze the mule account statement. What does the subsequent money trail show?",
            options: [
                { text: "Further Transfer to Another Account", action: 'p3_2_upi_layer2' },
                { text: "Cash Withdrawal from ATM", action: 'p3_2_upi_atm' },
                { text: "Funds are Still in Account", action: 'p3_2_upi_funds_secured' }
            ]
        },
        'p3_2_upi_layer2': {
            message: "<strong>New Lead:</strong> A second layer of mule accounts found. You must repeat the process: <strong>Immediately send a new notice</strong> to these new banks to freeze their accounts and request KYC.",
            options: [
                { text: "Understood", action: 'p3_2_upi_analyze' }
            ]
        },
        'p3_2_upi_atm': {
            message: "<strong>New Lead:</strong> This gives us a chance to identify the suspect physically. You have now pivoted to an ATM fraud investigation. Please proceed to that flow to request CCTV footage.",
            options: [
                { text: "Go to ATM Flow (Phase 3.1)", action: 'p3_1_atm_details' }
            ]
        },
        'p3_2_upi_funds_secured': {
            message: "Excellent. The funds are secured. The KYC documents contain a registered mobile number. This is our next lead.",
            options: [
                { text: "Proceed to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        // --- 3.3 E-Commerce ---
        'p3_3_ecommerce_start': {
            message: "<strong>Sub-Flow: E-Commerce Purchase</strong><br>You have selected E-Commerce Purchase. Have you identified the merchant (e.g., Flipkart, Amazon) from the bank statement?",
            options: [
                { text: "Yes, Identified", action: 'p3_3_ecommerce_notice' },
                { text: "Not Yet Identified", action: 'p3_3_ecommerce_action_identify' }
            ]
        },
        'p3_3_ecommerce_action_identify': {
            message: "<strong>Action Required:</strong> Analyze the transaction description in the bank statement. It usually contains the merchant name. If not, ask the victim's bank for merchant details.",
            options: [
                { text: "Back", action: 'p2_triage' }
            ]
        },
        'p3_3_ecommerce_notice': {
            message: "Now, send a notice u/s 91 CrPC to the nodal officer of the e-commerce platform. Have you sent this notice?",
            options: [
                { text: "Notice Sent", action: 'p3_3_ecommerce_await' },
                { text: "Need Sample Notice", action: 'p3_3_ecommerce_sample' }
            ]
        },
        'p3_3_ecommerce_sample': {
            message: `📄 Here is a sample notice for an e-commerce platform.
            <pre class="notice-sample">
NOTICE UNDER SECTION 91 Cr.P.C.
From: [Your Name, Designation, Police Station]
To: The Nodal Officer, [E-commerce Company Name]

Ref: Cr.No. [FIR No.], u/s [Sections]
Sub: Request for transaction and delivery details in Online Fraud Case.

In the investigation of the above case, a fraudulent transaction was made on your platform:
- Transaction ID: [Txn ID]
- Date & Time: [Date, Time]
- Amount: Rs. [Amount]
- Victim's Card/Account (Partial): [Victim Card/Acct]

You are directed under Sec 91 Cr.P.C. to provide:
1. User account details (Name, registered mobile no., email ID).
2. The product(s) ordered.
3. The complete delivery address for the order.
4. The mobile number provided for delivery.
5. The IP address used to place the order (with date, time, timezone).
6. Courier/delivery partner details.
(Signature & Seal of IO)
            </pre>`,
            options: [
                { text: "Notice Sent", action: 'p3_3_ecommerce_await' },
                { text: "Back", action: 'p3_3_ecommerce_notice' }
            ]
        },
        'p3_3_ecommerce_await': {
            message: "✅ Good. Once the platform provides the delivery address and contact number, you have a physical lead and a digital lead.",
            options: [
                { text: "Data Received, Go to Digital Evidence", action: 'digital_evidence_menu' }
            ]
        },
        // --- 3.4 SIM Swap ---
        'p3_4_simswap_start': {
            message: "<strong>Sub-Flow: SIM Swap Fraud</strong><br>This is a multi-stage crime. First, confirm with the victim the exact date and time their original SIM card stopped working.",
            options: [
                { text: "Date/Time Collected", action: 'p3_4_simswap_notice' }
            ]
        },
        'p3_4_simswap_notice': {
            message: "Now, send an urgent notice u/s 91 CrPC to the Nodal Officer of the victim's Mobile Service Provider (MSP). Have you done this?",
            options: [
                { text: "Notice Sent", action: 'p3_4_simswap_await' },
                { text: "Need Sample Notice", action: 'p3_4_simswap_sample' }
            ]
        },
        'p3_4_simswap_sample': {
            message: `📄 Here is a sample notice for an MSP in a SIM Swap case.
            <pre class="notice-sample">
NOTICE UNDER SECTION 91 Cr.P.C.
From: [Your Name, Designation, Police Station]
To: The Nodal Officer, [Mobile Service Provider]

Ref: Cr.No. [FIR No.], u/s [Sections]
Sub: Request for details regarding fraudulent SIM Swap of Mobile No. [Victim's Mobile Number].

This office is investigating a SIM Swap fraud where the victim's mobile number [Victim's Mobile Number] was fraudulently deactivated and a duplicate SIM was issued to the accused.
You are directed under Sec 91 Cr.P.C. to provide:
1.  The complete application form (CAF/AOF) submitted by the person who requested the duplicate SIM.
2.  All ID and address proof documents submitted by the fraudster.
3.  The location, store address, and employee details of the retail outlet where the SIM swap was processed.
4.  The date and time the duplicate SIM was activated.
5.  CCTV footage of the retail store at the time the fraudster visited.
(Signature & Seal of IO)
            </pre>`,
            options: [
                { text: "Notice Sent", action: 'p3_4_simswap_await' },
                { text: "Back", action: 'p3_4_simswap_notice' }
            ]
        },
        'p3_4_simswap_await': {
            message: "✅ Good. Once you receive the documents and store details from the MSP, the next step is to conduct an enquiry at the mobile network store.",
            options: [
                { text: "Details Received", action: 'p5_field_start_store' },
                { text: "While waiting, go to Digital Evidence", action: 'digital_evidence_menu' }
            ]
        },
        'p5_field_start_store': {
            message: "Proceed to the store, collect physical documents, enquire with the staff, and collect any available CCTV footage. This is a physical lead.",
            options: [
                { text: "Proceed to Field Investigation", action: 'p5_field_start' }
            ]
        },

        // --- NEW Digital Evidence Menu ---
        'digital_evidence_menu': {
            message: "<strong>Digital Footprint Investigation</strong><br>What is the primary digital evidence you have?",
            options: [
                { text: "Trace Fraudster's Mobile Number", action: 'p4_digital_start_mobile' },
                { text: "Trace an IP Address", action: 'p4_digital_start_ip' },
                { text: "Trace Website / URL", action: 'p4_digital_start_website' },
                { text: "No / Nothing Else", action: 'p5_field_start' }
            ]
        },
        
        'p4_digital_start_mobile': {
            message: "You have a suspect mobile number. The next step is to send a notice to the Mobile Service Provider (MSP) for the <strong>Subscriber Detail Record (SDR/CAF)</strong> and <strong>Call Detail Record (CDR)</strong>. Have you done this?",
            options: [
                { text: "Yes, Notice Sent", action: 'p4_digital_await_records' },
                { text: "No, Not Yet", action: 'p4_digital_action_notice' }
            ]
        },
        'p4_digital_action_notice': {
            message: "<strong>Action Required:</strong> Send the notice to the concerned MSP's nodal officer to get the SDR and CDR.",
            options: [
                { text: "Back", action: 'digital_evidence_menu' }
            ]
        },
        'p4_digital_await_records': {
            message: "Excellent. Once you receive the records, what will you analyze?",
            options: [
                { text: "Analyze SDR/CAF (Subscriber Address)", action: 'p5_field_start' },
                { text: "Analyze CDR (Call Logs/Location)", action: 'p4_digital_analyze_cdr' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p4_digital_analyze_cdr': {
            message: "Key points to check in CDR:<br>🧩 <strong>Frequently contacted numbers</strong> to identify associates.<br>🧩 <strong>Tower location data (BTS Address)</strong> during the time of the crime.<br>🧩 <strong>IMEI number</strong> of the handset.",
            options: [
                { text: "Understood", action: 'p5_field_start' }
            ]
        },
        'p4_digital_start_ip': {
            message: "You have an IP address. Have you performed a <strong>whois lookup</strong> to identify the Internet Service Provider (ISP)?",
            options: [
                { text: "Yes, ISP Identified", action: 'p4_digital_ip_notice' },
                { text: "No, Not Yet", action: 'p4_digital_ip_action_whois' }
            ]
        },
        'p4_digital_ip_action_whois': {
            message: "<strong>Action Required:</strong> Please perform a whois lookup (e.g., at <code>www.who.is</code>). This is a mandatory first step to know which ISP to contact.",
            options: [
                { text: "Back", action: 'digital_evidence_menu' }
            ]
        },
        'p4_digital_ip_notice': {
            message: "Have you sent a notice u/s 91 CrPC to the ISP with the IP address, date, and exact time (converted to IST) to get the IP user details (IPDR)?",
            options: [
                { text: "Yes, Notice Sent", action: 'p4_digital_ip_await' },
                { text: "No, Not Yet", action: 'p4_digital_ip_action_notice' }
            ]
        },
        'p4_digital_ip_action_notice': {
            message: "<strong>Action Required:</strong> Send the notice immediately. Remember to convert any UTC timestamps to IST before sending.",
            options: [
                { text: "Back", action: 'p4_digital_ip_notice' }
            ]
        },
        'p4_digital_ip_await': {
            message: "✅ Good. The ISP's reply will provide the subscriber's name and physical installation address.",
            options: [
                { text: "Proceed to Field Investigation", action: 'p5_field_start' },
                { text: "Back to Digital Evidence Menu", action: 'digital_evidence_menu' }
            ]
        },
        'p4_digital_start_website': { // NEW STEP
            message: "You are investigating a fraudulent website. Use the same procedure as in 'Investment Fraud':<br>1. Perform <strong>Whois Lookup</strong>.<br>2. Send notices to <strong>Registrar</strong> and <strong>Hosting Provider</strong> for registrant details, payment info, and server logs.",
            options: [
                { text: "Understood", action: 'digital_evidence_menu' }
            ]
        },

        // --- 5. Field Investigation ---
        'p5_field_start': {
            message: "<strong>Phase 5: Field Investigation</strong><br>You have one or more physical addresses (from bank KYC, MSP records, IP records, or delivery address). Have you conducted a physical verification of these addresses?",
            options: [
                { text: "Yes, Verified", action: 'p5_field_arrest' },
                { text: "Verification Pending", action: 'p5_field_action_verify' }
            ]
        },
        'p5_field_action_verify': {
            message: "<strong>Action Required:</strong> Please conduct field enquiries to verify the addresses. Leads are unconfirmed until physically verified.",
            options: [
                { text: "Back", action: 'p5_field_start' }
            ]
        },
        'p5_field_arrest': {
            message: "After successful verification and positive identification of the accused, have you proceeded with the arrest?",
            options: [
                { text: "Yes, Accused Arrested", action: 'p5_field_seize' }
            ]
        },
        'p5_field_seize': {
            message: "Upon arrest, have you seized the communication devices (mobile phones, laptops, SIM cards) used in the offense?",
            options: [
                { text: "Yes, Devices Seized", action: 'p5_field_preserve' },
                { text: "No", action: 'p5_field_seize' }
            ]
        },
        'p5_field_preserve': {
            message: "<strong>FORENSIC ALERT:</strong> Is the evidence secured as per procedure?<br>📱 <strong>Mobile (ON):</strong> Enable Airplane Mode or place in Faraday bag.<br>💻 <strong>PC (ON):</strong> Pull power cord from back of CPU (do not shut down normally).",
            options: [
                { text: "Yes, Secured", action: 'p5_field_fsl' },
                { text: "No", action: 'p5_field_action_preserve' }
            ]
        },
        'p5_field_action_preserve': {
            message: "<strong>CRITICAL MISTAKE:</strong> Improper handling can lead to evidence being inadmissible in court. Please follow the seizure protocol immediately.",
            options: [
                { text: "Back", action: 'p5_field_preserve' }
            ]
        },
        'p5_field_fsl': {
            message: "Have the seized items been properly labeled and sent for forensic examination with a forwarding letter?",
            options: [
                { text: "Yes, Sent to FSL", action: 'p6_complete' },
                { text: "No", action: 'p5_field_fsl' }
            ]
        },
        // --- 6. Culmination ---
        'p6_complete': {
            message: "<strong>Phase 6: Case Culmination</strong><br>Let's review the final checklist. Do you have:<br>1. FIR, Complaint, Mahazars (Observation, Seizure)<br>2. 161 Cr.P.C. witness statements<br>3. Replies from Banks, ISPs, MSPs with 65B certificates<br>4. FSL Report",
            options: [
                { text: "All Documents Available", action: 'p6_final' }
            ]
        },
        'p6_final': {
            message: "<strong>Investigation Complete.</strong> You have followed all the critical steps. Compile all documents in the case diary and file the Final Report (Charge Sheet) before the jurisdictional court. Excellent work, Officer.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };
    // --- *** END OF FLOW OBJECTS *** ---


    // --- *** START OF RENDER FUNCTIONS *** ---

    /**
     * Starts the interactive flow for Investment Fraud (Existing)
     */
    function startInvestmentFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderInvestmentFraudStep('start');
    }

    /**
     * Renders a step for Investment Fraud (Existing)
     */
    function renderInvestmentFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startInvestmentFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        const stepData = investmentFraudFlow[stepKey];
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        // ADD THIS IF-BLOCK TO INSERT THE BACK BUTTON
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
        stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                // --- ADD THIS LOGIC FOR THE BACK BUTTON ---
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            // Re-enable buttons on the previous step
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            // Remove the separator
                            prevSeparator.remove();
                        }
                        
                        // Remove the current step element
                        currentStepElement.remove();
                        // Scroll to the new last step
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                // --- THIS IS YOUR EXISTING LOGIC FOR OPTION BUTTONS ---
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        // This line must match the function you are editing, e.g.:
                        renderInvestmentFraudStep(nextStepKey); // or renderUpiFraudStep(nextStepKey), etc.
                    }
                });
            }
        });
    }

    /**
     * --- NEW: Starts the interactive flow for UPI Fraud ---
     */
    function startUpiFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderUpiFraudStep('start'); // Calls the new render function
    }

    /**
     * --- NEW: Renders a step for UPI Fraud ---
     */
    function renderUpiFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startUpiFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses upiFraudFlow object ***
        const stepData = upiFraudFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        // ADD THIS IF-BLOCK TO INSERT THE BACK BUTTON
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                // --- ADD THIS LOGIC FOR THE BACK BUTTON ---
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            // Re-enable buttons on the previous step
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            // Remove the separator
                            prevSeparator.remove();
                        }
                        
                        // Remove the current step element
                        currentStepElement.remove();
                        // Scroll to the new last step
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderUpiFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }

    /**
     * --- NEW: Starts the interactive flow for Card Fraud ---
     */
    function startCardFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderCardFraudStep('start'); // Calls the new render function
    }

    /**
     * --- NEW: Renders a step for Card Fraud ---
     */
    function renderCardFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startCardFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses cardFraudFlow object ***
        const stepData = cardFraudFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        // ADD THIS IF-BLOCK TO INSERT THE BACK BUTTON
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';
        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                // --- ADD THIS LOGIC FOR THE BACK BUTTON ---
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            // Re-enable buttons on the previous step
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            // Remove the separator
                            prevSeparator.remove();
                        }
                        
                        // Remove the current step element
                        currentStepElement.remove();
                        // Scroll to the new last step
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderCardFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }

    /**
     * --- NEW: Starts the interactive flow for Internet Banking Fraud ---
     */
    function startInternetBankingFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderInternetBankingFraudStep('start'); // Calls the new render function
    }

    /**
     * --- NEW: Renders a step for Internet Banking Fraud ---
     */
    function renderInternetBankingFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startInternetBankingFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses internetBankingFraudFlow object ***
        const stepData = internetBankingFraudFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        // ADD THIS IF-BLOCK TO INSERT THE BACK BUTTON
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                // --- ADD THIS LOGIC FOR THE BACK BUTTON ---
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            // Re-enable buttons on the previous step
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            // Remove the separator
                            prevSeparator.remove();
                        }
                        
                        // Remove the current step element
                        currentStepElement.remove();
                        // Scroll to the new last step
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderInternetBankingFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }
/**
     * --- NEW: Starts the interactive flow for Online Financial Fraud ---
     */
    function startOnlineFinancialFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderOnlineFinancialFraudStep('start'); // Calls the new render function
    }

    /**
     * --- NEW: Renders a step for Online Financial Fraud ---
     */
    function renderOnlineFinancialFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startOnlineFinancialFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses onlineFinancialFraudFlow object ***
        const stepData = onlineFinancialFraudFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        // ADD THIS IF-BLOCK TO INSERT THE BACK BUTTON
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                // --- ADD THIS LOGIC FOR THE BACK BUTTON ---
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            // Re-enable buttons on the previous step
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            // Remove the separator
                            prevSeparator.remove();
                        }
                        
                        // Remove the current step element
                        currentStepElement.remove();
                        // Scroll to the new last step
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderOnlineFinancialFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }
// --- *** NEW: OTP Fraud Interactive Flow *** ---
    const otpFraudFlow = {
        'start': {
            message: "Welcome, Officer. This is the OTP Fraud Investigation Assistant. Have you received a detailed written complaint from the victim?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> Please obtain a formal written complaint from the victim. This is the legal foundation for the investigation.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Great. Let's create a checklist for preliminary evidence. Please confirm which of the following you have collected.<br><br><strong>Evidence Checklist 1/3:</strong><br>The victim's <strong>bank account statement</strong> showing the fraudulent transaction(s)?",
            options: [
                { text: "Collected", action: 'p1_checklist_2' },
                { text: "Not Yet", action: 'p1_action_checklist_1' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> Please obtain the bank statement first. It is the primary legal document for the financial investigation.",
            options: [
                { text: "Back", action: 'p1_checklist_1' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Bank Statement collected.<br><br><strong>Evidence Checklist 2/3:</strong><br><strong>Screenshots</strong> of the fraudulent SMS or call log from the victim's phone?",
            options: [
                { text: "Collected", action: 'p1_checklist_3' },
                { text: "Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
            message: "<strong>Action Required:</strong> Please collect these screenshots. The SMS content or the fraudster's number is a key lead.",
            options: [
                { text: "Back", action: 'p1_checklist_2' }
            ]
        },
        'p1_checklist_3': {
            message: "✅ SMS/Call Log collected.<br><br><strong>Evidence Checklist 3/3:</strong><br>The <strong>fraudulent mobile number</strong> used by the accused (if available)?",
            options: [
                { text: "Collected", action: 'p1_fir_check' },
                { text: "Not Available", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_check': {
            message: "All preliminary evidence is documented. Have you registered the First Information Report (FIR)?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 420 (Cheating).</li><li><strong>IT Act:</strong> Sec 66C (Identity Theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately. A registered FIR number is mandatory for sending legal notices.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'p2_menu': {
            message: "With the FIR registered, what is the <strong>first and most urgent</strong> step you need to take?",
            options: [
                { text: "💰 Trace Financial Trail (Freeze Account)", action: 'p2_financial' },
                { text: "🕵️‍♂️ Trace Digital Trail (Trace Number)", action: 'p2_digital' }
            ]
        },
        'p2_financial': {
            message: "<strong>URGENT: Financial Trail</strong><br>Have you identified the beneficiary bank account or e-wallet from the victim's statement and sent a notice under Sec 91 CrPC to <strong>freeze the account</strong>?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_financial_sent' },
                { text: "No, Need Sample Notice", action: 'p2_financial_sample' }
            ]
        },
        'p2_financial_sample': {
            message: `This is the most time-critical step. Use this sample notice.
            <pre class="notice-sample">
To:
    The Nodal Officer,
    [Beneficiary Bank/Wallet Name]

NOTICE UNDER SECTION 91 Cr.P.C.
Ref: Case FIR No. [Your FIR No.]...
Subject: URGENT - Request to Freeze Account and Provide Details in OTP Fraud Case.

Sir/Madam,
This office is investigating an OTP fraud (FIR No. ...) where Rs. [Amount] was fraudulently transferred from the victim's account to:
- Account/Wallet No: [Beneficiary Acct/Wallet No.]
- Holder Name: [Beneficiary Name]
- Transaction ID: [Txn ID]
- Date & Time: [Date, Time]

You are directed under Sec 91 Cr.P.C. to:
1.  <strong>IMMEDIATELY</strong> place a <strong>DEBIT FREEZE</strong> on this account.
2.  Provide certified copies of the <strong>Account Opening Form (AOF)</strong> and all supporting <strong>KYC documents</strong> (ID, Address Proof, Photo).
3.  Provide the complete <strong>statement of account</strong> from opening date.
4.  Provide the registered mobile number(s) linked to this account.

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'p2_financial_sent' },
                { text: "Back", action: 'p2_financial' }
            ]
        },
        'p2_financial_sent': {
            message: "Excellent. While awaiting the bank's reply (KYC docs, statement), what is your next lead?",
            options: [
                { text: "Trace Fraudster's Phone Number", action: 'p2_digital' },
                { text: "Analyze Beneficiary Account Statement", action: 'p3_analyze_mule' }
            ]
        },
        'p2_digital': {
            message: "<strong>Digital Trail</strong><br>You have the fraudster's mobile number. Have you sent a notice under Sec 91 CrPC to the Mobile Service Provider (MSP)?<br>👉 The notice should request:<ul><li><strong>Subscriber Detail Record (SDR)</strong> / Customer Application Form (CAF).</li><li><strong>Call Detail Records (CDR)</strong> for the crime period.</li><li><strong>Tower location details</strong> at the time of the call.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_digital_sent' },
                { text: "No, Need Sample Notice", action: 'p2_digital_sample' }
            ]
        },
        'p2_digital_sample': {
            message: `Here is a sample notice for the MSP.
            <pre class="notice-sample">
To:
    The Nodal Officer,
    [Mobile Service Provider Name]

NOTICE UNDER SECTION 91 Cr.P.C.
Ref: Case FIR No. [Your FIR No.]...
Subject: Request for Subscriber & Call Details for Mobile No. [Fraudster's Number].

Sir/Madam,
This office is investigating an OTP fraud (FIR No. ...) where the mobile number [Fraudster's Number] was used to call the victim and commit the offense on [Date].

You are directed under Sec 91 Cr.P.C. to provide:
1.  Certified copy of the <strong>Subscriber Detail Record (SDR) / Customer Application Form (CAF)</strong> for this number.
2.  Certified copy of the <strong>Call Detail Records (CDR)</strong>, including cell tower location (BTS address), for the period [Start Date] to [End Date].
3.  IMEI number of the handset used.

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'p2_digital_sent' },
                { text: "Back", action: 'p2_digital' }
            ]
        },
        'p2_digital_sent': {
            message: "Good. The SDR will give you the suspect's registered address, and the CDR will give you their location.",
            options: [
                { text: "Proceed to Financial Trail", action: 'p2_financial_sent' },
                { text: "Proceed to Field Investigation", action: 'p4_field' }
            ]
        },
        'p3_analyze_mule': {
            message: "You have received the beneficiary account statement. What does the subsequent money trail show?",
            options: [
                { text: "Further Transfer to Another Account", action: 'p3_mule_layer2' },
                { text: "Cash Withdrawal from ATM", action: 'p3_mule_atm' },
                { text: "Trail ends here / Go to Field Investigation", action: 'p4_field' }
            ]
        },
        'p3_mule_layer2': {
            message: "<strong>New Lead:</strong> A second layer of mule accounts found. You must repeat the process: <strong>Immediately send a new notice</strong> to these new banks to freeze their accounts and request KYC.",
            options: [
                { text: "Understood, will repeat", action: 'p3_analyze_mule' }
            ]
        },
        'p3_mule_atm': {
            message: "<strong>New Lead:</strong> This gives a physical identifier. Note the ATM ID, location, and time. Send a notice to that bank requesting <strong>CCTV footage</strong> for that specific withdrawal.",
            options: [
                { text: "Understood", action: 'p3_analyze_mule' }
            ]
        },
        'p4_field': {
            message: "<strong>Field Investigation</strong><br>You should now have leads from the MSP (SDR address) and/or the Bank (KYC address). Have you correlated these addresses?",
            options: [
                { text: "Yes, addresses correlated", action: 'p4_field_verify' },
                { text: "Leads are not clear", action: 'p4_field_revisit' }
            ]
        },
        'p4_field_revisit': {
            message: "Re-analyze your CDRs for frequently contacted numbers or tower locations. Re-analyze the mule statements for other leads.",
            options: [
                { text: "Back to Digital Trail", action: 'p2_digital' },
                { text: "Back to Financial Trail", action: 'p2_financial' }
            ]
        },
        'p4_field_verify': {
            message: "Have you conducted physical verification at these addresses to confirm the suspect's identity?",
            options: [
                { text: "Yes, suspect verified", action: 'p5_apprehend' },
                { text: "Not yet", action: 'p4_field_verify' }
            ]
        },
        'p5_apprehend': {
            message: "Based on the evidence and verification, have you apprehended the accused?",
            options: [
                { text: "Yes, accused apprehended", action: 'p5_seize' },
                { text: "Not yet", action: 'p5_apprehend' }
            ]
        },
        'p5_seize': {
            message: "<strong>Critical Step:</strong> Have you seized the devices used (mobile phone, SIM card) under a proper seizure mahazar?<br>👉 <strong>Evidence Preservation:</strong> Ensure the seized mobile is immediately put into Airplane Mode or placed in a Faraday bag.",
            options: [
                { text: "Yes, devices seized & preserved", action: 'p5_fsl' },
                { text: "No, not yet", action: 'p5_seize' }
            ]
        },
        'p5_fsl': {
            message: "Have the seized devices been sent to FSL for data extraction and analysis (voice sample matching, call logs)?",
            options: [
                { text: "Yes, sent to FSL", action: 'p6_complete' },
                { text: "No, not yet", action: 'p5_fsl' }
            ]
        },
        'p6_complete': {
            message: "<strong>Investigation Complete.</strong> Once the FSL report is received, compile all documentary, digital, and physical evidence and file the final report (Charge Sheet). Excellent work, Officer.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };

    // --- *** NEW: SIM Swap Fraud Interactive Flow *** ---
    const simSwapFraudFlow = {
        'start': {
            message: "Welcome, Officer. This is the SIM Swap Fraud Investigation Assistant. This is a critical offense. Have you received a detailed written complaint?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> Please obtain a formal written complaint from the victim.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Great. Let's confirm the preliminary evidence.<br><br><strong>Evidence Checklist 1/3:</strong><br>The victim's <strong>bank statement</strong> showing the fraudulent transactions?",
            options: [
                { text: "Collected", action: 'p1_checklist_2' },
                { text: "Not Yet", action: 'p1_action_checklist_1' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> Please obtain the bank statement. It's the primary proof of loss.",
            options: [
                { text: "Back", action: 'p1_checklist_1' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Bank Statement collected.<br><br><strong>Evidence Checklist 2/3:</strong><br>The victim's <strong>mobile number</strong> that was swapped?",
            options: [
                { text: "Collected", action: 'p1_checklist_3' },
                { text: "Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
            message: "<strong>Action Required:</strong> Please obtain the victim's mobile number.",
            options: [
                { text: "Back", action: 'p1_checklist_2' }
            ]
        },
        'p1_checklist_3': {
            message: "✅ Mobile number collected.<br><br><strong>Evidence Checklist 3/3:</strong><br>The exact <strong>date and time</strong> the victim lost network connectivity on their original SIM?",
            options: [
                { text: "Collected", action: 'p1_fir_check' },
                { text: "Not Sure", action: 'p1_action_checklist_3' }
            ]
        },
        'p1_action_checklist_3': {
            message: "<strong>Action Required:</strong> This is very important. Ask the victim to pinpoint this time. It's the starting point for the investigation at the mobile store.",
            options: [
                { text: "Back", action: 'p1_checklist_3' }
            ]
        },
        'p1_fir_check': {
            message: "All preliminary evidence is documented. Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 419, 420 (Cheating), Sec 468, 471 (Forgery).</li><li><strong>IT Act:</strong> Sec 66C (Identity Theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately to proceed with notices.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'p2_menu': {
            message: "With the FIR registered, there are two urgent parallel trails. Which do you want to start?",
            options: [
                { text: "🕵️‍♂️ Trace the SIM Swap (Mobile Provider)", action: 'p2_digital_msp' },
                { text: "💰 Trace the Money (Beneficiary Bank)", action: 'p2_financial' }
            ]
        },
        'p2_digital_msp': {
            message: "<strong>URGENT: SIM Swap Trail</strong><br>Have you sent a notice under Sec 91 CrPC to the Nodal Officer of the victim's Mobile Service Provider (MSP)?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_digital_msp_sent' },
                { text: "No, Need Sample Notice", action: 'p2_digital_msp_sample' }
            ]
        },
        'p2_digital_msp_sample': {
            message: `This notice is critical to find the point of compromise.
            <pre class="notice-sample">
To:
    The Nodal Officer,
    [Victim's Mobile Service Provider Name]

NOTICE UNDER SECTION 91 Cr.P.C.
Ref: Case FIR No. [Your FIR No.]...
Subject: URGENT - Request for details of fraudulent SIM Swap for Mobile No. [Victim's Number].

Sir/Madam,
This office is investigating a SIM Swap fraud (FIR No. ...) where the victim's mobile number [Victim's Number] was fraudulently swapped on [Date of Swap] around [Time of Swap].

You are directed under Sec 91 Cr.P.C. to provide:
1.  Certified copy of the <strong>application form (CAF/AOF)</strong> submitted by the person who requested the duplicate SIM.
2.  Certified copies of all <strong>ID and address proof documents</strong> submitted by the fraudster.
3.  The <strong>location, store address, and employee details</strong> of the retail outlet where the SIM swap was processed.
4.  The <strong>date and time</strong> the duplicate SIM was activated.
5.  <strong>CCTV footage</strong> (if available) of the retail store at the time the fraudster visited.

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'p2_digital_msp_sent' },
                { text: "Back", action: 'p2_digital_msp' }
            ]
        },
        'p2_digital_msp_sent': {
            message: "Excellent. The MSP's reply will give you the physical location (the store) and the documents used by the fraudster.",
            options: [
                { text: "Proceed to Financial Trail", action: 'p2_financial' },
                { text: "Go to Field Investigation (Store)", action: 'p3_field_store' }
            ]
        },
        'p2_financial': {
            message: "<strong>URGENT: Financial Trail</strong><br>Have you identified the beneficiary bank accounts or e-wallets from the victim's statement and sent notices to <strong>freeze them</strong> and get KYC details?",
            options: [
                { text: "Yes, Notices Sent", action: 'p2_financial_sent' },
                { text: "No, I need a sample", action: 'p2_financial_sample' }
            ]
        },
        'p2_financial_sample': {
            message: "This is the same as the OTP fraud notice. Use that sample to freeze the account and get KYC/Statement.",
            options: [
                { text: "Got it, Notices Sent", action: 'p2_financial_sent' },
                { text: "Back", action: 'p2_financial' }
            ]
        },
        'p2_financial_sent': {
            message: "Good. The money trail is being preserved.",
            options: [
                { text: "Proceed to SIM Swap Trail", action: 'p2_digital_msp' },
                { text: "Analyze Beneficiary Account Statement", action: 'p3_analyze_mule' }
            ]
        },
        'p3_analyze_mule': {
            message: "You have received the beneficiary account statement. What does the subsequent money trail show?",
            options: [
                { text: "Further Transfer to Another Account", action: 'p3_mule_layer2' },
                { text: "Cash Withdrawal from ATM", action: 'p3_mule_atm' },
                { text: "Trail ends here / Go to Field Investigation", action: 'p3_field_store' }
            ]
        },
        'p3_mule_layer2': {
            message: "<strong>New Lead:</strong> A second layer of mule accounts found. You must repeat the process: <strong>Immediately send a new notice</strong> to these new banks to freeze their accounts and request KYC.",
            options: [
                { text: "Understood, will repeat", action: 'p3_analyze_mule' }
            ]
        },
        'p3_mule_atm': {
            message: "<strong>New Lead:</strong> This gives a physical identifier. Note the ATM ID, location, and time. Send a notice to that bank requesting <strong>CCTV footage</strong> for that specific withdrawal.",
            options: [
                { text: "Understood", action: 'p3_analyze_mule' }
            ]
        },
        'p3_field_store': {
            message: "<strong>Field Investigation (Phase 1)</strong><br>You have the mobile store's address from the MSP. Have you visited the store?",
            options: [
                { text: "Yes, visited the store", action: 'p3_field_store_visit' },
                { text: "Not yet", action: 'p3_field_store' }
            ]
        },
        'p3_field_store_visit': {
            message: "What did you find at the store?",
            options: [
                { text: "Collected CCTV, identified suspect/employee", action: 'p4_field_correlate' },
                { text: "Interviewed staff, got information", action: 'p4_field_correlate' },
                { text: "No CCTV / No leads", action: 'p3_field_store_deadend' }
            ]
        },
        'p3_field_store_deadend': {
            message: "This is tough. We must rely on the financial trail. Go back and analyze the mule accounts.",
            options: [
                { text: "Analyze Financial Trail", action: 'p3_analyze_mule' }
            ]
        },
        'p4_field_correlate': {
            message: "<strong>Field Investigation (Phase 2)</strong><br>You now have leads from the mobile store (suspect image/details) and the bank (KYC addresses of mule accounts). Have you correlated these leads?",
            options: [
                { text: "Yes, leads correlate", action: 'p5_apprehend' },
                { text: "Leads do not match / Not clear", action: 'p4_field_correlate' }
            ]
        },
        'p5_apprehend': {
            message: "Based on the solid evidence (CCTV, KYC, etc.), have you apprehended the accused (fraudster and/or store employee)?",
            options: [
                { text: "Yes, accused apprehended", action: 'p5_seize' },
                { text: "Not yet", action: 'p5_apprehend' }
            ]
        },
        'p5_seize': {
            message: "<strong>Critical Step:</strong> Have you seized the devices (mobiles, SIMs, computers, documents) under a proper seizure mahazar?<br>👉 <strong>Evidence Preservation:</strong> Ensure all devices are in Airplane Mode or Faraday bags.",
            options: [
                { text: "Yes, devices seized & preserved", action: 'p5_fsl' },
                { text: "No, not yet", action: 'p5_seize' }
            ]
        },
        'p5_fsl': {
            message: "Have the seized devices and documents (e.g., forged ID) been sent to FSL for analysis?",
            options: [
                { text: "Yes, sent to FSL", action: 'p6_complete' },
                { text: "No, not yet", action: 'p5_fsl' }
            ]
        },
        'p6_complete': {
            message: "<strong>Investigation Complete.</strong> Once the FSL report is received, compile all evidence (MSP docs, bank docs, CCTV, FSL report) and file the final report (Charge Sheet). Excellent work.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };

    // --- *** NEW: Social Media Impersonation Interactive Flow *** ---
    const socialMediaImpersonationFlow = {
        'start': {
            message: "Welcome, Officer. This is the Social Media Impersonation Investigation Assistant. Have you received a detailed written complaint from the victim?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> Please obtain a formal written complaint.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Let's confirm the preliminary evidence.<br><br><strong>Evidence Checklist 1/2:</strong><br><strong>Screenshots</strong> of the fake profile and any offending posts/messages?",
            options: [
                { text: "Collected", action: 'p1_checklist_2' },
                { text: "Not Yet", action: 'p1_action_checklist_1' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> Please preserve this evidence immediately, as the profile may be deleted.",
            options: [
                { text: "Back", action: 'p1_checklist_1' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Screenshots collected.<br><br><strong>Evidence Checklist 2/2:</strong><br>The <strong>exact URL</strong> of the fake profile (e.g., <code>facebook.com/fake.profile.123</code>)?",
            options: [
                { text: "Collected", action: 'p1_offense_check' },
                { text: "Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
            message: "<strong>Action Required:</strong> The URL is the most important piece of data. We cannot send a notice without it.",
            options: [
                { text: "Back", action: 'p1_checklist_2' }
            ]
        },
        'p1_offense_check': {
            message: "What is the nature of the offense? This determines the sections of law.",
            options: [
                { text: "Simple Impersonation / Defamation", action: 'p1_fir_check_defamation' },
                { text: "Stalking / Harassment", action: 'p1_fir_check_stalking' },
                { text: "Extortion / Demanding Money", action: 'p1_fir_check_extortion' },
                { text: "Posting Obscene Content", action: 'p1_fir_check_obscene' }
            ]
        },
        'p1_fir_check_defamation': {
            message: "For defamation, FIR registration may require a court order (as it's often non-cognizable). However, we can still proceed with notices for identity theft.<br>⚖️ <strong>Recommended sections:</strong> Sec 66C IT Act (Identity Theft), Sec 500 IPC (Defamation).",
            options: [
                { text: "Proceed with Investigation", action: 'p2_menu' }
            ]
        },
        'p1_fir_check_stalking': {
            message: "This is a cognizable offense. Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong> Sec 354D IPC (Stalking), Sec 66C IT Act (Identity Theft).",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_fir_check_extortion': {
            message: "This is a cognizable offense. Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong> Sec 384 IPC (Extortion), Sec 66C IT Act, Sec 66D IT Act.",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_fir_check_obscene': {
            message: "This is a cognizable offense. Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong> Sec 67, 67A IT Act, Sec 292 IPC, Sec 66C IT Act.",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> This is a cognizable offense. Please register the FIR immediately to proceed with notices.",
            options: [
                { text: "Back", action: 'p1_offense_check' }
            ]
        },
        'p2_menu': {
            message: "With the evidence collected, the first step is to identify the suspect. Have you sent a notice under Sec 91 CrPC to the social media platform?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_notice_sent' },
                { text: "No, Need Sample Notice", action: 'p2_notice_sample' }
            ]
        },
        'p2_notice_sample': {
            message: `Here is a general sample notice. Adapt it for the specific platform (e.g., Meta, Google/YouTube, X).
            <pre class="notice-sample">
To:
    The Nodal Officer / Law Enforcement Response
    [Name of Social Media Platform, e.g., Meta Platforms, Inc.]

NOTICE UNDER SECTION 91 Cr.P.C.
Ref: Case FIR No. [Your FIR No. or Enquiry Ref]...
Subject: URGENT - Request for Subscriber Details and IP Logs for Fake Profile.

Sir/Madam,
This office is investigating a case (FIR No. ...) involving impersonation, harassment, and identity theft. The accused is operating the following fake profile:
- Profile URL: [PASTE THE EXACT URL HERE]

You are directed under Sec 91 Cr.P.C. to provide:
1.  <strong>Basic subscriber details</strong> (Name, registered mobile no., email ID, date of birth).
2.  <strong>IP address logs</strong> for account creation with date/timestamp.
3.  <strong>IP address logs</strong> for all login/logout sessions from [Start Date] to present.
4.  All content (posts, messages) from this profile (if required for the case).

You are also requested under Sec 79(3)(b) of the IT Act to <strong>IMMEDIATELY</strong> take down/block this profile.

(Signature and Official Seal)
            </pre>`,
            options: [
                { text: "Notice Has Been Sent", action: 'p2_notice_sent' },
                { text: "Back", action: 'p2_menu' }
            ]
        },
        'p2_notice_sent': {
            message: "Excellent. Have you received a reply from the platform with IP logs and subscriber details?",
            options: [
                { text: "Yes, Received", action: 'p3_analyze_reply' },
                { text: "Not Yet", action: 'p2_notice_sent' }
            ]
        },
        'p3_analyze_reply': {
            message: "What leads did you get from the reply?",
            options: [
                { text: "IP Address(es)", action: 'p3_ip_trace' },
                { text: "Mobile Number / Email ID", action: 'p3_digital_trace' },
                { text: "No useful data / Dead end", action: 'p3_dead_end' }
            ]
        },
        'p3_ip_trace': {
            message: "<strong>IP Trace</strong><br>You have an IP address. Have you used a Whois tool to find the Internet Service Provider (ISP)?",
            options: [
                { text: "Yes, ISP identified", action: 'p3_ip_notice' },
                { text: "No, not yet", action: 'p3_ip_action' }
            ]
        },
        'p3_ip_action': {
            message: "<strong>Action Required:</strong> Use a tool like <code>www.who.is</code> to find the ISP. This is essential to find the user's address.",
            options: [
                { text: "Back", action: 'p3_ip_trace' }
            ]
        },
        'p3_ip_notice': {
            message: "Have you sent a notice to the ISP requesting the Subscriber Detail Record (SDR) for that IP at that specific date/time?",
            options: [
                { text: "Yes, Notice Sent", action: 'p4_field' },
                { text: "No, Need Sample", action: 'p3_ip_sample' }
            ]
        },
        'p3_ip_sample': {
            message: "Use the standard ISP notice. Remember to include the IP, Date, and exact Time (with timezone, usually UTC from the platform).",
            options: [
                { text: "Got it, Notice Sent", action: 'p4_field' },
                { text: "Back", action: 'p3_ip_notice' }
            ]
        },
        'p3_digital_trace': {
            message: "<strong>Digital Trace</strong><br>You have a mobile number or email. Send a notice to the relevant MSP or email provider (Google, Microsoft) for their SDR/Subscriber details.",
            options: [
                { text: "Understood, Notices Sent", action: 'p4_field' }
            ]
        },
        'p3_dead_end': {
            message: "If the platform provided no data (e.g., due to VPN, privacy), this is a difficult case. The investigation may be stalled unless the victim receives new messages or leads.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        },
        'p4_field': {
            message: "<strong>Field Investigation</strong><br>You should now have a physical address from the ISP (for the IP) or the MSP (for the mobile number). Have you conducted physical verification?",
            options: [
                { text: "Yes, suspect verified", action: 'p5_apprehend' },
                { text: "Not yet", action: 'p4_field' }
            ]
        },
        'p5_apprehend': {
            message: "Based on the evidence, have you apprehended the accused?",
            options: [
                { text: "Yes, accused apprehended", action: 'p5_seize' },
                { text: "Not yet", action: 'p5_apprehend' }
            ]
        },
        'p5_seize': {
            message: "<strong>Critical Step:</strong> Have you seized the devices (mobiles, laptops) used to create and manage the fake profile?",
            options: [
                { text: "Yes, devices seized & preserved", action: 'p5_fsl' },
                { text: "No, not yet", action: 'p5_seize' }
            ]
        },
        'p5_fsl': {
            message: "Have the seized devices been sent to FSL for forensic analysis to link them to the fake profile?",
            options: [
                { text: "Yes, sent to FSL", action: 'p6_complete' },
                { text: "No, not yet", action: 'p5_fsl' }
            ]
        },
        'p6_complete': {
            message: "<strong>Investigation Complete.</strong> Once the FSL report is received, compile all evidence (platform reply, ISP reply, FSL report) and file the final report. Excellent work.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };


    /**
     * --- NEW: Starts the interactive flow for OTP Fraud ---
     */
    function startOtpFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderOtpFraudStep('start'); 
    }

    /**
     * --- NEW: Renders a step for OTP Fraud ---
     */
    function renderOtpFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startOtpFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses otpFraudFlow object ***
        const stepData = otpFraudFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
        stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            prevSeparator.remove();
                        }
                        currentStepElement.remove();
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderOtpFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }
    

    /**
     * --- NEW: Starts the interactive flow for SIM Swap Fraud ---
     */
    function startSimSwapFraudFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderSimSwapFraudStep('start'); 
    }

    /**
     * --- NEW: Renders a step for SIM Swap Fraud ---
     */
    function renderSimSwapFraudStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startSimSwapFraudFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses simSwapFraudFlow object ***
        const stepData = simSwapFraudFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
        stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            prevSeparator.remove();
                        }
                        currentStepElement.remove();
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderSimSwapFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }

    /**
     * --- NEW: Starts the interactive flow for Social Media Impersonation ---
     */
    function startSocialMediaImpersonationFlow() {
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        renderSocialMediaImpersonationStep('start'); 
    }

    /**
     * --- NEW: Renders a step for Social Media Impersonation ---
     */
    function renderSocialMediaImpersonationStep(stepKey) {
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startSocialMediaImpersonationFlow();
            return;
        }

        if (stepKey === 'start_new') {
            searchInput.value = '';
            sopDisplay.innerHTML = `
            <div class="initial-text-container">
                <img src="tn-police-logo.png" alt="TN Police Logo" class="logo-watermark">
                <h2>Cyber Crime Command Center</h2>
                <p>Enter a case type above to load the Standard Operating Procedure.</p>
            </div>`;
            return;
        }

        const allButtons = flowContainer.querySelectorAll('.interactive-step .sop-button:not(:disabled)');
        allButtons.forEach(button => {
            if (!button.classList.contains('download-button')) {
                button.disabled = true;
            }
        });

        // *** Uses socialMediaImpersonationFlow object ***
        const stepData = socialMediaImpersonationFlow[stepKey]; 
        if (!stepData) {
            console.error("Invalid stepKey:", stepKey);
            flowContainer.innerHTML += `<div class="interactive-step"><p>Error: Investigation step not found. Please try again.</p></div>`;
            return;
        }

        let optionsHtml = '<div class="sop-options-container">';
        
        if (stepKey !== 'start') {
            optionsHtml += `<button class="sop-button back-button">Back</button>`;
        }
        
        if (stepData.options) {
            stepData.options.forEach(option => {
                optionsHtml += `<button class="sop-button" data-action-key="${option.action}">${option.text}</button>`;
            });
        }
        optionsHtml += '</div>';

        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        flowContainer.appendChild(stepElement);
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
        stepElement.querySelectorAll('.sop-button').forEach(button => {
        
            if (button.classList.contains('back-button')) {
                button.addEventListener('click', (e) => {
                    const flowContainer = document.getElementById('interactive-flow-container');
                    const currentStepElement = e.target.closest('.interactive-step');
                    
                    if (currentStepElement) {
                        const prevSeparator = currentStepElement.previousElementSibling;
                        
                        if (prevSeparator && prevSeparator.classList.contains('step-separator')) {
                            const prevStepElement = prevSeparator.previousElementSibling;
                            if (prevStepElement) {
                                prevStepElement.querySelectorAll('.sop-button').forEach(btn => {
                                    btn.disabled = false;
                                });
                            }
                            prevSeparator.remove();
                        }
                        currentStepElement.remove();
                        if (flowContainer) {
                            flowContainer.scrollTop = flowContainer.scrollHeight;
                        }
                    }
                });

            } else if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderSocialMediaImpersonationStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }

// --- *** NEW: Digital Arrest Interactive Flow *** ---
    const digitalArrestFlow = {
        'start': {
            message: "Welcome, Officer. This is the Digital Arrest Investigation Assistant. This is a high-priority extortion case often involving impersonation of police/government officials. Have you received a detailed written complaint?",
            options: [
                { text: "Yes", action: 'p1_checklist_1' },
                { text: "No", action: 'p1_action_complaint' }
            ]
        },
        'p1_action_complaint': {
            message: "<strong>Action Required:</strong> Please obtain a formal written complaint from the victim. This is the legal foundation for the investigation.",
            options: [
                { text: "Back", action: 'start' }
            ]
        },
        'p1_checklist_1': {
            message: "Great. Let's confirm the preliminary evidence.<br><br><strong>Evidence Checklist 1/4:</strong><br>The victim's <strong>bank account statement</strong> showing the fraudulent transactions (if any money was transferred)?",
            options: [
                { text: "Collected", action: 'p1_checklist_2' },
                { text: "Not Yet", action: 'p1_action_checklist_1' },
                { text: "No Money Transferred", action: 'p1_checklist_2' },
                { text: "Fund Trial Analysis First", action: 'p2_financial' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> Please obtain the bank statement if money was transferred. It's the primary proof of extortion.",
            options: [
                { text: "Back", action: 'p1_checklist_1' },
                { text: "Fund Trial Analysis First", action: 'p2_financial' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Bank Statement status noted.<br><br><strong>Evidence Checklist 2/4:</strong><br>The <strong>fraudulent mobile number(s)</strong> or VoIP identifiers that contacted the victim?",
            options: [
                { text: "Collected", action: 'p1_checklist_3' },
                { text: "Not Yet / Not Available", action: 'p1_checklist_3' }
            ]
        },
        'p1_checklist_3': {
            message: "✅ Contact identifiers noted.<br><br><strong>Evidence Checklist 3/4:</strong><br><strong>Screenshots or recordings of the video call</strong> (e.g., Skype, WhatsApp, Telegram) showing the impersonators, their fake IDs, usernames, or any threats made?",
            options: [
                { text: "Collected", action: 'p1_checklist_4' },
                { text: "Not Yet / Not Available", action: 'p1_checklist_4' }
            ]
        },
        'p1_checklist_4': {
            message: "✅ Call evidence status noted.<br><br><strong>Evidence Checklist 4/4:</strong><br>Any <strong>fake documents</strong> (arrest warrants, legal notices, courier receipts like FedEx) sent to the victim via email or chat?",
            options: [
                { text: "Collected", action: 'p1_fir_check' },
                { text: "Not Yet / Not Available", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_check': {
            message: "All preliminary evidence is documented. Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 384 (Extortion), 419 (Cheating by personation), 420 (Cheating), 170 (Personating a public servant), 120B (Criminal Conspiracy).</li><li><strong>IT Act:</strong> Sec 66C (Identity Theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately. This is a serious cognizable offense, and notices need to be sent urgently.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'p2_menu': {
            message: "With the FIR registered, we must pursue parallel trails urgently. Which do you want to start with?",
            options: [
                { text: "💰 Trace the Money (Fund Trial)", action: 'p2_financial' },
                { text: "🕵️‍♂️ Trace the Callers/Impersonators (Digital Trial)", action: 'p2_digital' }
            ]
        },

        // --- Financial Trail ---
        'p2_financial': {
            message: "<strong>Fund Trial Analysis</strong><br>How was the victim forced or instructed to send the money? (Select the primary method if applicable)",
            options: [
                { text: "Bank Transfer (NEFT/IMPS/RTGS)", action: 'p2_financial_bank' },
                { text: "Cryptocurrency (Bitcoin, Tether/USDT)", action: 'p2_financial_crypto' },
                { text: "No money was successfully transferred", action: 'p2_digital' }
            ]
        },
        'p2_financial_bank': {
            message: "<strong>URGENT ACTION: Bank Transfer Trail</strong><br>Have you identified the beneficiary 'mule' bank accounts from the victim's statement and sent notices under Sec 91 CrPC to the respective banks?",
            options: [
                { text: "Yes, Notices Sent to Freeze & Get KYC", action: 'p2_financial_bank_sent' },
                { text: "No, Need Sample Notice", action: 'p2_financial_bank_sample' }
            ]
        },
        'p2_financial_bank_sample': {
            message: `Use the standard 'Freeze and KYC' notice immediately. This is extremely time-sensitive.
            📄 Refer to specimen notice Annexure VI(A) in Part IV PDF. Request:
            <ul><li>Immediate Debit Freeze.</li><li>Account Opening Form (AOF) with photo.</li><li>Complete KYC documents (ID, Address proof).</li><li>Full Account Statement from opening date.</li></ul>`,
            options: [
                { text: "Understood, Notices Sent", action: 'p2_financial_bank_sent' },
                { text: "Back", action: 'p2_financial' }
            ]
        },
        'p2_financial_bank_sent': {
            message: "✅ Excellent, freezing the accounts is critical. While awaiting the bank's reply (KYC docs, statement), let's pursue the digital trail.",
            options: [
                { text: "Proceed to Digital Trail", action: 'p2_digital' },
                { text: "Wait for Bank Reply (Analyze Statement)", action: 'p3_analyze_mule' }
            ]
        },
        'p2_financial_crypto': {
            message: "<strong>Crypto Trail</strong><br>Tracing crypto is complex. Have you obtained the following from the victim?<br>1. The fraudster's <strong>Wallet Address</strong>.<br>2. The <strong>Transaction Hash (TxID)</strong>.<br>3. The name of the <strong>Exchange Platform</strong> used by the victim (if any)?",
            options: [
                { text: "Yes, I have these details", action: 'p2_financial_crypto_notice' },
                { text: "No, need to collect these details", action: 'p2_financial_crypto_help' }
            ]
        },
        'p2_financial_crypto_help': {
            message: "<strong>Action Required:</strong> Instruct the victim to log into their crypto exchange account and provide screenshots or details of the transaction, specifically the destination wallet address and the transaction hash (TxID).",
            options: [
                { text: "Back", action: 'p2_financial_crypto' }
            ]
        },
        'p2_financial_crypto_notice': {
            message: "<strong>URGENT ACTION:</strong> Send a notice under Sec 91 CrPC to the Nodal Officer of the Crypto Exchange (e.g., WazirX, CoinDCX, Binance, etc.) involved, providing the Transaction Hash (TxID) and suspect wallet address. Request:<ul><li>Attempt to <strong>freeze</strong> the destination wallet (if possible and hosted on their platform).</li><li>Request <strong>KYC details</strong> of the wallet owner (if available).</li><li>Request the full <strong>transaction history</strong> of the suspect wallet.</li></ul>",
            options: [
                { text: "Notice Sent", action: 'p2_financial_crypto_sent' },
                { text: "Back", action: 'p2_financial_crypto' }
            ]
        },
        'p2_financial_crypto_sent': {
             message: "✅ Crypto exchange notified. Recovery is difficult, but KYC is a potential lead. Let's pursue the digital trail of the callers.",
             options: [
                 { text: "Proceed to Digital Trail", action: 'p2_digital' }
             ]
        },
        'p3_analyze_mule': {
            message: "You have received the mule account statement from the bank. Analyze the statement for subsequent transactions. What did you find?",
            options: [
                { text: "Further Transfer to Another Bank Account", action: 'p3_mule_layer2' },
                { text: "Cash Withdrawal from ATM", action: 'p3_mule_atm' },
                { text: "Purchase / Online Transaction", action: 'p3_mule_purchase' },
                { text: "Trail ends here / Funds still in account", action: 'p2_digital' }
            ]
        },
        'p3_mule_layer2': {
            message: "<strong>New Lead: Layer 2 Mule Account(s)</strong><br>Immediately repeat the process: Send notices to the new beneficiary banks to <strong>freeze the accounts</strong> and request their KYC and full statements.",
            options: [
                { text: "Understood, will send new notices", action: 'p3_analyze_mule' }
            ]
        },
        'p3_mule_atm': {
            message: "<strong>New Lead: ATM Withdrawal</strong><br>This provides a chance for physical identification. Note the ATM ID, location, date, and time from the statement. Send an urgent notice to the bank that owns the ATM requesting:<ul><li><strong>CCTV footage</strong> from all cameras (lobby, machine, entrance) for the relevant time period.</li><li>Pin-hole camera images.</li><li>Electronic Journal (EJ) Log.</li></ul>",
            options: [
                { text: "Understood, notice sent for CCTV", action: 'p3_analyze_mule' }
            ]
        },
         'p3_mule_purchase': {
             message: "<strong>New Lead: Online/Merchant Transaction</strong><br>Identify the merchant (e.g., E-commerce, Travel booking). Send notice requesting:<ul><li>Product/Service details.</li><li>Delivery Address (if applicable).</li><li>Registered user account details (Mobile, Email).</li><li>IP address used for the transaction.</li></ul>",
            options: [
                { text: "Understood, notice sent to Merchant", action: 'p3_analyze_mule' }
            ]
        },

        // --- Digital Trail ---
        'p2_digital': {
            message: "<strong>Digital Footprint Investigation</strong><br>What is the primary digital communication channel used by the impersonators?",
            options: [
                { text: "Video Call (Skype, WhatsApp, Telegram etc.)", action: 'p2_digital_video' },
                { text: "Phone Number (Likely VoIP/International)", action: 'p2_digital_number' },
                { text: "Email (Used for Fake Documents/Communication)", action: 'p2_digital_email' }
            ]
        },
        'p2_digital_video': {
            message: "You have the fraudster's User ID/Username/Number for the video call platform (e.g., Skype, WhatsApp). Have you sent a notice under Sec 91 CrPC to the respective platform?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_digital_video_sent' },
                { text: "No, Need Sample Guidance", action: 'p2_digital_video_sample' }
            ]
        },
        'p2_digital_video_sample': {
            message: `Use the standard notices for social media/communication platforms. Key requests:
            <ul><li>Basic subscriber details (Name, registration email, phone number).</li><li>Account creation IP address and timestamp.</li><li>IP logs for login/activity during the period of the crime (Specify date/time in UTC).</li></ul>
            ➡️ Refer to SOPs for Facebook/Instagram/Twitter, WhatsApp, Google/Youtube in Part IV PDF for platform-specific details and portals/addresses.`,
            options: [
                { text: "Understood, Notice Sent", action: 'p2_digital_video_sent' },
                { text: "Back to Digital Trail Menu", action: 'p2_digital' }
            ]
        },
        'p2_digital_video_sent': {
            message: "✅ Platform notified. IP logs are crucial for tracing the origin. While waiting, pursue other leads.",
            options: [
                { text: "Trace Phone Number (if available)", action: 'p2_digital_number' },
                { text: "Trace Email (if available)", action: 'p2_digital_email' },
                { text: "Wait for Platform Reply (IP Logs)", action: 'p3_ip_trace' }
            ]
        },
        'p2_digital_number': {
            message: "<strong>Trace Phone Number (VoIP Investigation)</strong><br>You have the number that called the victim (e.g., +1xxxx, unknown). First, send a notice for the CDR of the *victim's* number to their Mobile Service Provider (MSP). Have you done this?",
            options: [
                { text: "Yes, Victim's CDR requested", action: 'p2_digital_number_analyze' },
                { text: "No, Need to request Victim's CDR", action: 'p2_digital_number_action' }
            ]
        },
         'p2_digital_number_action': {
            message: "<strong>Action Required:</strong> Send notice to the victim's MSP (Airtel, Jio, etc.) requesting the CDR for their number covering the time of the fraudulent call. Ask specifically for the 'Incoming Trunk Gateway (TG)' details for that call.",
            options: [
                { text: "Notice Sent", action: 'p2_digital_number_analyze' },
                { text: "Back", action: 'p2_digital' }
            ]
        },
        'p2_digital_number_analyze': {
            message: "Once you receive the victim's CDR, identify the Incoming Trunk Gateway (TG) provider (e.g., Tata Communications, Airtel International Gateway) for the specific fraudulent call. Have you identified the TG provider?",
            options: [
                { text: "Yes, TG Provider Identified", action: 'p2_digital_number_tg_notice' },
                { text: "No, Awaiting Victim's CDR", action: 'p2_digital_number_analyze' }
            ]
        },
        'p2_digital_number_tg_notice': {
             message: "Now, send a notice under Sec 91 CrPC to the identified Trunk Gateway provider. Request the details of the originating VoIP carrier/provider that routed the call through their gateway at that specific date and time.",
            options: [
                { text: "Yes, TG Provider Notified", action: 'p2_digital_number_carrier_notice' },
                { text: "No, Need to Notify TG Provider", action: 'p2_digital_number_tg_notice' }
            ]
        },
        'p2_digital_number_carrier_notice': {
             message: "The TG provider should name the originating VoIP carrier (e.g., Skype, Vonage, a smaller provider). Send a final notice under Sec 91 CrPC to that specific VoIP carrier requesting:<ul><li>Subscriber details for the fraudulent number.</li><li>IP logs for call origination.</li></ul> This may require MLAT/LR if the carrier is foreign.",
            options: [
                { text: "Understood, VoIP Carrier Notified", action: 'p2_digital_number_sent' },
                { text: "Back", action: 'p2_digital_number_analyze' }
            ]
        },
        'p2_digital_number_sent': {
            message: "✅ VoIP trace initiated. This is often complex and may require international cooperation (MLAT/LR). While pursuing this, check other leads.",
            options: [
                { text: "Trace Video Call Platform", action: 'p2_digital_video' },
                { text: "Trace Email", action: 'p2_digital_email' },
                { text: "Proceed to Field Investigation (if other leads exist)", action: 'p4_field' }
            ]
        },
         'p2_digital_email': {
             message: "<strong>Trace Email Address</strong><br>You have the email address used by the fraudsters (e.g., for sending fake documents). Have you sent a notice under Sec 91 CrPC to the Email Service Provider (ESP - e.g., Gmail, Outlook, Yahoo)?",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_digital_email_sent' },
                { text: "No, Need Sample Guidance", action: 'p2_digital_email_sample' }
            ]
        },
         'p2_digital_email_sample': {
            message: `Use the standard notice for Email Service Providers. Key requests:
            <ul><li>Basic subscriber details (Name, recovery email, phone number).</li><li>Account creation IP address and timestamp.</li><li>IP logs for login/activity during the period of the crime (Specify date/time in UTC/IST).</li></ul>
            ➡️ Refer to SOPs for Google/Yahoo/Microsoft in Part IV PDF for addresses and portals.`,
            options: [
                { text: "Understood, Notice Sent", action: 'p2_digital_email_sent' },
                { text: "Back to Digital Trail Menu", action: 'p2_digital' }
            ]
        },
        'p2_digital_email_sent': {
            message: "✅ Email provider notified. Awaiting IP logs and subscriber details.",
            options: [
                { text: "Trace Video Call Platform", action: 'p2_digital_video' },
                { text: "Trace Phone Number", action: 'p2_digital_number' },
                { text: "Wait for ESP Reply (IP Logs)", action: 'p3_ip_trace' }
            ]
        },
        'p3_ip_trace': {
            message: "<strong>IP Address Trace</strong><br>You have received an IP address (from Video Call platform, Email provider, or potentially VoIP carrier). Have you used a Whois tool (e.g., <code>whois.domaintools.com</code>) to identify the Internet Service Provider (ISP)?",
            options: [
                { text: "Yes, ISP identified", action: 'p3_ip_notice' },
                { text: "No, not yet", action: 'p3_ip_action' }
            ]
        },
        'p3_ip_action': {
            message: "<strong>Action Required:</strong> Use a Whois lookup tool to identify the owner (ISP) of the IP address. This is essential to request subscriber details.",
            options: [
                { text: "Back", action: 'p2_digital' }
            ]
        },
        'p3_ip_notice': {
            message: "Have you sent a notice under Sec 91 CrPC to the identified ISP requesting the Subscriber Detail Record (SDR) / IP User Details for that IP address at the specific date and time (remember to convert UTC to IST)?",
            options: [
                { text: "Yes, Notice Sent to ISP", action: 'p3_ip_sent' },
                { text: "No, Need Sample ISP Notice", action: 'p3_ip_sample' }
            ]
        },
        'p3_ip_sample': {
            message: `Use the standard ISP notice template. Ensure you include:
            <ul><li>IP Address.</li><li>Date.</li><li>Exact Time (in IST).</li><li>Port Number (if available).</li></ul>
            Request the user's name, registered address, and linked mobile number (CAF/SDR details).`,
            options: [
                { text: "Got it, Notice Sent", action: 'p3_ip_sent' },
                { text: "Back", action: 'p3_ip_notice' }
            ]
        },
         'p3_ip_sent': {
            message: "✅ ISP notified. Awaiting subscriber details (Name and Address). This is a strong lead for field verification.",
            options: [
                 { text: "Proceed to Field Investigation", action: 'p4_field' },
                 { text: "Pursue Other Digital Leads", action: 'p2_digital'}
            ]
        },

        // --- Field Investigation ---
        'p4_field': {
            message: "<strong>Field Investigation</strong><br>Consolidate all potential physical addresses obtained:<ul><li>From Mule Bank Account KYC documents.</li><li>From ISP records linked to IP addresses.</li><li>Any addresses from Crypto Exchange KYC (less common).</li></ul>Have you correlated these addresses and identified potential targets for verification?",
            options: [
                { text: "Yes, addresses identified/correlated", action: 'p4_field_verify' },
                { text: "Leads point overseas / Addresses seem fake", action: 'p4_field_revisit' },
                { text: "Awaiting Address Details", action: 'p4_field' }
            ]
        },
        'p4_field_revisit': {
            message: "This indicates a sophisticated operation, likely based outside the local jurisdiction or using fake documents. Focus on:<ul><li>Analyzing all layers of mule accounts for any local ATM withdrawals.</li><li>Pursuing MLAT/LR for foreign leads (VoIP, IP, Crypto).</li><li>Deep analysis of seized devices from any apprehended mules.</li></ul>",
            options: [
                { text: "Re-analyze Fund Trial", action: 'p2_financial' },
                { text: "Focus on Digital Trail (MLAT/LR)", action: 'p2_digital' }
            ]
        },
        'p4_field_verify': {
            message: "Have you conducted physical verification (field enquiry) at the identified addresses to confirm the identity and presence of the suspects (likely money mules)?",
            options: [
                { text: "Yes, suspect(s) presence verified", action: 'p5_apprehend' },
                { text: "Verification Pending / In Progress", action: 'p4_field_verify' }
            ]
        },
        'p5_apprehend': {
            message: "Based on the verification and accumulated evidence, have you apprehended the suspect(s) (money mules)?",
            options: [
                { text: "Yes, accused apprehended", action: 'p5_seize' },
                { text: "Apprehension Pending", action: 'p5_apprehend' }
            ]
        },
        'p5_seize': {
            message: "<strong>Critical Step: Seizure</strong><br>Have you seized all relevant devices (mobiles, SIM cards, laptops, bank cards, documents) from the apprehended accused under a proper seizure mahazar?",
            options: [
                { text: "Yes, devices seized", action: 'p5_preserve' },
                { text: "Seizure Pending", action: 'p5_seize' }
            ]
        },
        'p5_preserve': {
             message: "<strong>Evidence Preservation:</strong> Have you ensured all seized electronic devices are properly isolated to prevent data alteration?<ul><li>Mobiles: Airplane Mode or Faraday Bag/Tin Foil.</li><li>Laptops/PCs: Disconnect power from the back (do not shut down normally if ON).</li></ul>",
            options: [
                { text: "Yes, evidence preserved correctly", action: 'p5_fsl' },
                { text: "Need to follow preservation steps", action: 'p5_preserve' }
            ]
        },
        'p5_fsl': {
            message: "Have the seized and preserved devices been forwarded to the Forensic Science Laboratory (FSL) for data extraction and analysis? Analysis of mules' devices is crucial to identify the masterminds.",
            options: [
                { text: "Yes, sent to FSL", action: 'p6_complete' },
                { text: "No, FSL forwarding pending", action: 'p5_fsl' }
            ]
        },
        'p6_complete': {
            message: "<strong>Investigation Complete (Phase 1).</strong> You have successfully traced and apprehended the local money mules. Once the FSL report is received, compile all evidence (Bank replies, ISP replies, KYC docs, FSL report, Witness Statements, Mahazars) and file the final report (Charge Sheet) against the apprehended accused. The investigation continues to trace the main operators, possibly requiring MLAT/LR based on FSL findings and earlier digital leads.",
            options: [
                { text: "Start New Investigation", action: 'start_new' }
            ]
        }
    };











































    
        
});
