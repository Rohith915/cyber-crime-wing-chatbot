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
      // ... (other steps for OTP fraud) ...
    ],
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
      // ... (other steps for SIM swap) ...
    ],
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
    title: "SOP for Investment Fraud (Interactive)",
    keywords: ["investment scam", "ponzi scheme", "pyramid scheme", "online trading fraud", "high returns"],
    registration: "FIR registration is required.",
    // This SOP uses the interactive flow, so 'steps' can be empty.
    steps: [], 
    summary: {},
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
       // ... (other steps for social media) ...
    ],
    summary: {},
    qa: {},
    definitions: {
        "url": "Uniform Resource Locator, it is the web address of a specific profile or page. It's crucial for identifying the exact fake profile.",
        "ip address": "Internet Protocol address. A unique numerical label assigned to each device connected to a computer network. IP logs are essential for tracing the location of the suspect."
    }
  },

  // --- NEW SOPS ADDED BELOW ---

  "upi fraud": {
    title: "SOP for UPI Fraud (Interactive)",
    keywords: ["upi", "phonepe", "google pay", "paytm", "wrong number"],
    registration: "FIR registration is required.",
    // This SOP uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
      "upi": "Unified Payments Interface, an instant real-time payment system developed by NPCI.",
      "kyc": "Know Your Customer. Process by which banks obtain customer identity and address.",
      "sdr": "Subscriber Detail Record. The identity and address documents submitted when getting a SIM card."
    }
  },

  "card fraud": {
    title: "SOP for ATM/Card Fraud (Interactive)",
    keywords: ["atm", "debit card", "credit card", "skimming", "cloning", "pos", "point of sale"],
    registration: "FIR registration is required.",
    // This SOP uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
      "skimming": "Theft of credit/debit card information using a small device to read the magnetic stripe.",
      "cctv": "Closed-Circuit Television, used for video surveillance.",
      "chargeback": "A procedure to dispute a transaction and reverse it, returning funds to the cardholder."
    }
  },

  "internet banking fraud": {
    title: "SOP for Internet Banking Fraud (Interactive)",
    keywords: ["internet banking", "phishing", "fake website", "vishing", "netbanking"],
    registration: "FIR registration is required.",
    // This SOP uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
      "phishing": "A fraudulent attempt to obtain sensitive information (usernames, passwords) by impersonating a trustworthy entity in an electronic communication.",
      "whois": "A query protocol used to find the owner of a domain name or an IP address block.",
      "isp": "Internet Service Provider. The company that provides internet access."
    }
  }, 

  "online financial fraud": {
    title: "SOP for Online Financial Fraud (Interactive)",
    keywords: ["online fraud", "financial fraud", "cyber fraud", "money lost online"],
    registration: "FIR registration is required.",
    // This SOP uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
      "modus operandi": "The particular way or method of doing something, especially one that is characteristic or well-established.",
      "triage": "The process of sorting priorities based on available information.",
      "65b certificate": "A certificate required under Section 65B of the Indian Evidence Act to prove the authenticity of electronic records in court."
    }
  }
};
