function gerarMapa() {
  const apiKey = "cbcbd10e0e8949d64de19b8ddb8fcabe4d90a16590511100fbc7c8ce5d156ab4";
  const url = "https://astro-api-1qnc.onrender.com/api/v1/western/natal";

  const dados = {
    year: 1998,
    month: 7,
    day: 22,
    hour: 14,
    minute: 30,
    city: "São Paulo"
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(dados)
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);
    document.getElementById("resultado").textContent =
      JSON.stringify(data, null, 2);
  })
  .catch(err => {
    console.error(err);
    alert("Erro ao gerar mapa natal");
  });
}
