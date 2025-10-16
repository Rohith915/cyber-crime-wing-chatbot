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
    
    // References for the collapsible sidebar
    const historyToggle = document.getElementById('history-toggle');
    const leftPanel = document.getElementById('left-panel');
    const mainGrid = document.getElementById('main-grid'); 

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

    // Event listener for the sidebar toggle button
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
            if (crimeKey === "investment fraud") {
                startInvestmentFraudFlow(); 
                updateHistory(crimeKey, sopData[crimeKey].title);
            } else {
                // Original functionality for all other crime types
                currentCrime = sopData[crimeKey];
                currentStepIndex = 0;
                displayStep(); // This uses the old (non-chat) display
                updateHistory(crimeKey, currentCrime.title);
            }
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

    // --- *** Investment Fraud Interactive Flow *** ---

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
                { text: "Back", action: 'financial_mmule_atm' }
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

    /**
     * Starts the interactive flow for Investment Fraud
     */
    function startInvestmentFraudFlow() {
        // Create the scrolling container *once*
        sopDisplay.innerHTML = ''; 
        const flowContainer = document.createElement('div');
        flowContainer.id = 'interactive-flow-container';
        flowContainer.className = 'sop-card interactive-flow'; 
        sopDisplay.appendChild(flowContainer);
        // Render the first step *inside* the container
        renderInvestmentFraudStep('start');
    }

    /**
     * Renders a step, appends it, and disables old buttons
     * @param {string} stepKey - The key of the step to render from the investmentFraudFlow object
     */
    function renderInvestmentFraudStep(stepKey) {
        
        // Find the container
        const flowContainer = document.getElementById('interactive-flow-container');
        if (!flowContainer) {
            console.error("Flow container not found. Resetting flow.");
            startInvestmentFraudFlow(); // This will recreate it
            return;
        }

        // Special case to reset the whole view
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

        // Disable all buttons in previous steps
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

        // Create a new element for this step
        const stepElement = document.createElement('div');
        stepElement.className = 'interactive-step';
        stepElement.innerHTML = `
            <div class="chatbot-message">${stepData.message}</div>
            ${optionsHtml}
        `;
        
        // Add a separator line if this isn't the first step
        if (stepKey !== 'start') {
            const separator = document.createElement('hr');
            separator.className = 'step-separator';
            flowContainer.appendChild(separator);
        }

        // Append the new step to the container
        flowContainer.appendChild(stepElement);
        
        // Auto-scroll the container to the bottom
        flowContainer.scrollTop = flowContainer.scrollHeight;
        
        // Add event listeners to the new buttons *only*
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

});
