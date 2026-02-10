const $ = (id) => document.getElementById(id);

const form = $("formMandala");
const statusEl = $("status");
const output = $("output");

const cityInput = $("city");
const cityList = $("cityList");

let cityPick = null; // objeto escolhido no autocomplete

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function showSuggestions(items) {
  if (!items || items.length === 0) {
    cityList.hidden = true;
    cityList.innerHTML = "";
    return;
  }

  cityList.hidden = false;
  cityList.innerHTML = items.map((c, idx) => {
    const name = escapeHtml(c.name);
    const country = escapeHtml(c.country);
    const timezone = escapeHtml(c.timezone);
    return `<button type="button" data-idx="${idx}">
      ${name} (${country}) — ${timezone}
    </button>`;
  }).join("");

  cityList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      cityPick = items[idx];

      cityInput.value = `${cityPick.name} (${cityPick.country})`;
      $("lat").value = cityPick.lat;
      $("lng").value = cityPick.lng;
      $("tz").value = cityPick.timezone;

      showSuggestions([]);
      setStatus("");
    });
  });
}

// Debounce
let debounceT = null;
cityInput.addEventListener("input", () => {
  cityPick = null;
  $("lat").value = "";
  $("lng").value = "";
  $("tz").value = "";

  clearTimeout(debounceT);

  const q = cityInput.value.trim();
  if (q.length < 2) {
    showSuggestions([]);
    return;
  }

  debounceT = setTimeout(async () => {
    try {
      const r = await fetch(`/api/geo?q=${encodeURIComponent(q)}&limit=8`);
      const data = await r.json();

      if (!r.ok) {
        throw new Error(data?.error || "Erro ao buscar cidades.");
      }

      // A API costuma devolver { results: [...] }
      const results = data.results || [];
      showSuggestions(results);
    } catch (e) {
      showSuggestions([]);
      setStatus(e.message || String(e));
    }
  }, 250);
});

// Fecha sugestões ao clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest(".ma-autocomplete")) showSuggestions([]);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");

  if (!cityPick) {
    setStatus("Selecione uma cidade na lista (isso garante lat/lng e timezone).");
    return;
  }

  const date = $("date").value;
  const time = $("time").value;
  if (!date || !time) {
    setStatus("Preencha data e hora.");
    return;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const payload = {
    name: $("name").value.trim(),
    year, month, day,
    hour, minute,
    city: cityPick.name,
    lat: cityPick.lat,
    lng: cityPick.lng,
    tz_str: cityPick.timezone,
    house_system: $("house_system").value,
    zodiac_type: $("zodiac_type").value,
    theme_type: $("theme_type").value,
    size: Number($("size").value || 900)
  };

  try {
    setStatus("Gerando mandala...");
    output.innerHTML = "";

    const r = await fetch("/api/mandala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "Falha ao gerar mandala.");

    // A resposta pode variar: tente vários campos comuns
    const svg =
      data.svg ||
      data.chart_svg ||
      data.output_svg ||
      data?.result?.svg ||
      data?.data?.svg;

    if (!svg) {
      console.log("Resposta da API (sem svg encontrado):", data);
      throw new Error("Não achei o SVG na resposta. Veja o console (F12) para ajustar o campo.");
    }

    output.innerHTML = svg;
    setStatus("Pronto ✅");
  } catch (err) {
    setStatus(err.message || String(err));
  }
});
