/* Diamantes de Sangre v1
   - El juego se simula en el navegador (el azar lo genera el frontend).
   - El historial consulta la API de Django (GET). Si no responde, usa datos simulados. */

const API = "http://localhost:8000/api/v1"; // dirección del backend Django
const MARGEN = 0.97; // la casa se queda con 3 %
const SIMULADOS = [
  { id: 101, jugador: "Isaac",  tamano_cuadricula: 5, cantidad_minas: 3, apuesta: 800,  multiplicador_final: 1.40, ganancia: 1120, estado: "GANADA" },
  { id: 102, jugador: "Ivan",   tamano_cuadricula: 5, cantidad_minas: 3, apuesta: 500,  multiplicador_final: 0,    ganancia: 0,    estado: "PERDIDA" },
  { id: 103, jugador: "Keilen", tamano_cuadricula: 7, cantidad_minas: 5, apuesta: 1000, multiplicador_final: 2.10, ganancia: 2100, estado: "GANADA" },
  { id: 104, jugador: "Isaac",  tamano_cuadricula: 3, cantidad_minas: 1, apuesta: 300,  multiplicador_final: 1.12, ganancia: 336,  estado: "RETIRADA" }
];

const $ = id => document.getElementById(id);
const dinero = n => Number(n).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
const ETQ = { GANADA: "Ganada", PERDIDA: "Perdida", RETIRADA: "Retirada" };

const e = { minas: 3, n: 5, saldo: 10000, apuesta: 800, activo: false, k: 0,
            minasPos: new Set(), abiertas: new Set(), ganancia: 0, fin: false, sonido: true };
const jugadas = []; // partidas jugadas en esta sesión

/* Multiplicador tras k casillas seguras: 0.97 * prod (N-i)/(N-m-i) */
function mult(k, N = e.n * e.n, m = e.minas) {
  if (k === 0) return 0;
  let r = MARGEN;
  for (let i = 0; i < k; i++) r *= (N - i) / (N - m - i);
  return r;
}

/* ---------- Dibujo ---------- */
function dibujar() {
  const N = e.n * e.n, seguras = N - e.minas;
  const t = $("tablero");
  t.style.setProperty("--n", e.n);
  t.className = "tablero" + (e.activo ? " vivo" : "");
  t.innerHTML = Array.from({ length: N }, (_, i) => {
    const abierta = e.abiertas.has(i), mina = e.minasPos.has(i);
    if (abierta && mina) return '<button class="celda abierta mina fallo" disabled><i class="bomb icon"></i></button>';
    if (abierta) return '<button class="celda abierta diamante" disabled><i class="gem icon"></i></button>';
    if (e.fin && mina) return '<button class="celda mina tapada" disabled><i class="bomb icon"></i></button>';
    return `<button class="celda" data-i="${i}" ${e.activo ? "" : "disabled"} aria-label="Casilla ${i + 1}"></button>`;
  }).join("");

  $("mults").innerHTML = [0, 1, 2, 3, 4].filter(d => e.k + d <= seguras)
    .map((d, j) => `<span class="${j === 0 ? "actual" : ""}">${mult(e.k + d).toFixed(2)}x</span>`).join("");

  $("saldo").textContent = dinero(e.saldo);
  $("ganancia").textContent = dinero(e.ganancia);
  $("monto").textContent = dinero(e.apuesta);
  $("menos").disabled = $("mas").disabled = e.activo;
  document.querySelectorAll(".opciones .ui.button").forEach(b => b.disabled = e.activo);
  $("minas-personal").disabled = e.activo;

  const b = $("btn-apuesta");
  b.textContent = e.activo ? "RETIRAR" : "APUESTA";
  b.disabled = e.activo && e.k === 0;
}

function mensaje(texto) { $("mensaje").textContent = texto; }

function tono(freq) {
  if (!e.sonido) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), vol = ctx.createGain();
    osc.frequency.value = freq; vol.gain.value = .05;
    osc.connect(vol); vol.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + .12);
  } catch (_) { /* sin audio disponible */ }
}

/* ---------- Partida ---------- */
function apostar() {
  if (e.apuesta > e.saldo) { mensaje("SALDO INSUFICIENTE"); return; }
  const N = e.n * e.n;
  e.minasPos = new Set();
  while (e.minasPos.size < e.minas) e.minasPos.add(Math.floor(Math.random() * N));
  e.saldo -= e.apuesta;
  Object.assign(e, { activo: true, fin: false, k: 0, ganancia: 0, abiertas: new Set() });
  mensaje("");
  dibujar();
}

function pulsar(i) {
  if (!e.activo || e.abiertas.has(i)) return;
  e.abiertas.add(i);
  if (e.minasPos.has(i)) { tono(120); terminar("PERDIDA"); return; }
  tono(880);
  e.k++;
  e.ganancia = e.apuesta * mult(e.k);
  if (e.k === e.n * e.n - e.minas) terminar("GANADA"); else dibujar();
}

function terminar(estado) {
  e.activo = false; e.fin = true;
  if (estado === "PERDIDA") e.ganancia = 0; else e.saldo += e.ganancia;
  jugadas.unshift({ id: Date.now(), jugador: "Tú", tamano_cuadricula: e.n, cantidad_minas: e.minas,
    apuesta: e.apuesta, multiplicador_final: estado === "PERDIDA" ? 0 : mult(e.k), ganancia: e.ganancia, estado });
  mensaje(estado === "PERDIDA" ? "MINA. PERDISTE" : `COBRASTE ${dinero(e.ganancia)}`);
  if (e.apuesta > e.saldo) e.apuesta = Math.max(100, Math.floor(e.saldo / 100) * 100);
  dibujar();
}

/* ---------- Controles ---------- */
function elegir(grupo, fn) {
  $(grupo).addEventListener("click", ev => {
    const b = ev.target.closest("button[data-v]");
    if (!b || e.activo) return;
    $(grupo).querySelectorAll("button").forEach(x => x.classList.remove("activo"));
    b.classList.add("activo");
    fn(b.dataset.v);
    reiniciar();
  });
}
function reiniciar() { Object.assign(e, { k: 0, ganancia: 0, abiertas: new Set(), minasPos: new Set(), fin: false }); mensaje("PULSA APUESTA PARA EMPEZAR"); dibujar(); }

elegir("minas-opc", v => {
  $("caja-personal").hidden = v !== "p";
  e.minas = v === "p" ? ajustarMinas($("minas-personal").value) : +v;
  ajustarMinas();
});
elegir("grid-opc", v => { e.n = +v; ajustarMinas(); });

/* Evita más minas que casillas: deja siempre al menos 1 casilla segura */
function ajustarMinas(valor = e.minas) {
  e.minas = Math.max(1, Math.min(+valor || 1, e.n * e.n - 1));
  return e.minas;
}
$("minas-personal").addEventListener("change", ev => { e.minas = ajustarMinas(ev.target.value); ev.target.value = e.minas; reiniciar(); });

$("menos").addEventListener("click", () => { e.apuesta = Math.max(100, e.apuesta - 100); dibujar(); });
$("mas").addEventListener("click", () => { e.apuesta = Math.min(e.saldo, e.apuesta + 100); dibujar(); });
$("btn-apuesta").addEventListener("click", () => e.activo ? terminar("RETIRADA") : apostar());
$("tablero").addEventListener("click", ev => { const c = ev.target.closest(".celda[data-i]"); if (c) pulsar(+c.dataset.i); });

/* ---------- Paneles: Info e Historial ---------- */
document.querySelector(".iconos").addEventListener("click", ev => {
  const b = ev.target.closest("button[data-p]");
  if (!b) return;
  if (b.dataset.p === "sonido") {
    e.sonido = !e.sonido;
    b.classList.toggle("on", !e.sonido);
    b.innerHTML = `<i class="volume ${e.sonido ? "up" : "off"} icon"></i>Sonido`;
  } else if (b.dataset.p === "info") abrirInfo();
  else abrirHistorial();
});
$("cerrar").addEventListener("click", () => { $("extra").hidden = true; });

function abrirInfo() {
  $("extra-titulo").textContent = "Cómo se juega";
  $("extra-cuerpo").innerHTML = `
    <p>1. Elige las minas y el tamaño del tablero.</p>
    <p>2. Define tu apuesta y pulsa APUESTA.</p>
    <p>3. Descubre casillas. Cada diamante sube el multiplicador.</p>
    <p>4. Pulsa RETIRAR para cobrar. Si pisas una mina, pierdes la apuesta.</p>
    <p>Más minas significa más riesgo y multiplicadores más altos. Es un juego de azar.</p>`;
  $("extra").hidden = false;
}

/* GET a la API. Devuelve el JSON o null si Django no responde. */
async function pedir(ruta) {
  try {
    const res = await fetch(API + ruta);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (_) { return null; }
}

function calcularRanking(lista) {
  const acum = {};
  lista.forEach(p => {
    const j = acum[p.jugador] || (acum[p.jugador] = { jugador: p.jugador, partidas: 0, ganancia_total: 0 });
    j.partidas++; j.ganancia_total += Number(p.ganancia);
  });
  return Object.values(acum).sort((a, b) => b.ganancia_total - a.ganancia_total);
}

async function abrirHistorial(estado = "") {
  $("extra-titulo").textContent = "Historial";
  $("extra-cuerpo").innerHTML = "<p>Consultando...</p>";
  $("extra").hidden = false;

  const [partidas, rank] = await Promise.all([
    pedir("/partidas/" + (estado ? "?estado=" + estado : "")),
    pedir("/ranking/")
  ]);
  const enLinea = partidas !== null;
  const local = [...jugadas, ...SIMULADOS];
  const lista = enLinea ? partidas.results : local.filter(p => !estado || p.estado === estado);
  const ranking = rank ? rank.results : calcularRanking(local);
  const origen = enLinea ? "Datos de la API de Django."
    : "No se pudo conectar con Django. Se muestran datos simulados y tus partidas de esta sesión.";

  const opciones = [["", "Todos"], ["GANADA", "Ganada"], ["PERDIDA", "Perdida"], ["RETIRADA", "Retirada"]]
    .map(([v, t]) => `<option value="${v}" ${v === estado ? "selected" : ""}>${t}</option>`).join("");

  $("extra-cuerpo").innerHTML = `<p>${origen}</p>
    <label class="filtro">Estado <select id="filtro-estado">${opciones}</select></label>
    <table class="ui very basic inverted table"><thead><tr>
      <th>Jugador</th><th>Tablero</th><th>Apuesta</th><th>Mult.</th><th>Ganancia</th><th>Estado</th></tr></thead>
    <tbody>${lista.map(p => `<tr><td>${p.jugador}</td><td>${p.tamano_cuadricula}x${p.tamano_cuadricula}, ${p.cantidad_minas} minas</td>
      <td>${dinero(p.apuesta)}</td><td>${Number(p.multiplicador_final).toFixed(2)}x</td><td>${dinero(p.ganancia)}</td>
      <td class="${p.estado.toLowerCase()}">${ETQ[p.estado] || p.estado}</td></tr>`).join("") || '<tr><td colspan="6">No hay partidas con ese estado.</td></tr>'}</tbody></table>
    <h3>Ranking</h3>
    <table class="ui very basic inverted table"><thead><tr><th>Jugador</th><th>Partidas</th><th>Ganancia total</th></tr></thead>
    <tbody>${ranking.map(j => `<tr><td>${j.jugador}</td><td>${j.partidas}</td><td>${dinero(j.ganancia_total)}</td></tr>`).join("")}</tbody></table>`;
  $("filtro-estado").addEventListener("change", ev => abrirHistorial(ev.target.value));
}

/* ---------- Reloj ---------- */
function actualizarReloj() {
  $("reloj").textContent = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
actualizarReloj();
setInterval(actualizarReloj, 1000);

reiniciar();
