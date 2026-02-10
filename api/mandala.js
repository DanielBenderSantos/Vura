export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

    const body = await readJson(req);

    const required = ["name","year","month","day","hour","minute","city","lat","lng","tz_str"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return res.status(400).json({ error: `Campo obrigatório: ${k}` });
      }
    }

    const payload = {
      name: String(body.name),
      year: Number(body.year),
      month: Number(body.month),
      day: Number(body.day),
      hour: Number(body.hour),
      minute: Number(body.minute),
      city: String(body.city),
      lat: Number(body.lat),
      lng: Number(body.lng),
      tz_str: String(body.tz_str),

      zodiac_type: body.zodiac_type || "tropical",
      house_system: body.house_system || "placidus",

      // IMPORTANTÍSSIMO: SVG vem como TEXTO puro
      format: "svg",
      size: Number(body.size || 900),
      theme_type: body.theme_type || "light",
      show_metadata: true,

      display_settings: {
        chiron: true,
        lilith: true,
        north_node: true,
        south_node: true,
        asc: true,
        mc: true
      },

      chart_config: {
        show_color_background: false,
        sign_ring_thickness_fraction: 0.17,
        house_ring_thickness_fraction: 0.07,
        planet_symbol_scale: 0.40,
        sign_symbol_scale: 0.62
      }
    };

    const r = await fetch("https://astro-api-1qnc.onrender.com/api/v1/natal/experimental", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FREEASTRO_API_KEY
      },
      body: JSON.stringify(payload),
    });

    // Se deu erro, tenta ler JSON ou texto pra mostrar a causa
    if (!r.ok) {
      const txt = await r.text();
      let parsed;
      try { parsed = JSON.parse(txt); } catch { parsed = { raw: txt }; }

      return res.status(r.status).json({
        error: "FreeAstro retornou erro no /natal/experimental",
        status: r.status,
        response: parsed
      });
    }

    // Aqui é o principal: SVG puro
    const svgText = await r.text();

    // Devolve como JSON pro seu app.js não mudar
    return res.status(200).json({ svg: svgText });
  } catch (err) {
    return res.status(500).json({
      error: "Falha no /api/mandala",
      details: String(err?.stack || err)
    });
  }
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(e); }
    });
  });
}
