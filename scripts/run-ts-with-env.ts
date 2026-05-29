import { spawnSync } from "child_process";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";

loadProjectEnv();
applyDatabaseUrlToEnv();

const script = process.argv[2];
if (!script) {
  console.error("Usage: tsx scripts/run-ts-with-env.ts <script.ts> [args...]");
  process.exit(1);
}

const result = spawnSync("tsx", [script, ...process.argv.slice(3)], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
