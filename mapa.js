const svg = document.getElementById("mapa");
const cx = 300;
const cy = 300;

const R_ZODIAC = 270;
const R_HOUSES = 220;
const R_PLANETS = 180;

function polar(angle, radius) {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };
}

async function gerarMapa() {
  svg.innerHTML = ""; // limpa mapa anterior

  const [year, month, day] =
    document.getElementById("date").value.split("-");
  const [hour, minute] =
    document.getElementById("time").value.split(":");

  const body = {
    name: document.getElementById("name").value || "Usuário",
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    city: document.getElementById("city").value
  };

  const res = await fetch("/api/mapa-natal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  desenharMapa(data);
}

function desenharMapa(data) {

  /* FUNDO */
  svg.innerHTML += `
    <circle cx="${cx}" cy="${cy}" r="280"
      fill="none" stroke="#7b3fe4" stroke-width="3"/>
  `;

  /* CASAS */
  data.houses.forEach(h => {
    const p = polar(h.abs_pos, R_HOUSES);
    svg.innerHTML += `
      <line x1="${cx}" y1="${cy}"
        x2="${p.x}" y2="${p.y}"
        stroke="#2b3555"/>
    `;
  });

  /* SIGNOS */
  const signs = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  signs.forEach((s, i) => {
    const p = polar(i * 30 + 15, R_ZODIAC);
    svg.innerHTML += `
      <text x="${p.x}" y="${p.y}"
        fill="#caa8ff"
        font-size="18"
        text-anchor="middle"
        dominant-baseline="middle">${s}</text>
    `;
  });

  /* PLANETAS */
  const planetSymbols = {
    sun:"☉", moon:"☽", mercury:"☿", venus:"♀",
    mars:"♂", jupiter:"♃", saturn:"♄",
    uranus:"♅", neptune:"♆", pluto:"♇",
    north_node:"☊", lilith:"⚸", chiron:"⚷"
  };

  data.planets.forEach(p => {
    const pos = polar(p.abs_pos, R_PLANETS);
    svg.innerHTML += `
      <text x="${pos.x}" y="${pos.y}"
        font-size="18"
        text-anchor="middle"
        dominant-baseline="middle">
        ${planetSymbols[p.id] || "•"}
      </text>
    `;
  });

  /* ASPECTOS */
  data.aspects.forEach(a => {
    const p1 = data.planets.find(p => p.id === a.p1);
    const p2 = data.planets.find(p => p.id === a.p2);
    if (!p1 || !p2) return;

    const A = polar(p1.abs_pos, R_PLANETS);
    const B = polar(p2.abs_pos, R_PLANETS);

    svg.innerHTML += `
      <line x1="${A.x}" y1="${A.y}"
        x2="${B.x}" y2="${B.y}"
        stroke="rgba(255,255,255,0.15)"/>
    `;
  });
}
