#!/usr/bin/env node

const { execSync } = require('node:child_process');

function run(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function freePort(port) {
  const pidText = run(`lsof -ti:${port} -sTCP:LISTEN || true`);
  const pids = pidText
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);

  if (pids.length === 0) {
    console.log(`[free-port] Port ${port} is already free.`);
    return;
  }

  console.log(`[free-port] Releasing port ${port} from PID(s): ${pids.join(', ')}`);

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGTERM');
    } catch {
      // Ignore dead/missing process races.
    }
  }

  sleep(250);

  const remaining = run(`lsof -ti:${port} -sTCP:LISTEN || true`)
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);

  for (const pid of remaining) {
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch {
      // Ignore dead/missing process races.
    }
  }

  console.log(`[free-port] Port ${port} is now free.`);
}

const portArg = process.argv[2] ?? '3000';
const port = Number(portArg);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`[free-port] Invalid port: ${portArg}`);
  process.exit(1);
}

try {
  freePort(port);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[free-port] Failed to release port ${port}: ${message}`);
  process.exit(1);
}
