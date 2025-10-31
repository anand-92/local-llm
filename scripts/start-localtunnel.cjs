const fs = require('fs');
const path = require('path');
const localtunnel = require('localtunnel');

(async () => {
  const port = Number(process.env.LM_STUDIO_PORT || 1234);
  const tunnel = await localtunnel({ port, host: 'https://localtunnel.me' });
  const url = tunnel.url;
  const outFile = path.join(process.cwd(), '.tunnel-url');
  
  try {
    fs.writeFileSync(outFile, url, 'utf8');
    console.log('\n========================================');
    console.log('🚇 Localtunnel Active');
    console.log('========================================');
    console.log(`URL: ${url}`);
    
    // Show password if available (used for IP verification)
    if (tunnel.password) {
      console.log(`\n⚠️  PASSWORD REQUIRED: ${tunnel.password}`);
      console.log('👉 Visit the URL above and enter this password');
    }
    
    console.log('\n💡 Keep this process running to keep the tunnel alive.');
    console.log('========================================\n');
  } catch (e) {
    console.error('Failed to write tunnel URL:', e);
  }

  // Handle tunnel close event
  tunnel.on('close', () => {
    console.log('[localtunnel] Tunnel closed');
  });

  // Handle errors
  tunnel.on('error', (err) => {
    console.error('[localtunnel] Error:', err);
  });

  process.on('SIGINT', () => {
    console.log('\n[localtunnel] Shutting down...');
    tunnel.close();
    process.exit(0);
  });
})();
