const sopData = {
  "otp fraud": {
    title: "SOP for Investigation of OTP Fraud",
    keywords: ["otp", "one time password", "vishing", "card kyc", "reward points"],
    registration: "FIR registration is required under relevant sections.",
    steps: [
      {
        step: 1,
        description: "Collect the victim's complaint, bank account statement showing the fraudulent transaction, and any relevant SMS or email.",
        evidenceChecklist: ["Victim's written complaint", "Bank account statement", "Screenshot of fraudulent messages"],
        coordination: ["Complainant"],
        legal: "Initial complaint recording as per Section 154 Cr.P.C. is the first step."
      },
      {
        step: 2,
        description: "Immediately send a legal notice to the concerned bank or merchant (e.g., Amazon, Flipkart, E-wallet provider) to freeze the account where the illegal transaction was made. This step is time-critical to prevent further fund movement.",
        evidenceChecklist: ["Copy of the notice sent to the bank/merchant", "Acknowledgement of receipt from the entity"],
        coordination: [],
        legal: "Issue notice under Section 91 Cr.P.C. to preserve evidence and prevent disposal of stolen funds."
      },
      {
        step: 3,
        description: "If the transaction was made via UPI, IMPS, NEFT, or RTGS, send a formal request to the victim's bank with the transaction ID to obtain the beneficiary's full account number and IFSC code.",
        evidenceChecklist: [],
        coordination: [],
        legal: "This action is part of evidence collection under the powers of investigation."
      },
      {
        step: 4,
        description: "Once the beneficiary account details are obtained, send a notice to the beneficiary's bank to freeze the account and request the Account Opening Form (AOF), KYC documents, and the full account statement from the date of opening.",
        evidenceChecklist: [],
        coordination: [],
        legal: "Request for documents is made under Section 91 Cr.P.C. and the Banker's Books Evidence Act, 1891."
      },
      {
        step: 5,
        description: "Request the Call Detail Records (CDR) and Subscriber Detail Record (SDR) for the mobile number linked to the fraudulent bank account.",
        evidenceChecklist: [],
        coordination: [],
        legal: "Request for CDR/SDR is made under Section 91/92 Cr.P.C."
      },
      {
        step: 6,
        description: "Analyze the beneficiary account statement for further transactions. If funds were moved to other accounts ('Layer 2'), repeat Step 4 for each new beneficiary. If funds were withdrawn from an ATM, request CCTV footage from the bank for the specific ATM ID and timestamp.",
        evidenceChecklist: [],
        coordination: [],
        legal: "Following the money trail is a crucial part of the investigation to identify all conspirators."
      },
      {
        step: 7,
        description: "Conduct a physical verification of the address provided in the KYC documents of the account holder and the mobile subscriber. Proceed with the arrest of the accused after complete verification.",
        evidenceChecklist: ["Field verification report", "Arrest memo"],
        coordination: [],
        legal: "Arrest and seizure of evidence (phones, documents) from the accused."
      }
    ],
    summary: {
      evidence: [],
      legalSections: []
    },
    qa: {
      "first step": "The first step is always to collect the victim's detailed complaint, bank statement showing the fraud, and any messages they received. This forms the basis of the FIR.",
      "stop the money": "To stop the money, you must immediately send a notice under Section 91 Cr.P.C. to the beneficiary bank or merchant to freeze the account. Time is critical.",
      "trace the accused": "Tracing the accused involves analyzing the money trail, getting Call Detail Records (CDR) for linked mobile numbers, and conducting physical verification of KYC addresses."
    },
    definitions: {
      "complaint": "A formal allegation against someone on the commission of an offense, made to a magistrate or police officer.",
      "fir": "First Information Report, a document prepared by police organizations when they receive information about the commission of a cognizable offense.",
      "section 91": "Section 91 of the Cr.P.C. is a legal tool that allows an investigating officer to summon any person to produce documents or evidence relevant to the case.",
      "cdr": "Call Detail Record. This is a data record produced by a telephone exchange documenting the details of a phone call, such as source and destination numbers, call duration, and timestamp.",
      "kyc": "Know Your Customer. It's a process by which banks obtain information about the identity and address of the customers. These documents (like Aadhaar, PAN card) are key evidence."
    }
  },
  "sim swap fraud": {
    title: "SOP for Investigation of SIM Swap Fraud",
    keywords: ["sim swap", "duplicate sim", "sim cloning", "no network"],
    registration: "FIR registration is required.",
    steps: [
      { step: 1, description: "Obtain a detailed complaint from the victim, including the exact time they lost network connectivity and details of unauthorized transactions.", evidenceChecklist: ["Victim's written complaint", "Bank statement"], coordination: ["Complainant"], legal: "Initial complaint recording as per Section 154 Cr.P.C." },
      { step: 2, description: "Advise the victim to immediately visit their mobile network store to obtain a new SIM card for the same number and to get a copy of the bill/receipt for the SIM change.", evidenceChecklist: [], coordination: [], legal: "This helps the victim regain control of their number and serves as evidence." },
      { step: 3, description: "Send a notice to the Mobile Nodal Officer of the service provider to provide all details related to the duplicate SIM issuance: name, address, phone number of the applicant, the 'SIM lost' request letter, address proof, and ID proof submitted by the fraudster.", evidenceChecklist: [], coordination: [], legal: "Notice issued under Section 91 Cr.P.C." },
      { step: 4, description: "Conduct an enquiry at the mobile network store where the swap was performed. Collect CCTV footage, verify the submitted documents, and interview the staff who attended to the fraudster.", evidenceChecklist: [], coordination: [], legal: "Collection of direct and circumstantial evidence." },
      { step: 5, description: "Simultaneously, trace the money trail. Request the beneficiary account statement, KYC, and AOF from the bank and issue a debit freeze on the account.", evidenceChecklist: [], coordination: [], legal: "Notice under Section 91 Cr.P.C. to freeze funds and gather evidence." },
      { step: 6, description: "If funds were withdrawn from an ATM, collect CCTV footage. If it was an online transaction, send a notice to the merchant for beneficiary details.", evidenceChecklist: [], coordination: [], legal: "Following all possible leads of the financial trail." },
      { step: 7, description: "Conduct physical verification of addresses obtained and arrest the accused. Seize all incriminating evidence.", evidenceChecklist: [], coordination: ["Local Police"], legal: "Arrest and seizure procedures." }
    ],
    summary: {
      evidence: [],
      legalSections: []
    },
    qa: {
        "what is sim swap": "SIM swap fraud is when a criminal obtains a duplicate SIM card for a victim's mobile number. This allows them to intercept OTPs and gain unauthorized access to bank accounts.",
        "victim do first": "Advise the victim to immediately contact their mobile service provider to block the old SIM and get a new one issued. This is the fastest way to regain control of their number.",
        "find the fraudster": "Start by sending a notice to the mobile operator for the documents submitted to get the duplicate SIM. Then, conduct an enquiry at the store where the swap occurred and collect CCTV footage."
    },
    definitions: {
        "otp": "One-Time Password, a password that is valid for only one login session or transaction.",
        "cctv": "Closed-Circuit Television, used for video surveillance. The footage is critical evidence for identifying a suspect at a store or ATM."
    }
  },
  "investment fraud": {
    title: "SOP for Investigation of Investment Fraud",
    keywords: ["investment scam", "ponzi scheme", "pyramid scheme", "online trading fraud", "high returns"],
    registration: "FIR registration is required. If the complaint is first lodged on NCRP, it should be converted to an FIR.",
    steps: [
        { step: 1, description: "Collect all details from the victim: fraudulent website/app URL, bank transaction details, phone numbers used by fraudsters (including WhatsApp), and all chat communications.", evidenceChecklist: ["Screenshots of website/app", "Bank statement", "Screenshots of chats"], coordination: ["Complainant"], legal: "Gathering preliminary evidence as per Section 154 Cr.P.C." },
        { step: 2, description: "For each fraudulent bank account identified, send an immediate request to the concerned bank to freeze the account and provide KYC, AOF, and a full account statement.", evidenceChecklist: [], coordination: ["All beneficiary banks"], legal: "Urgent action under Section 91 Cr.P.C. to secure the money trail." },
        { step: 3, description: "For each phone number used, request CDR and CAF from the respective Mobile Service Provider (MSP).", evidenceChecklist: [], coordination: [], legal: "Request under Section 91/92 Cr.P.C." },
        { step: 4, description: "For WhatsApp numbers, send a request through the Law Enforcement Response portal to obtain IP logs (creation IP, last seen IP) and device details.", evidenceChecklist: [], coordination: [], legal: "Formal request for data from an intermediary." },
        { step: 5, description: "For fraudulent websites, perform a WHOIS lookup to identify the domain registrar and hosting provider. Send notices to them to get registrant details, creation IP, and payment details.", evidenceChecklist: [], coordination: [], legal: "Notice under Section 91 Cr.P.C. to identify the website operator." },
        { step: 6, description: "For each IP address obtained (from WhatsApp, website logs, etc.), identify the Internet Service Provider (ISP) and send a notice to get the subscriber's details for that IP at the specific date and time (converted to IST).", evidenceChecklist: [], coordination: [], legal: "Notice under Section 91 Cr.P.C. to link an online activity to a physical person/location." },
        { step: 7, description: "Analyze all collected data (bank statements, CDRs, KYC) to identify the network of mule accounts and the individuals operating them. Conduct physical verification and proceed with arrests.", evidenceChecklist: ["Analysis chart linking accounts, numbers, and individuals", "Field verification reports"], coordination: [], legal: "Investigation to uncover conspiracy and identify all accused." }
    ],
    summary: { evidence: [], legalSections: [] },
    qa: {},
    definitions: {
        "whatsapp": "A popular messaging application. IP logs from WhatsApp can help identify the general location and ISP of the accused.",
        "whois": "A query and response protocol that is widely used for querying databases that store the registered users or assignees of an Internet resource, such as a domain name.",
        "isp": "Internet Service Provider. The company that provides internet access. A notice to the ISP can link an IP address to a specific customer's name and address."
    }
  },
  "social media impersonation": {
    title: "SOP for Social Media Impersonation/Fake Profile",
    keywords: ["facebook fake account", "instagram impersonation", "twitter fake profile", "defamation"],
    registration: "FIR registration is required if cognizable offenses like stalking, defamation, or extortion are involved.",
    steps: [
        { step: 1, description: "Preserve the evidence by taking screenshots of the fake profile/posts and copying the URL of the fake profile.", evidenceChecklist: ["Screenshots of the profile/posts", "URL of the profile"], coordination: ["Complainant"], legal: "Collection of primary digital evidence." },
        { step: 2, description: "Prepare a legal notice under Section 91 Cr.P.C. addressed to the respective social media platform (e.g., Meta Platforms, Inc. for Facebook/Instagram; Twitter, Inc.).", evidenceChecklist: ["Copy of the prepared notice"], coordination: [], legal: "Drafting legal process to be served on the intermediary." },
        { step: 3, description: "Send a scanned copy of the signed and sealed notice to the platform's law enforcement online portal from an official government email ID.", evidenceChecklist: [], coordination: [], legal: "Serving notice to the intermediary as per their prescribed process." },
        { step: 4, description: "If immediate content removal is required (e.g., obscene or sensitive material), also send a notice under Section 79(3)(b) of the IT Act.", evidenceChecklist: ["Copy of the content removal notice"], coordination: [], legal: "Utilizing provisions under the IT Act for content takedown." },
        { step: 5, description: "After receiving the IP logs from the social media platform, convert the timestamps from the provided time zone (usually UTC/PST) to IST.", evidenceChecklist: [], coordination: ["Online timezone converter tools"], legal: "Ensuring accurate timekeeping for evidence." },
        { step: 6, description: "Use a WHOIS service to identify the Internet Service Provider (ISP) for the IP addresses provided. Send a notice to the ISP with the IP address and the precise IST date/time to get the user's details (name, address, mobile number).", evidenceChecklist: [], coordination: [], legal: "Notice under Section 91 Cr.P.C. to de-anonymize the user." },
        { step: 7, description: "Based on the subscriber details received from the ISP, conduct physical verification and further investigation to identify and arrest the accused.", evidenceChecklist: [], coordination: ["Local Police"], legal: "Final stage of investigation leading to the accused." }
    ],
    summary: { evidence: [], legalSections: [] },
    qa: {},
    definitions: {
        "url": "Uniform Resource Locator, it is the web address of a specific profile or page. It's crucial for identifying the exact fake profile.",
        "ip address": "Internet Protocol address. A unique numerical label assigned to each device connected to a computer network. IP logs are essential for tracing the location of the suspect."
    }
  }
};