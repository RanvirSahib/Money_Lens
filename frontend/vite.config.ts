// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Strip any env-var keys that contain spaces or other invalid JS identifier characters
// before Vite processes them. This prevents [INVALID_DEFINE_CONFIG] errors caused by
// keys like "VITE_ API_BASE_URL" (note the stray space) set in CI/CD consoles.
const rawEnv = process.env as Record<string, string | undefined>;
for (const key of Object.keys(rawEnv)) {
  if (key.startsWith("VITE_") && !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    delete rawEnv[key];
  }
}

export default defineConfig({
  envDefine: false,
  vite: {
    // Override define to an empty map so no invalid identifier can reach rolldown.
    // VITE_* variables are still accessible at runtime via import.meta.env (Vite's
    // built-in env replacement reads from .env files and the sanitised process.env).
    define: {},
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
