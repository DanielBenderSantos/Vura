// api/geo.js
// Esta rota serve para AUTOCOMPLETE de cidades.
// Ela recebe um texto (ex: "fran") e devolve uma lista de cidades com:
// - latitude
// - longitude
// - timezone (IANA, ex: "America/Sao_Paulo")
// Assim o front consegue gerar o mapa astral com dados corretos.

import tzlookup from "tz-lookup";

export default async function handler(req, res) {
  try {
    // 1) Lê parâmetros da query string (ex: /api/geo?q=franca&limit=8)
    const termo = String(req.query.q || "").trim();
    const limite = Math.min(parseInt(String(req.query.limit || "8"), 10), 20);

    // 2) Validação mínima: evita chamadas inúteis e melhora UX
    if (termo.length < 2) {
      return res.status(400).json({
        error: "Digite ao menos 2 caracteres para buscar a cidade.",
      });
    }

    // 3) Chama a API de geocoding do Open-Meteo (não precisa de chave)
    // Ela devolve possíveis cidades (com lat/lng).
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", termo);
    url.searchParams.set("count", String(limite));
    url.searchParams.set("language", "pt");
    url.searchParams.set("format", "json");

    const resposta = await fetch(url.toString());

    // Se a API externa falhar, devolvemos um erro amigável
    if (!resposta.ok) {
      const corpoTexto = await resposta.text().catch(() => "");
      return res.status(502).json({
        error: "Falha ao consultar serviço de cidades (Open-Meteo).",
        status: resposta.status,
        details: corpoTexto || "Sem detalhes.",
      });
    }

    const dados = await resposta.json();

    // 4) Normaliza o resultado para o formato que o front espera:
    // { results: [ { name, country, lat, lng, timezone } ] }
    const results = (dados.results || []).map((item) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);

      // 5) Timezone: calculamos localmente usando lat/lng.
      // Isso é importante para o mapa astral (o fuso influencia posições/casas).
      let timezone = "AUTO";
      try {
        timezone = tzlookup(latitude, longitude);
      } catch {
        // Se der algum problema, mantemos "AUTO" como fallback.
      }

      return {
        name: item.name,                 // nome da cidade
        country: item.country || "",     // país (quando disponível)
        lat: latitude,                   // latitude
        lng: longitude,                  // longitude
        timezone,                        // timezone IANA (ou "AUTO")
      };
    });

    // 6) Resposta final para o front
    return res.status(200).json({ results });
  } catch (erro) {
    // Erro inesperado (ex: falha na rede, bug, etc.)
    return res.status(500).json({
      error: "Erro interno ao buscar cidades (/api/geo).",
      details: String(erro?.stack || erro),
    });
  }
}
