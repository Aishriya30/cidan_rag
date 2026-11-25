// CIDAN Compliance RAG Assistant - Vercel Serverless Function
// High-performance grounded retrieval against CIDAN Regulatory Banking Knowledge Base

const REGULATORY_CHUNKS = [
  {
    chunk_id: "chunk_cb_lcr_01",
    document_name: "Central Bank Circular No. CB-2024-09",
    doc_id: "doc_cb_2024_09",
    doc_type: "Regulatory Circular",
    page_number: 2,
    section: "Section 2: Minimum Liquidity Coverage Ratio (LCR) Mandate",
    keywords: ["lcr", "liquidity coverage ratio", "105%", "108%", "hqla", "sovereign", "prudential", "circular", "cb-2024-09", "liquidity"],
    content: "Commercial banks shall maintain an ongoing Liquidity Coverage Ratio (LCR) of not less than 105% under standard market conditions, elevating the previous 100% threshold. The High-Quality Liquid Assets (HQLA) portfolio must comprise at least 70% Level 1 unencumbered sovereign securities. Daily monitoring is required. In the event of a variance where the LCR dips below 108%, immediate written notice must be submitted to the Banking Supervision Department within 24 hours.",
    facts: [
      "Minimum Liquidity Coverage Ratio (LCR) is 105% under standard conditions.",
      "At least 70% of HQLA portfolio must comprise Level 1 unencumbered sovereign securities.",
      "Immediate written notice to Banking Supervision Department is mandatory within 24 hours if LCR falls below 108%."
    ],
    suggestions: [
      "Update Asset-Liability Committee (ALCO) monitoring dashboards to trigger early-warning alerts at 108% LCR.",
      "Rebalance liquidity reserves to ensure sovereign debt holdings satisfy the 70% Level 1 HQLA threshold."
    ],
    human_verification: [
      "Confirm Treasury daily calculation methodology incorporates the 105% baseline.",
      "Ensure compliance officer sign-off on the 24-hour supervisor notification protocol."
    ],
    rule_proposals: [
      {
        rule_code: "DRAFT-LCR-105",
        proposed_action: "AMEND_THRESHOLD",
        target_policy: "POL-TREAS-04",
        summary: "Raise minimum policy LCR requirement from 100% to 105%, with automated escalation alert at 108%."
      }
    ]
  },
  {
    chunk_id: "chunk_cb_rto_02",
    document_name: "Central Bank Circular No. CB-2024-09",
    doc_id: "doc_cb_2024_09",
    doc_type: "Regulatory Circular",
    page_number: 3,
    section: "Section 4: Operational Resilience & Third-Party Cloud Standards",
    keywords: ["rto", "rpo", "recovery time", "recovery point", "cloud", "resilience", "failover", "downtime", "4 hours", "disaster recovery"],
    content: "Covered banks utilizing public or hybrid cloud infrastructure for critical transaction processing must guarantee a Recovery Time Objective (RTO) of less than 4 hours and a Recovery Point Objective (RPO) of zero for core ledger entries. Banks must execute live failover testing at least annually and maintain an auditable multi-cloud exit strategy.",
    facts: [
      "RTO for critical transaction processing cloud infrastructure must be strictly under 4 hours.",
      "RPO for core banking ledger entries is zero (zero data loss toleration).",
      "Live failover testing must be executed at least annually with documented multi-cloud exit strategy."
    ],
    suggestions: [
      "Audit cloud provider Service Level Agreements (SLAs) to verify 4-hour RTO commitment.",
      "Schedule annual live disaster recovery failover drill with independent audit verification."
    ],
    human_verification: [
      "Verify Multi-Cloud Exit Plan is reviewed and approved by Chief Information Security Officer (CISO).",
      "Confirm core ledger replication latency supports zero RPO."
    ],
    rule_proposals: [
      {
        rule_code: "DRAFT-OPS-RTO-04",
        proposed_action: "NEW_RULE",
        target_policy: "POL-IT-RESILIENCE",
        summary: "Mandate cloud failover verification under 4 hours and synchronous ledger mirroring for zero RPO."
      }
    ]
  },
  {
    chunk_id: "chunk_cb_nsfr_gov_03",
    document_name: "Central Bank Circular No. CB-2024-09",
    doc_id: "doc_cb_2024_09",
    doc_type: "Regulatory Circular",
    page_number: 4,
    section: "Section 5: Supervisory Reporting & Board Governance",
    keywords: ["cro", "governance", "board", "risk committee", "reporting", "nsfr", "penalties", "article 44", "deadlines", "december 31, 2024"],
    content: "All covered institutions must maintain a Net Stable Funding Ratio (NSFR) of at least 100% on an ongoing basis. The Chief Risk Officer (CRO) shall submit a monthly liquidity and operational risk dashboard directly to the Board Risk Committee. Bi-weekly stress test disclosures must be transmitted through the Central Regulatory Reporting Gateway. Failure to meet reporting timelines shall incur supervisory enforcement actions and financial penalties as stipulated in Banking Law Article 44. Effective Compliance Date: December 31, 2024.",
    facts: [
      "Net Stable Funding Ratio (NSFR) must be maintained at a minimum of 100% on an ongoing basis.",
      "CRO must submit a monthly liquidity and operational risk dashboard directly to Board Risk Committee.",
      "Bi-weekly stress test disclosures must be transmitted via Central Regulatory Reporting Gateway.",
      "Effective compliance enforcement date is December 31, 2024; non-compliance triggers Article 44 penalties."
    ],
    suggestions: [
      "Establish automated transmission pipeline to Central Regulatory Reporting Gateway for bi-weekly stress tests.",
      "Ensure NSFR calculation models are calibrated for long-term weighted asset commitments."
    ],
    human_verification: [
      "Review monthly CRO Board Risk Committee agenda to confirm liquidity dashboard inclusion.",
      "Verify legal liability assessment under Banking Law Article 44."
    ],
    rule_proposals: []
  },
  {
    chunk_id: "chunk_rbi_cyber_04",
    document_name: "RBI Master Direction on IT Framework & Cyber Security Controls",
    doc_id: "doc_rbi_it_2024",
    doc_type: "Regulatory Circular",
    page_number: 8,
    section: "Section 1 & 2: Data Localization, Encryption & Access Security",
    keywords: ["rbi", "cyber security", "data localization", "sovereignty", "encryption", "aes-256", "mfa", "audit log", "pii", "domestic", "retention"],
    content: "All customer Personal Identifiable Information (PII), account ledgers, biometric hashes, and transaction trails originating within domestic territory must reside solely on domestic cloud server regions. Cross-border exfiltration without prior written regulatory exemption is strictly prohibited. All customer PII and sensitive data at rest must be encrypted using AES-256 GCM or higher. Multi-Factor Authentication (MFA) is strictly mandatory for all administrative and core banking database access sessions. Banks must maintain tamper-evident, cryptographically signed audit logs for a minimum of 5 years.",
    facts: [
      "Complete domestic data residency mandated: all customer PII and transaction records must reside on domestic servers.",
      "AES-256 GCM encryption required at rest for all customer PII, account data, and authorization credentials.",
      "Multi-Factor Authentication (MFA) strictly mandatory for all administrative and database access.",
      "Tamper-evident, cryptographically signed audit logs must be archived for a minimum period of 5 years."
    ],
    suggestions: [
      "Conduct ingress/egress firewall audit to verify zero unapproved international data transmissions.",
      "Verify database encryption keys are managed through FIPS 140-2 Level 3 compliant Hardware Security Modules (HSM)."
    ],
    human_verification: [
      "Obtain annual external auditor certification for domestic data residency compliance.",
      "Validate cryptographic log signing keys against authorized PKI infrastructure."
    ],
    rule_proposals: [
      {
        rule_code: "RULE-DATA-001",
        proposed_action: "ENFORCE_ACTIVE",
        target_policy: "BANK-DATA-SOVEREIGNTY",
        summary: "Cross-Border Customer PII Data Sovereignty & GDPR Shield: Domestic storage and AES-256 GCM encryption."
      }
    ]
  },
  {
    chunk_id: "chunk_rbi_penalties_05",
    document_name: "RBI Master Direction on IT Framework & Cyber Security Controls",
    doc_id: "doc_rbi_it_2024",
    doc_type: "Regulatory Circular",
    page_number: 14,
    section: "Section 4: Statutory Enforcement, Section 35A & Section 47A Penalties",
    keywords: ["section 35a", "section 47a", "penalties", "fine", "banking regulation act", "punish", "liability", "1 crore", "10 million", "statutory", "legal"],
    content: "Non-compliance or failure to implement mandated technology and cyber security controls triggers enforcement actions under Section 46 and Section 47A(1)(c) of the Banking Regulation Act, 1949. Statutory monetary penalties reach up to INR 1 Crore (INR 10 Million) per default, plus recurring fines of INR 100,000 per day of persisting default. Section 35A empowers the Reserve Bank to issue binding operational directives in the public interest.",
    facts: [
      "Statutory penalties under Section 47A(1)(c) reach up to INR 1 Crore (INR 10,000,000) per default.",
      "Continuing defaults incur statutory recurring fines of INR 100,000 per day.",
      "Section 35A empowers the Central Bank to issue legally binding directives and take supervisory control in depositor interest."
    ],
    suggestions: [
      "Brief the Board Risk Management Committee on the potential financial exposure under Section 47A.",
      "Implement real-time continuous compliance telemetry to prevent persisting default accrual."
    ],
    human_verification: [
      "Legal Counsel review of supervisory audit findings within 14 calendar days.",
      "Confirm board risk register reflects statutory compounding limits."
    ],
    rule_proposals: []
  },
  {
    chunk_id: "chunk_rbi_kyc_aml_06",
    document_name: "RBI Master Direction - Know Your Customer (KYC) Direction, 2016 (Updated 2024)",
    doc_id: "doc_rbi_kyc_2024",
    doc_type: "Regulatory Circular",
    page_number: 6,
    section: "Chapter IV: Customer Identification, EDD, and AML Reporting Obligations",
    keywords: ["kyc", "aml", "anti-money laundering", "str", "ctr", "fiu-ind", "edd", "pep", "beneficial ownership", "1,000,000", "7 days", "reporting"],
    content: "Mandatory Customer Identification Procedure (CIP) requires PAN verification and CKYCR registry synchronization. Enhanced Due Diligence (EDD) is mandated for Politically Exposed Persons (PEPs) and cross-border remittances exceeding INR 500,000. Suspicious Transaction Reports (STR) must be filed electronically with FIU-IND within 7 working days of determination. Cash Transaction Reports (CTR) must be filed for cash transactions aggregating INR 1,000,000 ($10,000) or more within 24 hours. Periodic KYC updation: High-risk accounts every 2 years; Medium-risk every 8 years; Low-risk every 10 years.",
    facts: [
      "Suspicious Transaction Reports (STR) must be transmitted to FIU-IND within 7 working days of determination.",
      "Cash Transaction Reports (CTR) are mandatory for transactions aggregating INR 1,000,000 ($10,000) or more in 24 hours.",
      "Enhanced Due Diligence (EDD) is required for PEPs and remittances exceeding INR 500,000.",
      "Periodic re-KYC cadence: High risk = 2 years, Medium risk = 8 years, Low risk = 10 years."
    ],
    suggestions: [
      "Configure automated alerting for aggregate cash flows exceeding INR 1,000,000 in a 24-hour cycle.",
      "Automate FIU-IND electronic batch transmission for verified STR alerts."
    ],
    human_verification: [
      "Principal Officer sign-off on all STR submissions prior to FIU-IND transmission.",
      "Audit beneficial ownership records where shareholding exceeds 25%."
    ],
    rule_proposals: [
      {
        rule_code: "RULE-AML-001",
        proposed_action: "ENFORCE_ACTIVE",
        target_policy: "BANK-AML-POLICY",
        summary: "Automatic CTR filing within 7 banking days for transactions exceeding INR 1,000,000 in 24 hours."
      },
      {
        rule_code: "RULE-KYC-002",
        proposed_action: "ENFORCE_ACTIVE",
        target_policy: "BANK-KYC-POLICY",
        summary: "Mandatory screening of beneficial owners with >=25% equity against international PEP watchlists."
      }
    ]
  },
  {
    chunk_id: "chunk_cidan_db_rules_07",
    document_name: "CIDAN Enterprise Bank Rules Catalog (Live Gateway)",
    doc_id: "doc_cidan_rules_catalog",
    doc_type: "Internal Bank Policy",
    page_number: 1,
    section: "Active Compliance Rules Deployed on Database Gateways",
    keywords: ["rules", "mongodb", "cluster0", "rule-data-001", "rule-aml-001", "rule-kyc-002", "rule-sanction-003", "rule-lend-004", "redis", "postgres", "mysql"],
    content: "Enterprise banking compliance rules active in MongoDB Atlas (cluster0.xolwost.mongodb.net / compliance_rules): [RULE-DATA-001] Cross-Border Customer PII Data Sovereignty & GDPR Shield: AES-256 encryption at rest; strict domestic boundary enforcement. [RULE-AML-001] CTR Filing Threshold: Cash transactions > INR 1,000,000 trigger automated filing. [RULE-KYC-002] Beneficial Ownership: >=25% equity PEP screening with 24-month re-KYC. [RULE-SANCTION-003] Real-Time Wire Sanctions: Mandatory pre-settlement screening against OFAC/UN/FIU lists for SWIFT/ISO 20022 wire messages. [RULE-LEND-004] Commercial Real Estate LTV Cap: Maximum statutory 75% LTV ceiling.",
    facts: [
      "RULE-DATA-001 is active in MongoDB Atlas collection cidan_bank.compliance_rules.",
      "RULE-AML-001 enforces automatic CTR creation for cash transactions > INR 1,000,000.",
      "RULE-SANCTION-003 requires real-time OFAC and UN screening for all SWIFT and ISO 20022 wires prior to settlement.",
      "RULE-LEND-004 limits commercial real estate loans to a strict 75% LTV ceiling."
    ],
    suggestions: [
      "Verify MongoDB Atlas collection connection status using CIDAN live backend link.",
      "Ensure real-time wire sanction filtering service has latency under 120ms to prevent settlement delays."
    ],
    human_verification: [
      "Credit Committee approval required for any exception exceeding the 75% LTV limit.",
      "AML Compliance Officer verification of daily sanctions match queue."
    ],
    rule_proposals: []
  },
  {
    chunk_id: "chunk_policy_pol_treas_08",
    document_name: "Internal Bank Policy: POL-TREAS-04",
    doc_id: "doc_pol_treas_04",
    doc_type: "Internal Bank Policy",
    page_number: 2,
    section: "Section 2 & 3: Liquidity Buffer Targets & Escalation Thresholds",
    keywords: ["pol-treas-04", "treasury", "100%", "102%", "escalation", "gap", "difference", "policy", "alco"],
    content: "Under current internal bank guidelines (v3.8), Treasury Department is mandated to hold a minimum Liquidity Coverage Ratio of 100% of net cash outflows over a 30-day liquidity stress horizon. Surplus liquidity is held in central bank reserves and eligible government treasury bills. If the bank's projected LCR falls below 102%, the Treasurer must notify the Chief Financial Officer and convene an extraordinary ALCO review session within three business days.",
    facts: [
      "Internal policy POL-TREAS-04 currently sets a baseline LCR threshold of 100%.",
      "Internal escalation alert triggers if projected LCR dips below 102%, requiring extraordinary ALCO review in 3 business days.",
      "Direct Compliance Gap: Central Bank Circular CB-2024-09 mandates a higher 105% LCR with notification at 108%."
    ],
    suggestions: [
      "Draft policy redline for POL-TREAS-04 to raise baseline LCR from 100% to 105%.",
      "Update Treasury management system alert triggers to 108% as required by circular."
    ],
    human_verification: [
      "Board Risk Committee approval required to adopt updated POL-TREAS-04 version 4.0.",
      "CFO and Treasurer formal sign-off on revised ALCO escalation matrix."
    ],
    rule_proposals: [
      {
        rule_code: "DRAFT-AMEND-TREAS-04",
        proposed_action: "AMEND_THRESHOLD",
        target_policy: "POL-TREAS-04",
        summary: "Increase internal bank LCR target from 100% to 105% and align escalation threshold to 108%."
      }
    ]
  }
];

function scoreChunkRelevance(query, chunk) {
  const q = query.toLowerCase();
  const qWords = q.split(/\W+/).filter(w => w.length > 2);
  if (qWords.length === 0) return 0.0;

  let score = 0.0;
  const chunkText = (chunk.content + " " + chunk.section + " " + chunk.document_name).toLowerCase();
  const keywords = chunk.keywords || [];

  // 1. Keyword direct hit
  for (const kw of keywords) {
    if (q.includes(kw.toLowerCase())) {
      score += 0.35;
    }
  }

  // 2. Word matches in chunk content
  let wordMatches = 0;
  for (const w of qWords) {
    if (chunkText.includes(w)) {
      wordMatches++;
    }
  }
  score += (wordMatches / qWords.length) * 0.50;

  // 3. Exact phrase match bonus
  if (q.length > 8 && chunkText.includes(q)) {
    score += 0.40;
  }

  return Math.min(1.0, score);
}

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: "Method Not Allowed. Use POST." });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const query = (body.message || body.query || "").trim();
    const topK = Math.max(1, Math.min(6, parseInt(body.top_k) || 4));
    const conversationId = body.conversation_id || ("conv_" + Date.now());

    if (!query) {
      return res.status(400).json({ detail: "User query message cannot be empty." });
    }

    // Rank candidate chunks
    const scoredChunks = REGULATORY_CHUNKS.map(chunk => ({
      chunk,
      score: scoreChunkRelevance(query, chunk)
    })).sort((a, b) => b.score - a.score);

    const SIMILARITY_THRESHOLD = 0.22;
    const matching = scoredChunks.filter(sc => sc.score >= SIMILARITY_THRESHOLD).slice(0, topK);

    // Guardrail: Enforce Insufficient Evidence if below threshold
    if (matching.length === 0) {
      const fallbackText = "I couldn't find sufficient information in the indexed regulatory documents to answer this question confidently.";
      return res.status(200).json({
        answer: fallbackText,
        summary: fallbackText,
        facts: [],
        suggestions: [
          "Ask about Central Bank Circular CB-2024-09 (LCR, NSFR, or cloud RTO standards).",
          "Ask about RBI Master Direction IT security framework (data residency, AES-256 encryption, MFA, Section 35A/47A).",
          "Ask about RBI KYC/AML directives (STR filing with FIU-IND, CTR thresholds, EDD).",
          "Query live MongoDB compliance rules (RULE-DATA-001, RULE-AML-001, RULE-SANCTION-003)."
        ],
        human_verification: [
          "Check if the required regulatory circular has been officially gazetted by the supervisory authority.",
          "Consult the Compliance Register to verify if the bank holds an unindexed copy."
        ],
        citations: [],
        rule_proposals: [],
        evidence_found: false,
        model_used: "CIDAN Grounded Compliance Core (Vercel Serverless RAG)",
        is_fallback: true,
        conversation_id: conversationId
      });
    }

    // Synthesize Grounded Compliance Response
    const primary = matching[0].chunk;
    const citations = matching.map(m => ({
      document_name: m.chunk.document_name,
      doc_id: m.chunk.doc_id,
      doc_type: m.chunk.doc_type,
      page_number: m.chunk.page_number,
      chunk_id: m.chunk.chunk_id,
      excerpt: m.chunk.content.length > 280 ? m.chunk.content.substring(0, 277) + "..." : m.chunk.content,
      similarity_score: Math.round(m.score * 10000) / 10000
    }));

    const aggregatedFacts = [];
    const aggregatedSuggestions = [];
    const aggregatedVerification = [];
    const aggregatedProposals = [];

    for (const m of matching) {
      if (m.chunk.facts) aggregatedFacts.push(...m.chunk.facts);
      if (m.chunk.suggestions) aggregatedSuggestions.push(...m.chunk.suggestions);
      if (m.chunk.human_verification) aggregatedVerification.push(...m.chunk.human_verification);
      if (m.chunk.rule_proposals) aggregatedProposals.push(...m.chunk.rule_proposals);
    }

    // Build formatted answer with clear sectioning
    let answerText = `### 📋 Grounded Regulatory Compliance Analysis\n\n`;
    answerText += `Based on verified evidence from **${primary.document_name}** (${primary.section}):\n\n`;

    // 1. Key Verbatim Factual Requirements
    answerText += `**Mandatory Compliance Obligations**:\n`;
    const uniqueFacts = Array.from(new Set(aggregatedFacts)).slice(0, 4);
    for (const fact of uniqueFacts) {
      answerText += `• ${fact}\n`;
    }
    answerText += `\n`;

    // 2. Statutory / Operational Context
    answerText += `**Operational & Technical Directives**:\n`;
    answerText += `${primary.content}\n\n`;

    // 3. Traceable Citation Line
    answerText += `Source: *${primary.document_name}*, Page ${primary.page_number} (Relevance: ${(matching[0].score * 100).toFixed(1)}%).`;

    const summaryText = uniqueFacts.length > 0
      ? uniqueFacts[0]
      : primary.content.substring(0, 160) + "...";

    return res.status(200).json({
      answer: answerText,
      summary: summaryText,
      facts: uniqueFacts,
      suggestions: Array.from(new Set(aggregatedSuggestions)).slice(0, 3),
      human_verification: Array.from(new Set(aggregatedVerification)).slice(0, 2),
      citations: citations,
      rule_proposals: aggregatedProposals.slice(0, 2),
      evidence_found: true,
      model_used: "CIDAN Grounded Compliance Core (Vercel Serverless RAG)",
      is_fallback: false,
      conversation_id: conversationId
    });

  } catch (error) {
    console.error("CIDAN RAG Error:", error);
    return res.status(500).json({
      detail: "Internal error processing compliance RAG query: " + (error.message || String(error))
    });
  }
}
