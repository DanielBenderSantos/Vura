import tzlookup from "tz-lookup";

export default async function handler(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(String(req.query.limit || "8"), 10), 20);

    if (q.length < 2) {
      return res.status(400).json({ error: "Digite ao menos 2 caracteres." });
    }

    // Open-Meteo Geocoding (sem chave)
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q);
    url.searchParams.set("count", String(limit));
    url.searchParams.set("language", "pt");
    url.searchParams.set("format", "json");

    const r = await fetch(url.toString());
    const data = await r.json();

    const results = (data.results || []).map((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      let timezone = "AUTO";
      try {
        timezone = tzlookup(lat, lng); // ex: America/Sao_Paulo
      } catch {}

      return {
        name: item.name,
        country: item.country || "",
        lat,
        lng,
        timezone
      };
    });

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({
      error: "Falha no /api/geo",
      details: String(err?.stack || err)
    });
  }
}
