import { createHash } from "node:crypto";

import { getLogo } from "@/features/tenant/service";
import { withDevTenant } from "@/lib/context/dev-tenant";

/**
 * Serve o logo do tenant do contexto (PROVISÓRIO: dev tenant até a
 * Tarefa 017). O caminho vem do banco — nunca da query string.
 */
export async function GET(request: Request): Promise<Response> {
  const logo = await withDevTenant(() => getLogo());
  if (!logo) {
    return new Response(null, { status: 404 });
  }

  const etag = `"${createHash("sha1").update(logo.dados).digest("hex")}"`;
  const headers = {
    "Content-Type": logo.contentType,
    "Cache-Control": "private, max-age=300",
    ETag: etag,
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(new Uint8Array(logo.dados), { headers });
}
