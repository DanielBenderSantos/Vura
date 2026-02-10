export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { year, month, day, hour, minute, city } = req.body;

    const astroResponse = await fetch(
      "https://astro-api-1qnc.onrender.com/api/v1/western/natal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ASTRO_API_KEY
        },
        body: JSON.stringify({
          year,
          month,
          day,
          hour,
          minute,
          city
        })
      }
    );

    const astroData = await astroResponse.json();

    return res.status(200).json({
      sucesso: true,
      mapa_natal: astroData
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao gerar mapa natal"
    });
  }
}
