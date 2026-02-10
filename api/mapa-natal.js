export default async function handler(req, res) {
  // CORS básico
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Aceita SOMENTE POST
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido. Use POST."
    });
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
      return res.status(400).json({
        erro: "Dados incompletos"
      });
    }

    // 👇 POR ENQUANTO só devolvemos os dados
    return res.status(200).json({
      sucesso: true,
      mapa_natal: {
        year,
        month,
        day,
        hour,
        minute,
        city
      }
    });

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({
      erro: "Erro interno no servidor"
    });
  }
}
