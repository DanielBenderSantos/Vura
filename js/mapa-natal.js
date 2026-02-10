const form = document.getElementById("mapaForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById("name").value,
    year: Number(document.getElementById("year").value),
    month: Number(document.getElementById("month").value),
    day: Number(document.getElementById("day").value),
    hour: Number(document.getElementById("hour").value),
    minute: Number(document.getElementById("minute").value),
    city: document.getElementById("city").value,
    lat: Number(document.getElementById("lat").value),
    lng: Number(document.getElementById("lng").value),
    tz_str: "AUTO",
    house_system: "placidus",
    include_features: ["lilith", "chiron"]
  };

  const res = await fetch("https://astro-api-1qnc.onrender.com/api/v1/natal/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "SUA_API_KEY"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  // 🔥 AQUI é o pulo do gato
  drawChart(data);
});
