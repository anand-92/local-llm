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
    console.log(`[localtunnel] URL: ${url}`);
    console.log('[localtunnel] Keep this process running to keep the tunnel alive.');
  } catch (e) {
    console.error('Failed to write tunnel URL:', e);
  }

  process.on('SIGINT', () => {
    console.log('\n[localtunnel] closing');
    tunnel.close();
    process.exit(0);
  });
})();
