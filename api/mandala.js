// api/mandala.js
// Esta rota gera a MANDALA (mapa astral em formato SVG) usando a FreeAstroAPI.
// Ela recebe os dados de nascimento + cidade (lat/lng/timezone) e devolve:
// { svg: "<svg>...</svg>" }
//
// Importante:
// - A FreeAstro retorna o SVG como TEXTO puro (não vem como JSON).
// - Por isso aqui nós lemos como `text()` e embrulhamos em JSON pro front.

export default async function handler(req, res) {
  try {
    // 1) Apenas POST (para enviar dados no body)
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido. Use POST." });
    }

    // 2) Lê o body JSON enviado pelo front
    const dadosEntrada = await lerBodyJson(req);

    // 3) Validação mínima (campos essenciais para o cálculo)
    const camposObrigatorios = [
      "name", "year", "month", "day", "hour", "minute",
      "city", "lat", "lng", "tz_str"
    ];

    for (const campo of camposObrigatorios) {
      if (dadosEntrada[campo] === undefined || dadosEntrada[campo] === null || dadosEntrada[campo] === "") {
        return res.status(400).json({ error: `Campo obrigatório: ${campo}` });
      }
    }

    // 4) Confere se a API Key existe no ambiente (Vercel)
    const chaveApi = process.env.FREEASTRO_API_KEY;
    if (!chaveApi) {
      return res.status(500).json({
        error: "FREEASTRO_API_KEY não configurada na Vercel (Environment Variables)."
      });
    }

    // 5) Monta payload no formato esperado pela FreeAstroAPI
    const payload = {
      // Dados principais
      name: String(dadosEntrada.name),
      year: Number(dadosEntrada.year),
      month: Number(dadosEntrada.month),
      day: Number(dadosEntrada.day),
      hour: Number(dadosEntrada.hour),
      minute: Number(dadosEntrada.minute),

      city: String(dadosEntrada.city),
      lat: Number(dadosEntrada.lat),
      lng: Number(dadosEntrada.lng),
      tz_str: String(dadosEntrada.tz_str),

      // Configurações astrológicas (padrões bons)
      zodiac_type: dadosEntrada.zodiac_type || "tropical",
      house_system: dadosEntrada.house_system || "placidus",

      // Saída em SVG (e aqui está o “pulo do gato”)
      format: "svg",
      size: Number(dadosEntrada.size || 900),
      theme_type: dadosEntrada.theme_type || "light",
      show_metadata: true,

      // O que mostrar no mapa
      display_settings: {
        chiron: true,
        lilith: true,
        north_node: true,
        south_node: true,
        asc: true,
        mc: true
      },

      // Ajustes visuais do desenho (você pode mexer depois)
      chart_config: {
        show_color_background: false,
        sign_ring_thickness_fraction: 0.17,
        house_ring_thickness_fraction: 0.07,
        planet_symbol_scale: 0.40,
        sign_symbol_scale: 0.62
      }
    };

    // 6) Chama a FreeAstroAPI
    const resposta = await fetch(
      "https://astro-api-1qnc.onrender.com/api/v1/natal/experimental",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": chaveApi
        },
        body: JSON.stringify(payload)
      }
    );

    // 7) Se a FreeAstro retornou erro, tentamos trazer detalhes úteis
    if (!resposta.ok) {
      const textoErro = await resposta.text();

      let erroParseado;
      try {
        erroParseado = JSON.parse(textoErro);
      } catch {
        erroParseado = { raw: textoErro };
      }

      return res.status(resposta.status).json({
        error: "A FreeAstro retornou erro ao gerar o SVG.",
        status: resposta.status,
        response: erroParseado
      });
    }

    // 8) Se deu certo: o corpo é o SVG como texto puro
    const svgTexto = await resposta.text();

    // 9) Embrulha em JSON para o front não precisar mudar nada
    return res.status(200).json({ svg: svgTexto });

  } catch (erro) {
    return res.status(500).json({
      error: "Erro interno ao gerar mandala (/api/mandala).",
      details: String(erro?.stack || erro)
    });
  }
}

/**
 * Lê o body da requisição e converte para JSON.
 * (Vercel Functions não garante que req.body venha pronto em todos os casos.)
 */
async function lerBodyJson(req) {
  return new Promise((resolve, reject) => {
    let bruto = "";

    req.on("data", (chunk) => {
      bruto += chunk;
    });

    req.on("end", () => {
      try {
        resolve(bruto ? JSON.parse(bruto) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}
