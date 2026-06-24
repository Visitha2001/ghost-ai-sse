import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF!, // Set in .env.local
  runtime: 'node',
  dirs: ["trigger"],
  maxDuration: 300, // 5 minutes default max duration per task run
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
});
