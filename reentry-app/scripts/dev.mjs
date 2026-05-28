import { spawn } from "node:child_process";

const tasks = [
  { name: "api", args: ["run", "dev:api"] },
  { name: "web", args: ["run", "dev:web"] }
];

const children = [];
let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
  setTimeout(() => process.exit(0), 120);
};

for (const task of tasks) {
  const child = spawn("npm", task.args, {
    cwd: process.cwd(),
    shell: true,
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    if (code && !shuttingDown) {
      console.error(`[${task.name}] exited with code ${code}`);
      shutdown("SIGTERM");
      process.exit(code);
    }
  });

  children.push(child);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

