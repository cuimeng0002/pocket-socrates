// Optimized proxy server for Alibaba Cloud API
// Design philosophy: Simple, reliable, and easy to debug
import http from 'http';
import https from 'https';

// Configuration constants (easy to modify later)
const PROXY_PORT = 4000;
const API_HOST = 'dashscope.aliyuncs.com';
const API_BASE_PATH = '';

console.log('=== Alibaba Cloud API Proxy Server ===');
console.log(`Proxy will run on http://localhost:${PROXY_PORT}`);
console.log(`Forwarding to: https://${API_HOST}${API_BASE_PATH}`);
console.log('====================================');

// Create the proxy server
const proxyServer = http.createServer(async (req, res) => {
  // Log incoming request details
  console.log(`[IN] ${req.method} ${req.url} - ${req.headers.origin || 'no-origin'}`);
  
  // 1. Handle CORS preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400' // Cache preflight response for 24 hours
    });
    console.log(`[OUT] OPTIONS ${req.url} - 200 (CORS preflight)`);
    return res.end();
  }
  
  // 2. Only handle /api requests
  if (!req.url.startsWith('/api')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    console.log(`[OUT] ${req.method} ${req.url} - 404 (Invalid path)`);
    return res.end(JSON.stringify({ error: 'Invalid API path' }));
  }
  
  // 3. Prepare proxy request options
  const targetPath = API_BASE_PATH + req.url.replace(/^\/api/, '');
  
  // Create headers object by copying original headers
  const proxyHeaders = {
    ...req.headers,
    host: API_HOST
  };
  
  // Remove content-length header to let Node.js handle it automatically
  // Use delete instead of setting to undefined, which is invalid
  delete proxyHeaders['content-length'];
  
  const proxyOptions = {
    hostname: API_HOST,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: proxyHeaders
  };
  
  // Log proxy target and headers for debugging
  console.log(`[PROXY] ${req.method} ${req.url} -> https://${API_HOST}${targetPath}`);
  console.log(`[PROXY] Headers:`, JSON.stringify(proxyHeaders, null, 2));
  
  try {
    // 4. Create HTTPS request to target server
    const proxyReq = https.request(proxyOptions, (proxyRes) => {
      // Set CORS headers for the response
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      
      // Copy status code and headers from target response
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Stream response body
      proxyRes.on('data', (chunk) => {
        res.write(chunk);
      });
      
      // End response when target response ends
      proxyRes.on('end', () => {
        console.log(`[OUT] ${req.method} ${req.url} - ${proxyRes.statusCode}`);
        res.end();
      });
      
      // Handle target response errors
      proxyRes.on('error', (err) => {
        console.error(`[ERROR] Target response error: ${err.message}`);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Target response error: ${err.message}` }));
        }
      });
    });
    
    // 5. Handle proxy request errors
    proxyReq.on('error', (err) => {
      console.error(`[ERROR] Proxy request failed: ${err.message}`);
      console.error(`[ERROR] Error stack: ${err.stack}`);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: `Proxy request failed: ${err.message}`,
          stack: err.stack,
          code: err.code
        }));
      }
    });
    
    // 6. Stream request body to target server
    req.on('data', (chunk) => {
      proxyReq.write(chunk);
    });
    
    // 7. End proxy request when original request ends
    req.on('end', () => {
      proxyReq.end();
    });
    
    // 8. Handle client connection abortion
    req.on('close', () => {
      proxyReq.destroy();
      console.log(`[ABORT] ${req.method} ${req.url} - Client closed connection`);
    });
    
  } catch (err) {
    console.error(`[ERROR] Unexpected error: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Unexpected error: ${err.message}` }));
    }
  }
});

// Start the proxy server
proxyServer.listen(PROXY_PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PROXY_PORT}`);
  console.log('Ready to forward API requests...');
});

// Handle server errors
proxyServer.on('error', (err) => {
  console.error(`[CRITICAL] Server error: ${err.message}`);
  process.exit(1);
});

// Handle process termination
try {
  process.on('SIGINT', () => {
    console.log('\nProxy server shutting down...');
    proxyServer.close(() => {
      console.log('Proxy server stopped');
      process.exit(0);
    });
  });
} catch (err) {
  // Ignore errors in process handlers
}
