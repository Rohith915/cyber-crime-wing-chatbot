const sopData = {
  // --- Interactive Guided Investigations ---

  "investment fraud": {
    title: "Guided Investigation for Investment Fraud",
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

  "upi fraud": {
    title: "Guided Investigation for UPI Fraud",
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
    title: "Guided Investigation for ATM/Card Fraud",
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
    title: "Guided Investigation for Internet Banking Fraud",
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
    title: "Guided Investigation for Online Financial Fraud",
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
  },

  // --- Standard Investigative Protocols ---

// --- Standard Investigative Protocols (NOW INTERACTIVE) ---

  "otp fraud": {
    title: "Guided Investigation for OTP Fraud",
    keywords: ["otp", "one time password", "vishing", "card kyc", "reward points"],
    registration: "FIR registration is required under relevant sections.",
    // This SOP now uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
      "complaint": "A formal allegation against someone on the commission of an offense, made to a magistrate or police officer.",
      "fir": "First Information Report, a document prepared by police organizations when they receive information about the commission of a cognizable offense.",
      "section 91": "Section 91 of the Cr.P.C. is a legal tool that allows an investigating officer to summon any person to produce documents or evidence relevant to the case.",
      "cdr": "Call Detail Record. This is a data record produced by a telephone exchange documenting the details of a phone call, such as source and destination numbers, call duration, and timestamp.",
      "kyc": "Know Your Customer. It's a process by which banks obtain information about the identity and address of the customers. These documents (like Aadhaar, PAN card) are key evidence."
    }
  },

  "sim swap fraud": {
    title: "Guided Investigation for SIM Swap Fraud",
    keywords: ["sim swap", "duplicate sim", "sim cloning", "no network"],
    registration: "FIR registration is required.",
    // This SOP now uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
        "otp": "One-Time Password, a password that is valid for only one login session or transaction.",
        "cctv": "Closed-Circuit Television, used for video surveillance. The footage is critical evidence for identifying a suspect at a store or ATM.",
        "sdr": "Subscriber Detail Record. The identity and address documents submitted when getting a SIM card."
    }
  },

  "social media impersonation": {
    title: "Guided Investigation for Social Media Impersonation",
    keywords: ["facebook fake account", "instagram impersonation", "twitter fake profile", "defamation", "stalking", "extortion"],
    registration: "FIR registration is required if cognizable offenses like stalking, defamation, or extortion are involved.",
    // This SOP now uses the interactive flow
    steps: [],
    summary: {},
    qa: {},
    definitions: {
        "url": "Uniform ResourceLocator, it is the web address of a specific profile or page. It's crucial for identifying the exact fake profile.",
        "ip address": "Internet Protocol address. A unique numerical label assigned to each device connected to a computer network. IP logs are essential for tracing the location of the suspect.",
        "sec 66c": "Section 66C of the IT Act, for Identity Theft.",
        "sec 67": "Section 67 of the IT Act, for publishing or transmitting obscene material.",
        "sec 500 ipc": "Section 500 of the IPC, for Defamation.",
        "sec 354d ipc": "Section 354D of the IPC, for Stalking."
    }
  }
};
