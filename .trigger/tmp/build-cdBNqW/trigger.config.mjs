import {
  defineConfig
} from "./chunk-72SX6VFG.mjs";
import "./chunk-MHA6LPVL.mjs";
import {
  init_esm
} from "./chunk-UPGKC4T6.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  // Set in .env.local
  project: process.env.TRIGGER_PROJECT_REF,
  runtime: "node",
  dirs: ["trigger"],
  // 5 minutes default max duration per task run
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
