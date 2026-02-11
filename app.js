// app.js
// Responsável por:
// 1) Autocomplete de cidades (chama /api/geo)
// 2) Guardar lat/lng/timezone da cidade escolhida
// 3) Enviar dados para /api/mandala e renderizar o SVG retornado

// Atalho para pegar elementos pelo ID
const pegarEl = (id) => document.getElementById(id);

// Elementos principais da página
const formulario = pegarEl("formMandala");
const elStatus = pegarEl("status");
const elResultado = pegarEl("output");

// Elementos do campo de cidade + lista de sugestões
const inputCidade = pegarEl("city");
const listaCidades = pegarEl("cityList");

// Aqui guardamos a cidade escolhida (objeto completo: name/country/lat/lng/timezone)
let cidadeSelecionada = null;

/** Atualiza o texto de status/feedback para o usuário */
function definirStatus(mensagem) {
  elStatus.textContent = mensagem || "";
}

/**
 * Evita injeção de HTML ao montar a lista de sugestões (segurança básica).
 * Ex: se algum texto vier com "<script>", isso vira texto e não executa.
 */
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]));
}

/**
 * Renderiza a lista de sugestões de cidades abaixo do input.
 * Cada item vira um botão clicável.
 */
function mostrarSugestoes(cidades) {
  if (!cidades || cidades.length === 0) {
    listaCidades.hidden = true;
    listaCidades.innerHTML = "";
    return;
  }

  listaCidades.hidden = false;

  listaCidades.innerHTML = cidades.map((cidade, idx) => {
    const nome = escaparHtml(cidade.name);
    const pais = escaparHtml(cidade.country);
    const fuso = escaparHtml(cidade.timezone);

    return `<button type="button" data-idx="${idx}">
      ${nome} (${pais}) — ${fuso}
    </button>`;
  }).join("");

  // Ao clicar em uma cidade, salvamos e preenchermos os hidden inputs
  listaCidades.querySelectorAll("button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const idx = Number(botao.dataset.idx);
      cidadeSelecionada = cidades[idx];

      // Preenche o input visível com "Cidade (País)"
      inputCidade.value = `${cidadeSelecionada.name} (${cidadeSelecionada.country})`;

      // Preenche os hidden inputs (usados ao enviar o payload)
      pegarEl("lat").value = cidadeSelecionada.lat;
      pegarEl("lng").value = cidadeSelecionada.lng;
      pegarEl("tz").value = cidadeSelecionada.timezone;

      // Fecha a lista
      mostrarSugestoes([]);
      definirStatus("");
    });
  });
}

/* ===========================
   AUTOCOMPLETE COM DEBOUNCE
   =========================== */

// debounce: evita chamar API a cada tecla imediatamente (melhora performance)
let timerDebounce = null;

inputCidade.addEventListener("input", () => {
  // Sempre que o usuário digita de novo, invalidamos a seleção anterior
  cidadeSelecionada = null;
  pegarEl("lat").value = "";
  pegarEl("lng").value = "";
  pegarEl("tz").value = "";

  clearTimeout(timerDebounce);

  const termo = inputCidade.value.trim();

  // Se tiver menos de 2 letras, nem buscamos
  if (termo.length < 2) {
    mostrarSugestoes([]);
    return;
  }

  timerDebounce = setTimeout(async () => {
    try {
      const resp = await fetch(`/api/geo?q=${encodeURIComponent(termo)}&limit=8`);
      const dados = await resp.json();

      if (!resp.ok) {
        throw new Error(dados?.error || "Erro ao buscar cidades.");
      }

      // O backend devolve { results: [...] }
      const cidades = dados.results || [];
      mostrarSugestoes(cidades);

    } catch (erro) {
      mostrarSugestoes([]);
      definirStatus(erro.message || String(erro));
    }
  }, 250);
});

// Fecha as sugestões ao clicar fora do componente de autocomplete
document.addEventListener("click", (e) => {
  if (!e.target.closest(".mandala-autocomplete")) mostrarSugestoes([]);
});

/* ===========================
   ENVIO DO FORMULÁRIO / MANDALA
   =========================== */

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  definirStatus("");

  // 1) Obrigatório ter escolhido uma cidade da lista (pra garantir lat/lng/tz)
  if (!cidadeSelecionada) {
    definirStatus("Selecione uma cidade na lista (isso garante lat/lng e timezone).");
    return;
  }

  // 2) Data e hora
  const valorData = pegarEl("date").value;
  const valorHora = pegarEl("time").value;

  if (!valorData || !valorHora) {
    definirStatus("Preencha data e hora.");
    return;
  }

  const [ano, mes, dia] = valorData.split("-").map(Number);
  const [hora, minuto] = valorHora.split(":").map(Number);

  // 3) Monta o payload para o backend /api/mandala
  const payload = {
    name: pegarEl("name").value.trim(),
    year: ano,
    month: mes,
    day: dia,
    hour: hora,
    minute: minuto,

    city: cidadeSelecionada.name,
    lat: cidadeSelecionada.lat,
    lng: cidadeSelecionada.lng,
    tz_str: cidadeSelecionada.timezone,

    house_system: pegarEl("house_system").value,
    zodiac_type: pegarEl("zodiac_type").value,
    theme_type: pegarEl("theme_type").value,
    size: Number(pegarEl("size").value || 900),
  };

  try {
    definirStatus("Gerando mandala...");
    elResultado.innerHTML = "";

    const resp = await fetch("/api/mandala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const dados = await resp.json();
    if (!resp.ok) throw new Error(dados?.error || "Falha ao gerar mandala.");

    // Nosso backend padroniza como { svg: "<svg...>" }
    // Mesmo assim deixei fallback caso você mude algo no futuro.
    const svg =
      dados.svg ||
      dados.chart_svg ||
      dados.output_svg ||
      dados?.result?.svg ||
      dados?.data?.svg;

    if (!svg) {
      console.log("Resposta da API (sem svg encontrado):", dados);
      throw new Error("Não achei o SVG na resposta. Veja o console (F12) para ajustar o campo.");
    }

    // 4) Renderiza o SVG direto no HTML
    elResultado.innerHTML = svg;
    definirStatus("Pronto ✅");

  } catch (erro) {
    definirStatus(erro.message || String(erro));
  }
});
