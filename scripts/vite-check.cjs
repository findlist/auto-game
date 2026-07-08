const { execSync } = require('child_process');
try {
  const output = execSync('node node_modules/vite/bin/vite.js build', {
    cwd: 'C:/work/moon',
    encoding: 'utf8',
    timeout: 120000,
    stdio: 'pipe'
  });
  console.log('Build success:', output);
} catch (e) {
  console.log('Build error:', e.stderr || e.stdout || e.message);
}
