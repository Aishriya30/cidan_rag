export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'healthy',
    project: 'CIDAN Compliance Assistant',
    version: '1.0.0',
    rag_engine: 'online',
    indexed_documents_count: 4,
    vector_store: 'ready',
    timestamp: new Date().toISOString()
  });
}
