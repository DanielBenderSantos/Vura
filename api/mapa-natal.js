export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Somente POST
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { year, month, day, hour, minute, city } = req.body;

    if (
      year == null ||
      month == null ||
      day == null ||
      hour == null ||
      minute == null ||
      !city
    ) {
      return res.status(400).json({ erro: "Dados incompletos" });
    }

    const astroResponse = await fetch(
      "https://astro-api-1qnc.onrender.com/api/v1/natal/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ASTRO_API_KEY
        },
        body: JSON.stringify({
          name: "Usuário",
          year,
          month,
          day,
          hour,
          minute,
          city,
          lat: -23.5505,    // São Paulo (fixo por enquanto)
          lng: -46.6333,
          tz_str: "AUTO",
          house_system: "placidus"
        })
      }
    );

    const astroData = await astroResponse.json();

    return res.status(200).json(astroData);

  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({
      erro: "Erro ao gerar mapa natal"
    });
  }
}
