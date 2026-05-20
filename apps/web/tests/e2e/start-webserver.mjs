import { spawn } from "node:child_process";

const args = ["run", "dev", "--", "--webpack", "--hostname", "127.0.0.1", "--port", "3100"];
const child = spawn(process.platform === "win32" ? `bun ${args.join(" ")}` : "bun", process.platform === "win32" ? [] : args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    RECETTE_USE_FIXTURES: "1",
    DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/rrb",
    BETTER_AUTH_SECRET: "test-secret-for-recette-0123456789abcdef",
    BETTER_AUTH_URL: "http://127.0.0.1:3100",
  },
  stdio: "inherit",
  shell: process.platform === "win32",
});

function shutdown(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
