export default async function handler(req, res) {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "8", 10), 20);

    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Digite ao menos 2 caracteres." });
    }

    // FreeAstroAPI geo search v2 (precisa de x-api-key)
    const url = new URL("https://astro-api-1qnc.onrender.com/api/v2/geo/search");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", String(limit));

    const r = await fetch(url.toString(), {
      headers: { "x-api-key": process.env.FREEASTRO_API_KEY },
    });

    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Falha no /api/geo", details: String(err) });
  }
}
