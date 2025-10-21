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

    // *** NEW: Filters and displays the suggestion box ***
    function showSuggestions() {
        const query = searchInput.value.toLowerCase();
        sopSuggestions.innerHTML = ''; // Clear old suggestions
        
        if (query.length === 0) {
            sopSuggestions.style.display = 'none';
            return;
        }
        
        const filteredTitles = sopTitles.filter(title => 
            title.toLowerCase().includes(query)
        );
        
        if (filteredTitles.length > 0) {
            filteredTitles.forEach(title => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = title;
                sopSuggestions.appendChild(item);
            });
            sopSuggestions.style.display = 'block';
        } else {
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
            } else {
                // Original functionality for all other crime types
                currentCrime = sopData[crimeKey];
                currentStepIndex = 0;
                displayStep(); // This uses the old (non-chat) display
                updateHistory(crimeKey, currentCrime.title);
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
            message: "Great. Let's create a checklist for the preliminary evidence. Please confirm which of the following you have collected from the complainant.<br><br><strong>Evidence Checklist Item 1/4:</strong><br>Do you have the victim's <strong>bank account statements</strong> showing the fraudulent transactions?",
            options: [
                { text: "Yes, Collected", action: 'p1_checklist_2' },
                { text: "No, Not Yet", action: 'p1_action_checklist_1' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> Please obtain the bank statements first. They are the primary document for the financial investigation.",
            options: [
                { text: "Back", action: 'p1_checklist_1' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Bank Statements collected.<br><br><strong>Evidence Checklist Item 2/4:</strong><br>Do you have <strong>screenshots</strong> of the Facebook profile, WhatsApp chats , and the fraudulent website? <em>Ensure URL, date, and time are visible.</em>",
            options: [
                { text: "Yes, Collected", action: 'p1_checklist_3' },
                { text: "No, Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
             message: "<strong>Action Required:</strong> Please collect these crucial screenshots. They directly link the suspect's digital assets to the crime. Let me know when you have them.",
             options: [
                { text: "Back", action: 'p1_checklist_2' }
             ]
        },
        'p1_checklist_3': {
            message: "✅ Screenshots collected.<br><br><strong>Evidence Checklist Item 3/4:</strong><br>Do you have the fraudulent <strong>mobile application file (.apk)</strong>, if the victim had installed one?",
            options: [
                { text: "Yes, Collected", action: 'p1_checklist_4' },
                { text: "No / Not Applicable", action: 'p1_checklist_4_skipped' }
            ]
        },
        'p1_checklist_4': {
            message: "✅ APK file collected.<br><br><strong>Evidence Checklist Item 4/4:</strong><br>Do you have any <strong>email correspondence</strong> (from <code>info@bgcltgi.com</code>) with full email headers?",
            options: [
                { text: "Yes, Collected", action: 'p1_checklist_complete' },
                { text: "No / Not Applicable", action: 'p1_checklist_complete_skipped' }
            ]
        },
        'p1_checklist_4_skipped': {
            message: "Understood. Noted that the APK file was not available.<br><br><strong>Evidence Checklist Item 4/4:</strong><br>Do you have any <strong>email correspondence</strong> (from <code>info@bgcltgi.com</code>) with full email headers?",
            options: [
                { text: "Yes, Collected", action: 'p1_checklist_complete' },
                { text: "No / Not Applicable", action: 'p1_checklist_complete_skipped' }
            ]
        },
        'p1_checklist_complete': {
            message: "Excellent, all key evidence has been noted. Let's proceed.",
            options: [
                { text: "Continue", action: 'p1_fir_check' }
            ]
        },
        'p1_checklist_complete_skipped': {
            message: "Excellent, all key evidence has been noted. Let's proceed.",
            options: [
                { text: "Continue", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_check': {
            message: "Now that the preliminary evidence is in order, have you registered the First Information Report (FIR)? The recommended sections are:<br><ul><li><strong>Indian Penal Code (IPC):</strong> Section <strong>419</strong> (Cheating by Personation) & Section <strong>420</strong> (Cheating).</li><li><strong>Information Technology (IT) Act:</strong> Section <strong>66D</strong> (Cheating by Personation using a computer resource) & Section <strong>66C</strong> (Identity Theft).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'main_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately. A registered FIR number is mandatory for sending legal notices under Section 91 CrPC.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'main_menu': {
            message: "With the FIR registered, which trail would you like to pursue now?",
            options: [
                { text: "Digital Footprint Investigation", action: 'digital_menu' },
                { text: "Financial Trail Investigation", action: 'financial_menu' }
            ]
        },
        // --- Digital Footprint Branch ---
        'digital_menu': {
            message: "You've chosen <strong>Digital Footprint Investigation</strong>. Which specific lead do you want to trace first?",
            options: [
                { text: "WhatsApp Number", action: 'digital_whatsapp' },
                { text: "Facebook Profile", action: 'digital_facebook' },
                { text: "Website", action: 'digital_website' },
                { text: "Back to Main Menu", action: 'main_menu' }
            ]
        },
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
                { text: "Yes, Submitted", action: 'digital_menu_return' },
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
                { text: "Notice has been sent", action: 'digital_menu_return' },
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
                { text: "Notice has been sent", action: 'digital_menu_return' },
                { text: "Back", action: 'digital_whatsapp_assist' }
            ]
        },
        'digital_menu_return': {
            message: "You are in the <strong>Digital Footprint Investigation</strong>. You have already initiated the request to WhatsApp. What is your next step?",
            options: [
                { text: "Investigate Facebook Profile", action: 'digital_facebook' },
                { text: "Investigate Website", action: 'digital_website' },
                { text: "I have received IP logs and want to trace them", action: 'digital_ip_trace' },
                { text: "Switch to Financial Trail Investigation", action: 'financial_menu' }
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
                { text: "Done", action: 'digital_menu_return_fb' }
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
                { text: "Notice has been sent", action: 'digital_menu_return_fb' },
                { text: "Back", action: 'digital_facebook' }
            ]
        },
        'digital_menu_return_fb': {
            message: "You are in the <strong>Digital Footprint Investigation</strong>. You have initiated requests for WhatsApp and Facebook. What is your next step?",
            options: [
                { text: "Investigate Website", action: 'digital_website' },
                { text: "I have received IP logs and want to trace them", action: 'digital_ip_trace' },
                { text: "Switch to Financial Trail Investigation", action: 'financial_menu' }
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
                { text: "Continue", action: 'digital_menu_return_all' }
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
        'digital_menu_return_all': {
            message: "You have initiated all digital footprint leads. What is your next step?",
            options: [
                { text: "I have received IP logs and want to trace them", action: 'digital_ip_trace' },
                { text: "Switch to Financial Trail Investigation", action: 'financial_menu' },
                { text: "Go to Field Investigation", action: 'field_menu' }
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
                { text: "Yes, notice sent", action: 'digital_menu_return_all' },
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
                { text: "Notice has been sent", action: 'digital_menu_return_all' },
                { text: "Back", action: 'digital_ip_notice' }
            ]
        },
        // --- Financial Trail Branch ---
        'financial_menu': {
            message: "You've selected <strong>Financial Trail Investigation</strong>. Have you analyzed the victim's bank statement and identified the beneficiary (mule) bank accounts?",
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
                { text: "No, still waiting", action: 'financial_mule_docs' }
            ]
        },
        'financial_mule_analysis': {
            message: "Now, analyze the mule account statements. Did you find either of the following?",
            options: [
                { text: "Further transfers to other bank accounts", action: 'financial_mule_layer_2' },
                { text: "Cash withdrawals from an ATM", action: 'financial_mule_atm' },
                { text: "Neither, the trail ends here", action: 'field_menu' }
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
        // --- Field Investigation Branch ---
        'field_menu': {
            message: "It appears you have gathered leads from both Digital and Financial investigations. Are you ready to proceed to <strong>Phase 4: Field Investigation and Culmination</strong>?",
            options: [
                { text: "Yes, I have enough leads", action: 'field_correlate' },
                { text: "No, I need more information", action: 'main_menu' }
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
            message: "Great. Let's create a checklist for preliminary evidence. Please confirm which of the following you have collected.<br><br><strong>Evidence Checklist 1/4:</strong><br>The victim's <strong>bank account statement</strong> showing the fraudulent UPI transaction(s)?",
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
            message: "✅ Bank Statement collected.<br><br><strong>Evidence Checklist 2/4:</strong><br><strong>Screenshots</strong> from the victim's UPI app showing the transaction ID and the beneficiary's UPI ID/linked mobile number?",
            options: [
                { text: "Collected", action: 'p1_checklist_3' },
                { text: "Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
            message: "<strong>Action Required:</strong> Please collect these screenshots. The transaction ID is crucial for tracing the funds.",
            options: [
                { text: "Back", action: 'p1_checklist_2' }
            ]
        },
        'p1_checklist_3': {
            message: "✅ UPI transaction screenshots collected.<br><br><strong>Evidence Checklist 3/4:</strong><br>The <strong>fraudulent UPI ID</strong> and/or the <strong>mobile number</strong> used by the accused?",
            options: [
                { text: "Collected", action: 'p1_checklist_4' },
                { text: "Not Yet", action: 'p1_action_checklist_3' }
            ]
        },
        'p1_action_checklist_3': {
            message: "<strong>Action Required:</strong> Please obtain the accused's UPI ID or phone number from the victim. This is the primary lead.",
            options: [
                { text: "Back", action: 'p1_checklist_3' }
            ]
        },
        'p1_checklist_4': {
            message: "✅ Accused's UPI ID/mobile number noted.<br><br><strong>Evidence Checklist 4/4:</strong><br>Any <strong>screenshots of chats</strong> (e.g., WhatsApp) or recordings of calls with the fraudster?",
            options: [
                { text: "Collected", action: 'p1_checklist_complete' },
                { text: "Not Applicable", action: 'p1_checklist_complete_skipped' }
            ]
        },
        'p1_checklist_complete': {
            message: "Excellent. All preliminary evidence is documented. Let's proceed.",
            options: [
                { text: "Continue", action: 'p1_fir_check' }
            ]
        },
        'p1_checklist_complete_skipped': {
            message: "Understood. No direct communication evidence is available. Let's proceed.",
            options: [
                { text: "Continue", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_check': {
            message: "Now that the evidence is in order, have you registered the First Information Report (FIR)?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 420 (Cheating).</li><li><strong>IT Act:</strong> Sec 66D (Cheating by personation using a computer resource).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'main_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately. A registered FIR number is mandatory for sending legal notices under Section 91 CrPC.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'main_menu': {
            message: "With the FIR registered, which trail would you like to pursue?",
            options: [
                { text: "💰 Financial Trail", action: 'financial_menu' },
                { text: "🕵️‍♂️ Digital Footprint", action: 'digital_menu' }
            ]
        },
        'financial_menu': {
            message: "You've chosen <strong>Financial Trail Investigation</strong>. Based on the victim's statement, was the money transferred to a UPI ID linked to a Bank Account or a Mobile E-wallet (like Paytm, PhonePe)?",
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
                { text: "Back", action: 'main_menu' }
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
                { text: "Back to Main Menu", action: 'main_menu' }
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
                { text: "Back to Main Menu", action: 'main_menu' }
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
                { text: "Back to Main Menu", action: 'main_menu' }
            ]
        },
        'fin_wallet_action': {
            message: "<strong>Action Required:</strong> Send the notice immediately to the wallet provider to prevent the funds from being moved.",
            options: [
                { text: "Back", action: 'fin_wallet' }
            ]
        },
        'digital_menu': {
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
                { text: "Back to Main Menu", action: 'main_menu' }
            ]
        },
        'digital_action': {
            message: "<strong>Action Required:</strong> Send the notice to the MSP immediately. The subscriber details are essential for identifying the accused.",
            options: [
                { text: "Back", action: 'digital_menu' }
            ]
        },
        'field_menu': {
            message: "You have gathered leads from both financial and digital investigations. Are you ready to proceed to <strong>Field Investigation</strong>?",
            options: [
                { text: "Yes, I have leads", action: 'field_correlate' },
                { text: "Need more information", action: 'main_menu' }
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

    // --- *** NEW: ATM/Card Fraud Interactive Flow *** ---
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
            message: "Let's begin the evidence checklist. Please confirm what you have collected.<br><br><strong>Evidence Checklist 1/4:</strong><br>The victim's <strong>bank account/credit card statement</strong> showing the fraudulent transaction(s), including date, time, and amount?",
            options: [
                { text: "Collected", action: 'p1_checklist_2' },
                { text: "Not Yet", action: 'p1_action_checklist_1' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> The bank/card statement is the foundational document. Please obtain it first.",
            options: [
                { text: "Back", action: 'p1_checklist_1' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Bank/Card Statement collected.<br><br><strong>Evidence Checklist 2/4:</strong><br>The victim's full <strong>Credit/Debit card number</strong>, expiry date, and bank name?",
            options: [
                { text: "Collected", action: 'p1_checklist_3' },
                { text: "Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
            message: "<strong>Action Required:</strong> Please obtain the full card details from the victim.",
            options: [
                { text: "Back", action: 'p1_checklist_2' }
            ]
        },
        'p1_checklist_3': {
            message: "✅ Card details noted.<br><br><strong>Evidence Checklist 3/4:</strong><br>The <strong>debit alert SMS or email</strong> received by the victim, which may contain merchant or ATM location details?",
            options: [
                { text: "Collected", action: 'p1_checklist_4' },
                { text: "Not Yet", action: 'p1_action_checklist_3' }
            ]
        },
        'p1_action_checklist_3': {
            message: "<strong>Action Required:</strong> Collect the debit alert message. It's a key piece of evidence.",
            options: [
                { text: "Back", action: 'p1_checklist_3' }
            ]
        },
        'p1_checklist_4': {
            message: "✅ Debit alert message collected.<br><br><strong>Evidence Checklist 4/4:</strong><br>Has the victim confirmed if the card was physically lost or stolen, or if it was always in their possession (indicating skimming/cloning)?",
            options: [
                { text: "In Possession (Skimming/Online)", action: 'p1_fir_check' },
                { text: "Lost / Stolen", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_check': {
            message: "Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 420 (Cheating), Sec 379 (Theft, if card was stolen).</li><li><strong>IT Act:</strong> Sec 66C (Identity theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR. It is mandatory for sending legal notices and proceeding with the investigation.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'p2_menu': {
            message: "Based on the victim's statement, what was the nature of the fraudulent transaction?",
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
                { text: "Back", action: 'p2_atm' }
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
            message: "Excellent. The CCTV footage is the most critical evidence for identifying the suspect. Have you also requested the bank to initiate the chargeback procedure?",
            options: [
                { text: "Yes, Initiated", action: 'p3_menu' },
                { text: "Not Yet", action: 'p2_atm_chargeback_action' }
            ]
        },
        'p2_atm_chargeback_action': {
            message: "Please advise the victim to coordinate with their bank for the chargeback procedure.",
            options: [
                { text: "Done", action: 'p3_menu' }
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
                { text: "Back", action: 'p2_ecommerce' }
            ]
        },
        'p2_ecommerce_notice': {
            message: "Have you sent a notice under Sec 91 CrPC to the nodal officer of the merchant/platform?<br>👉 The notice should request:<ul><li>Details of the product/service purchased.</li><li><strong>Delivery address</strong> for the product.</li><li><strong>Registered mobile number and email ID</strong> of the account holder.</li><li><strong>IP address</strong> used to place the order.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'p3_menu' },
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
                { text: "Back", action: 'p2_pos' }
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
                { text: "Understood", action: 'p3_menu' }
            ]
        },
        'p3_menu': {
            message: "Based on the responses from banks and merchants, what is your next step?",
            options: [
                { text: "Trace IP Address (from Online Purchase)", action: 'p3_ip' },
                { text: "Field Verification (from ATM/POS/Delivery Address)", action: 'p3_field' }
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
                { text: "Back", action: 'p3_ip' }
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
                { text: "Proceed to Field Investigation", action: 'p3_field' },
                { text: "Back to Main Menu", action: 'p2_menu' }
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
                { text: "Back", action: 'p3_menu' }
            ]
        },
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

    // --- *** NEW: Internet Banking Fraud Interactive Flow *** ---
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
            message: "Let's proceed with the preliminary evidence checklist.<br><br><strong>Evidence Checklist 1/4:</strong><br>The victim's <strong>bank account statement</strong> showing the fraudulent transaction(s)?",
            options: [
                { text: "Collected", action: 'p1_checklist_2' },
                { text: "Not Yet", action: 'p1_action_checklist_1' }
            ]
        },
        'p1_action_checklist_1': {
            message: "<strong>Action Required:</strong> The bank statement is the primary document. Please obtain it first.",
            options: [
                { text: "Back", action: 'p1_checklist_1' }
            ]
        },
        'p1_checklist_2': {
            message: "✅ Bank Statement collected.<br><br><strong>Evidence Checklist 2/4:</strong><br>Has the victim provided the <strong>phishing email</strong> (with full headers) or the <strong>URL of the fake banking website</strong> they visited?",
            options: [
                { text: "Yes, Collected", action: 'p1_checklist_3' },
                { text: "Not Yet", action: 'p1_action_checklist_2' }
            ]
        },
        'p1_action_checklist_2': {
            message: "<strong>Action Required:</strong> The phishing email or fake URL is the origin of the crime. Please make every effort to obtain this from the victim.",
            options: [
                { text: "Back", action: 'p1_checklist_2' }
            ]
        },
        'p1_checklist_3': {
            message: "✅ Phishing email/URL collected.<br><br><strong>Evidence Checklist 3/4:</strong><br>The victim's registered <strong>mobile number and email ID</strong> with the bank?",
            options: [
                { text: "Collected", action: 'p1_checklist_4' },
                { text: "Not Yet", action: 'p1_action_checklist_3' }
            ]
        },
        'p1_action_checklist_3': {
            message: "<strong>Action Required:</strong> Please obtain the victim's registered contact details.",
            options: [
                { text: "Back", action: 'p1_checklist_3' }
            ]
        },
        'p1_checklist_4': {
            message: "✅ Contact details noted.<br><br><strong>Evidence Checklist 4/4:</strong><br>Any <strong>screenshots of SMS alerts</strong> related to the fraudulent transaction?",
            options: [
                { text: "Collected", action: 'p1_checklist_complete' },
                { text: "Not Applicable", action: 'p1_checklist_complete_skipped' }
            ]
        },
        'p1_checklist_complete': {
            message: "✅ SMS alerts collected. All preliminary evidence is documented.",
            options: [
                { text: "Continue", action: 'p1_fir_check' }
            ]
        },
        'p1_checklist_complete_skipped': {
            message: "Understood.",
            options: [
                { text: "Continue", action: 'p1_fir_check' }
            ]
        },
        'p1_fir_check': {
            message: "Have you registered the FIR?<br>⚖️ <strong>Recommended sections:</strong><ul><li><strong>IPC:</strong> Sec 419 (Cheating by personation), Sec 420 (Cheating), Sec 468 (Forgery for purpose of cheating).</li><li><strong>IT Act:</strong> Sec 66C (Identity theft), Sec 66D (Cheating by personation).</li></ul>",
            options: [
                { text: "Yes, FIR Registered", action: 'p2_menu' },
                { text: "No, Not Yet", action: 'p1_action_fir' }
            ]
        },
        'p1_action_fir': {
            message: "<strong>Action Required:</strong> Please register the FIR immediately to proceed with the investigation.",
            options: [
                { text: "Back", action: 'p1_fir_check' }
            ]
        },
        'p2_menu': {
            message: "With the FIR registered, which trail do you want to pursue first?",
            options: [
                { text: "💰 Financial Trail", action: 'p2_financial' },
                { text: "🕵️‍♂️ Digital Footprint", action: 'p2_digital' }
            ]
        },
        'p2_financial': {
            message: "You've chosen <strong>Financial Trail</strong>. Have you sent a notice to the victim's bank requesting details of the fraudulent transaction?<br>👉 The notice should request:<ul><li>The <strong>beneficiary account details</strong> (Account No, Name, Bank, IFSC).</li><li>The <strong>IP address</strong> from which the fraudulent internet banking session was logged.</li><li>The date and timestamp of the login and transaction.</li></ul>",
            options: [
                { text: "Yes, Notice Sent", action: 'p2_financial_sent' },
                { text: "Not Yet", action: 'p2_financial_action' }
            ]
        },
        'p2_financial_action': {
            message: "<strong>Action Required:</strong> Send this notice to the victim's bank immediately.",
            options: [
                { text: "Back", action: 'p2_financial' }
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
            message: "Please follow up with the victim's bank. The beneficiary details and IP address are the most critical pieces of information they can provide.",
            options: [
                { text: "Back to Main Menu", action: 'p2_menu' }
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
                { text: "OK, I'll follow the standard procedure", action: 'p2_menu' },
                { text: "I need a sample notice", action: 'p2_financial_sample' }
            ]
        },
        'p2_financial_sample': {
            message: `Please use the sample notice from the UPI Fraud flow. It is almost identical. Just ensure you specify the transaction type as "Internet Banking / NEFT / IMPS".`,
            options: [
                 { text: "Got it", action: 'p2_financial_trace_account' }
            ]
        },
        'p2_digital': {
            message: "You've chosen <strong>Digital Footprint</strong>. What is the primary digital evidence you have?",
            options: [
                { text: "📧 Phishing Email", action: 'p2_digital_email' },
                { text: "🌐 Fake Website URL", action: 'p2_digital_website' },
                { text: "Login IP Address (from bank)", action: 'p2_digital_ip' }
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
                { text: "Back to Digital Menu", action: 'p2_digital' }
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
                { text: "Back", action: 'p2_digital_website' }
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
                { text: "Back to Digital Menu", action: 'p2_digital' }
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
                { text: "Back", action: 'p2_digital_ip' }
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
                { text: "Back to Main Menu", action: 'p2_menu' }
            ]
        },
        'p2_digital_ip_sample': {
            message: "Please use the standard ISP notice template provided in the Card Fraud flow.",
            options: [
                { text: "Got it", action: 'p2_digital_ip_notice' }
            ]
        },
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
                { text: "Back to Digital Menu", action: 'p2_digital' }
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
            if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderInvestmentFraudStep(nextStepKey);
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
            if (!button.classList.contains('download-button')) {
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
            if (!button.classList.contains('download-button')) {
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
            if (!button.classList.contains('download-button')) {
                button.addEventListener('click', (e) => {
                    const nextStepKey = e.target.dataset.actionKey;
                    if (nextStepKey) {
                        renderInternetBankingFraudStep(nextStepKey); // Recursive call to its own render function
                    }
                });
            }
        });
    }

});
