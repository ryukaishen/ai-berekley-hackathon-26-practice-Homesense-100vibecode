import { z, type ZodType } from "zod";
import { apiRouteSchemas } from "./schemas.js";

type RouteDoc = {
  method: string;
  path: string;
  summary: string;
  params?: unknown;
  query?: unknown;
  body?: unknown;
  response?: unknown;
};

function toJsonSchema(schema?: ZodType) {
  return schema ? z.toJSONSchema(schema) : undefined;
}

export function getApiDocsJson() {
  const routes: RouteDoc[] = apiRouteSchemas.map((route) => ({
    method: route.method,
    path: route.path,
    summary: route.summary,
    params: "paramsSchema" in route ? toJsonSchema(route.paramsSchema) : undefined,
    query: "querySchema" in route ? toJsonSchema(route.querySchema) : undefined,
    body: "bodySchema" in route ? toJsonSchema(route.bodySchema) : undefined,
    response: "responseSchema" in route ? toJsonSchema(route.responseSchema) : undefined
  }));

  return {
    title: "ReEntry API",
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    routes
  };
}

export function getApiDocsHtml() {
  const docs = getApiDocsJson();
  const routeHtml = docs.routes
    .map(
      (route) => `
        <article class="route-card">
          <div class="route-heading">
            <span class="method">${escapeHtml(route.method)}</span>
            <code>${escapeHtml(route.path)}</code>
          </div>
          <p>${escapeHtml(route.summary)}</p>
          ${renderSchemaBlock("Params", route.params)}
          ${renderSchemaBlock("Query", route.query)}
          ${renderSchemaBlock("Body", route.body)}
          ${renderSchemaBlock("Response", route.response)}
        </article>
      `
    )
    .join("");

  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ReEntry API Docs</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f6f8fb;
            --surface: #ffffff;
            --text: #203049;
            --subtle: #52627d;
            --border: #d6dfeb;
            --accent: #3f72a8;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f1724;
              --surface: #172336;
              --text: #e8f0fb;
              --subtle: #bfd0e9;
              --border: #2b3f59;
              --accent: #7caee0;
            }
          }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: "Plus Jakarta Sans", "Avenir Next", "Segoe UI", sans-serif;
            line-height: 1.55;
          }
          main {
            width: min(1080px, calc(100% - 2rem));
            margin: 0 auto;
            padding: 2rem 0 3rem;
          }
          header {
            margin-bottom: 1rem;
          }
          h1 {
            margin: 0 0 0.35rem;
            font-size: 2rem;
          }
          .meta {
            margin: 0;
            color: var(--subtle);
          }
          .route-grid {
            display: grid;
            gap: 1rem;
          }
          .route-card {
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            background: var(--surface);
            padding: 1rem;
          }
          .route-heading {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.6rem;
          }
          .method {
            border-radius: 0.5rem;
            background: var(--accent);
            color: var(--bg);
            padding: 0.2rem 0.5rem;
            font-weight: 800;
            font-size: 0.8rem;
          }
          code, pre {
            font-family: "SFMono-Regular", Consolas, monospace;
          }
          pre {
            overflow: auto;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 0.75rem;
            background: color-mix(in srgb, var(--surface) 74%, var(--bg) 26%);
          }
          h2 {
            margin: 1rem 0 0.35rem;
            font-size: 0.9rem;
            color: var(--subtle);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>${escapeHtml(docs.title)}</h1>
            <p class="meta">Generated from Zod route schemas at ${escapeHtml(docs.generatedAt)}.</p>
          </header>
          <section class="route-grid">
            ${routeHtml}
          </section>
        </main>
      </body>
    </html>`;
}

function renderSchemaBlock(label: string, schema: unknown) {
  if (!schema) return "";

  return `
    <h2>${escapeHtml(label)}</h2>
    <pre>${escapeHtml(JSON.stringify(schema, null, 2))}</pre>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
