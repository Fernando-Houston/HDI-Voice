// API Proxy to bypass CORS issues
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { endpoint, ...body } = req.body;

  try {
    console.log('Proxying request to:', `https://hdi-api-production.up.railway.app${endpoint}`);
    
    const response = await fetch(`https://hdi-api-production.up.railway.app${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any required headers here
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('HDI API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request', 
      message: error.message 
    });
  }
}