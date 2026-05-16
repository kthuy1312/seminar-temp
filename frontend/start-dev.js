process.title = "FRONTEND NEXTJS";

console.log(`
==================================================
🌐 FRONTEND NEXTJS RUNNING
URL: http://localhost:3100
API GATEWAY: http://localhost:3000
==================================================
`);

const { spawn } = require('child_process');

const child = spawn('npx', ['next', 'dev', '--port', '3100'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      process.stdout.write(`[FRONTEND] ${line}\n`);
    }
  }
});

child.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      process.stderr.write(`[FRONTEND] ${line}\n`);
    }
  }
});

child.on('close', (code) => {
  process.exit(code);
});
