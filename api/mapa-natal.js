export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const {
    year,
    month,
    day,
    hour,
    minute,
    city
  } = req.body;

  return res.status(200).json({
    sucesso: true,
    mensagem: "Mapa natal recebido com sucesso",
    dados: {
      year,
      month,
      day,
      hour,
      minute,
      city
    }
  });
}
