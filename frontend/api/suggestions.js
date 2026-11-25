export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json([
    "Summarize RBI Master Direction on IT Framework & Cyber Security",
    "What are the KYC/AML STR and CTR reporting deadlines and thresholds?",
    "Verify MongoDB RULE-DATA-001 cross-border PII sovereignty mandate",
    "Explain Liquidity Coverage Ratio (LCR) and 108% escalation protocol",
    "What are the Section 35A / 47A banking non-compliance penalties?"
  ]);
}
