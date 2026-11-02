/* ============================================================
   PAINEL ADMIN — função do Netlify, protegida por usuário e senha.
   Variáveis secretas no painel do Netlify:
     ADMIN_USER      (opcional, padrão: admin)
     ADMIN_PASSWORD  (obrigatória)
   GET  /api/admin                          -> lista de operadores
   POST /api/admin {action:'delete', pid}   -> apaga operador e pontuação
   Sem usuário e senha corretos, nenhum dado é devolvido.
   ============================================================ */
import { getStore } from "@netlify/blobs";
import { timingSafeEqual, createHash } from "node:crypto";

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra } });
const digest = (v) => createHash("sha256").update(String(v)).digest();
const same = (a, b) => timingSafeEqual(digest(a), digest(b));

function authorized(req) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const user = process.env.ADMIN_USER || "admin";
  const h = req.headers.get("authorization") || "";
  if (!h.startsWith("Basic ")) return false;
  let decoded = "";
  try { decoded = Buffer.from(h.slice(6), "base64").toString("utf8"); } catch { return false; }
  const i = decoded.indexOf(":");
  if (i < 0) return false;
  const u = decoded.slice(0, i), p = decoded.slice(i + 1);
  /* compara os dois, sem parar no primeiro erro */
  const okU = same(u, user), okP = same(p, pw);
  return okU && okP;
}

export default async (req) => {
  if (!authorized(req)) return json({ error: "unauthorized" }, 401, { "WWW-Authenticate": 'Basic realm="admin"' });
  const store = getStore("shs-ranking");
  const players = (await store.get("players", { type: "json" })) || {};
  const board = (await store.get("board", { type: "json" })) || [];

  if (req.method === "GET") {
    const list = Object.values(players)
      .sort((a, b) => (b.last || 0) - (a.last || 0))
      .map((p) => ({ ...p, inBoard: board.some((x) => x.pid === p.pid) }));
    return json({ players: list, total: list.length });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "json" }, 400); }
    if (body && body.action === "delete" && typeof body.pid === "string") {
      delete players[body.pid];
      await store.setJSON("players", players);
      await store.setJSON("board", board.filter((x) => x.pid !== body.pid));
      return json({ ok: true });
    }
    return json({ error: "action" }, 400);
  }
  return json({ error: "method" }, 405);
};

export const config = { path: "/api/admin" };
