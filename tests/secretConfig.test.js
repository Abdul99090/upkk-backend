const fs = require('fs');
const path = require('path');

test('repository does not publish concrete admin credentials', () => {
  const repoRoot = path.join(__dirname, '..');
  const envExample = fs.readFileSync(path.join(repoRoot, '.env.example'), 'utf8');
  const seedScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'seed.js'), 'utf8');

  expect(envExample).not.toMatch(/KenzieKenzoe/i);
  expect(envExample).not.toMatch(/koplak99/i);
  expect(seedScript).not.toMatch(/KenzieKenzoe/i);
  expect(seedScript).not.toMatch(/koplak99/i);
});
