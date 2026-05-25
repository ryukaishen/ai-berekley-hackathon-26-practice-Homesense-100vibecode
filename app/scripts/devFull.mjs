import { spawn } from "node:child_process";

const procs = [];

const run = (name, command, args) => {
  const proc = spawn(command, args, {
    shell: true,
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

run("api", "node", ["backend/server.mjs"]);
run("web", "vite", ["--host", "0.0.0.0"]);
