const { execSync } = require('child_process');
try {
  const output = execSync('node node_modules/typescript/bin/tsc -b', {
    cwd: 'C:/work/moon',
    encoding: 'utf8',
    timeout: 60000,
    stdio: 'pipe'
  });
  console.log('Success:', output);
} catch (e) {
  console.log('Error output:', e.stderr || e.stdout || e.message);
}
