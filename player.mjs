/* Apagar os dados online do próprio operador (direito de exclusão). */
import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "json" }, 400); }
  const pid = body && body.pid;
  if (typeof pid !== "string" || pid.length < 4 || pid.length > 40) return json({ error: "pid" }, 400);
  const store = getStore("shs-ranking");
  const players = (await store.get("players", { type: "json" })) || {};
  const board = (await store.get("board", { type: "json" })) || [];
  delete players[pid];
  await store.setJSON("players", players);
  await store.setJSON("board", board.filter((x) => x.pid !== pid));
  return json({ ok: true });
};

export const config = { path: "/api/player/delete" };
