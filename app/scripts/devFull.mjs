import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const procs = [];
const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(scriptDir, "..");
const viteBin = join(appDir, "node_modules", "vite", "bin", "vite.js");

const run = (name, command, args) => {
  const proc = spawn(command, args, {
    cwd: appDir,
    shell: false,
    stdio: "inherit",
    env: process.env,
  });

  proc.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });

  procs.push(proc);
};

const shutdown = (code = 0) => {
  procs.forEach((proc) => {
    if (!proc.killed) {
      proc.kill();
    }
  });
  process.exit(code);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("api", process.execPath, ["backend/server.mjs"]);
run("web", process.execPath, [viteBin, "--host", "0.0.0.0"]);
