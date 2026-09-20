import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const startHandler = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request) {
    try {
      const urlStr = request.url || "/";
      let req = request;

      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const fullUrl = `${proto}://${host}${urlStr.startsWith("/") ? "" : "/"}${urlStr}`;
        req = new Request(fullUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          // @ts-ignore
          duplex: "half",
        });
      }

      return await startHandler(req);
    } catch (error) {
      console.warn("SSR render fallback:", error);
      return new Response(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Monexa</title></head><body><div id="root"></div></body></html>`,
        { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }
  },
};
