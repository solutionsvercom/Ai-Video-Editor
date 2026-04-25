/**
 * Frees a TCP port by killing any listening processes.
 *
 * Usage:
 *   node scripts/free-port.js 5000
 *   PORT=5001 node scripts/free-port.js
 */

const { execSync } = require("child_process");

const port = Number(process.argv[2] || process.env.PORT || 5000);
if (!Number.isFinite(port) || port <= 0) process.exit(0);

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch (e) {
    return "";
  }
}

function unique(arr) {
  return [...new Set(arr)];
}

function getPidsWindows(p) {
  const out = tryExec(`netstat -ano | findstr :${p}`);
  return unique(
    out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /\sLISTENING\s/i.test(line))
      .map((line) => line.split(/\s+/).pop())
      .filter(Boolean)
      .map((pid) => Number(pid))
      .filter((pid) => Number.isFinite(pid) && pid > 0)
  );
}

function getPidsUnix(p) {
  // lsof may not exist everywhere; best-effort.
  const out = tryExec(`lsof -ti tcp:${p} -sTCP:LISTEN`);
  return unique(
    out
      .split(/\r?\n/)
      .map((x) => Number(x.trim()))
      .filter((pid) => Number.isFinite(pid) && pid > 0)
  );
}

function killPidWindows(pid) {
  tryExec(`taskkill /PID ${pid} /T /F`);
}

function killPidUnix(pid) {
  tryExec(`kill -9 ${pid}`);
}

const isWin = process.platform === "win32";
const pids = isWin ? getPidsWindows(port) : getPidsUnix(port);

for (const pid of pids) {
  if (pid === process.pid) continue;
  if (isWin) killPidWindows(pid);
  else killPidUnix(pid);
}

