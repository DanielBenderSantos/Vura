function drawChart(data) {
  const container = document.getElementById("chart");
  container.innerHTML = "";

  const size = 500;
  const center = size / 2;
  const radius = 220;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);

  // círculo externo
  const circle = document.createElementNS(svg.namespaceURI, "circle");
  circle.setAttribute("cx", center);
  circle.setAttribute("cy", center);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", "#111");
  circle.setAttribute("stroke", "#999");
  circle.setAttribute("stroke-width", "2");
  svg.appendChild(circle);

  // casas
  data.houses.forEach(h => {
    const angle = (h.degree - 90) * Math.PI / 180;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#444");
    svg.appendChild(line);
  });

  // planetas
  data.planets.forEach(p => {
    const angle = (p.degree - 90) * Math.PI / 180;
    const x = center + (radius - 30) * Math.cos(angle);
    const y = center + (radius - 30) * Math.sin(angle);

    const text = document.createElementNS(svg.namespaceURI, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "16");
    text.setAttribute("text-anchor", "middle");
    text.textContent = p.symbol;
    svg.appendChild(text);
  });

  container.appendChild(svg);
}
