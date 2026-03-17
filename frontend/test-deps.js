const fs = require('fs');
const execSync = require('child_process').execSync;
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
for (const dep in deps) {
  try {
    execSync(`npm info ${dep}`, { stdio: 'ignore' });
  } catch (e) {
    console.log(`Failed: ${dep}`);
  }
}
console.log("Done checking packages.");
