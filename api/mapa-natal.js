export default async function handler(req, res) {
  // 🔓 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ⚠️ Preflight (muito importante)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nome, data, hora, cidade } = req.body;

  // exemplo de resposta
  return res.status(200).json({
    sucesso: true,
    mensagem: "Mapa natal recebido com sucesso",
    dados: { nome, data, hora, cidade }
  });
}
