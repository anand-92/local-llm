const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

/**
 * CORS Proxy for LM Studio
 * Forwards all requests to LM Studio and adds CORS headers
 */
app.all('/v1/*', async (req, res) => {
  const targetUrl = `${LM_STUDIO_URL}${req.path}`;
  
  console.log(`[PROXY] ${req.method} ${req.path} -> ${targetUrl}`);
  
  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    
    // Handle streaming responses
    if (response.headers.get('content-type')?.includes('text/event-stream') || 
        response.headers.get('content-type')?.includes('stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Pipe the stream
      response.body.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
        abort(err) {
          console.error('[PROXY] Stream error:', err);
          res.end();
        }
      }));
    } else {
      // Handle regular responses
      const data = await response.text();
      res.status(response.status);
      
      // Copy content-type header
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      res.send(data);
    }
  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to connect to LM Studio. Make sure it\'s running on port 1234.',
      details: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', lmStudioUrl: LM_STUDIO_URL });
});

app.listen(PORT, () => {
  console.log('🚀 CORS Proxy Server running');
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🎯 Proxying to: ${LM_STUDIO_URL}`);
  console.log('');
  console.log('Now tunnel THIS server instead of LM Studio directly!');
});

