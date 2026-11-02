/* ============================================================
   RANKING ONLINE — função do Netlify (plano gratuito).
   GET  /api/leaderboard?pid=...  -> top 100 + posição do próprio operador
   POST /api/leaderboard          -> envia/atualiza a pontuação do operador
   Guarda os dados com Netlify Blobs (armazenamento incluído no Netlify).
   Limites: 1 envio a cada 10s por operador; pontuação entre 0 e 5.000.000.
   ============================================================ */
import { getStore } from "@netlify/blobs";

const MAX = 200;
const NAME = /^[\w-]{1,16}$/;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export default async (req) => {
  const store = getStore("shs-ranking");
  const board = (await store.get("board", { type: "json" })) || [];

  if (req.method === "GET") {
    const pid = new URL(req.url).searchParams.get("pid") || "";
    const idx = pid ? board.findIndex((e) => e.pid === pid) : -1;
    return json({
      rows: board.slice(0, 100).map((e) => ({ n: e.n, sc: e.sc, me: !!pid && e.pid === pid })),
      total: board.length,
      me: idx >= 0 ? { pos: idx + 1, sc: board[idx].sc } : null,
    });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "json" }, 400); }
    const { pid, name, score, lv } = body || {};
    if (typeof pid !== "string" || pid.length < 4 || pid.length > 40) return json({ error: "pid" }, 400);
    if (typeof name !== "string" || !NAME.test(name)) return json({ error: "name" }, 400);
    if (!Number.isInteger(score) || score < 0 || score > 5000000) return json({ error: "score" }, 400);

    const now = Date.now();
    const e = board.find((x) => x.pid === pid);
    if (e && now - e.ts < 10000) return json({ error: "rate" }, 429);
    if (e) { e.n = name; e.sc = score; e.ts = now; }
    else board.push({ pid, n: name, sc: score, ts: now });
    /* registro do operador (para o painel admin) */
    const players = (await store.get("players", { type: "json" })) || {};
    const p = players[pid] || { pid, created: now };
    Object.assign(p, { n: name, sc: score, lv: Number.isInteger(lv) ? Math.min(99, Math.max(1, lv)) : 1, last: now });
    players[pid] = p;
    await store.setJSON("players", players);

    board.sort((a, b) => b.sc - a.sc);
    const top = board.slice(0, MAX);
    await store.setJSON("board", top);
    const pos = top.findIndex((x) => x.pid === pid) + 1;
    return json({ ok: true, pos, total: top.length });
  }

  return json({ error: "method" }, 405);
};

export const config = { path: "/api/leaderboard" };
