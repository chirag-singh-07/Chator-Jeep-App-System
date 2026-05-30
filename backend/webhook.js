const http = require('http');
const { exec } = require('child_process');

const PORT = process.env.PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/deploy') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            res.end('OK');
            exec('bash ~/Chator-Jeep-App-System/backend/deploy.sh', (err, stdout, stderr) => {
                console.log(stdout || stderr);
            });
        });
    } else {
        res.end('Not found');
    }
});

server.listen(PORT, () => console.log(`Webhook listening on port ${PORT}`));