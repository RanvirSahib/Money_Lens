import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const urlStr = request.url || "/";
      let normalizedRequest = request;

      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const fullUrl = `${proto}://${host}${urlStr.startsWith("/") ? "" : "/"}${urlStr}`;
        normalizedRequest = new Request(fullUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          // @ts-ignore
          duplex: "half",
        });
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(normalizedRequest, env, ctx);
      
      if (response && response.status < 500) {
        return response;
      }

      const err = consumeLastCapturedError();
      if (err) console.warn("SSR recovered gracefully:", err);

      return response;
    } catch (error) {
      console.warn("SSR request error:", error);
      const handler = await getServerEntry().catch(() => null);
      if (handler) {
        try {
          return await handler.fetch(new Request("https://localhost/", request), env, ctx);
        } catch {
          // ignore and return fallback
        }
      }
      return new Response(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Monexa</title></head><body><div id="root"></div></body></html>`,
        { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }
  },
};
