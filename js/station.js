// Station details page.
// Everything here is SIMULATED: readings, payment and charging.
// To connect real hardware or a payment provider later, replace the
// functions marked "SIMULATED" below.

// ---------- Settings you can change ----------
const MIN_KWH = 0.1;          // smallest allowed session
const MAX_KWH = 30;           // largest allowed session (30 kWh = 120 EGP at 4 EGP/kWh)
const TICK_MS = 500;          // how often the simulated charger updates
const SIM_SPEED = 900;        // 1 real second = 900 simulated seconds, so demos finish quickly
const PRESETS = {
  egp: [20, 50, 100],
  kwh: [5, 10, 20],
};

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const round2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => n.toFixed(2);

function formatDuration(hours) {
  const minutes = Math.round(hours * 60);
  if (minutes < 60) return minutes + " min";
  return Math.floor(minutes / 60) + " h " + (minutes % 60) + " min";
}

// ---------- Find the station from the address (?id=VG-01) ----------
const params = new URLSearchParams(location.search);
const station = STATIONS.find((s) => s.id === params.get("id"));
const powerKw = station ? stationPowerKw(station) : 0;
const isOffline = station ? station.status === "offline" : true;

// ---------- Session state ----------
const state = {
  mode: "egp",     // "egp" or "kwh"
  request: null,   // { kwh, egp } the user chose
  paid: false,
  charging: false,
  consumed: 0,     // kWh delivered so far
  timer: null,
};

// =====================================================
// Setup
// =====================================================
function init() {
  if (!station) {
    $("notFound").hidden = false;
    return;
  }

  document.title = "VoltGo – " + station.name;
  $("stationView").hidden = false;
  $("stId").textContent = station.id;
  $("stName").textContent = station.name;
  $("stLocation").textContent = station.location;

  const status = $("stStatus");
  status.textContent = isOffline ? "Offline" : "Online";
  status.className = "status status--" + station.status;

  $("ratedLine").textContent =
    "Rated: " + station.voltage + " V, " + station.current + " A, " +
    Math.round(powerKw * 1000) + " W";
  $("pvRate").textContent = fmt(station.pricePerKwh) + " EGP / kWh";

  if (isOffline) {
    $("offlineNotice").hidden = false;
    $("amountInput").disabled = true;
    $("modeEgp").disabled = true;
    $("modeKwh").disabled = true;
    $("cameraText").textContent = "Camera offline";
    $("camera").classList.add("is-off");
  }

  renderPresets();
  showReadings();
  updatePreview();
}

// =====================================================
// Readings (SIMULATED)
// =====================================================
function showReadings() {
  if (isOffline) {
    $("rdVoltage").textContent = "–";
    $("rdCurrent").textContent = "–";
    $("rdPower").textContent = "–";
    return;
  }

  let volts = station.voltage;
  let amps = 0; // idle: nothing is flowing

  if (state.charging) {
    // small random wobble so the numbers feel alive
    volts += (Math.random() - 0.5) * 0.6;
    amps = station.current + (Math.random() - 0.5) * 0.4;
  }

  $("rdVoltage").textContent = volts.toFixed(1);
  $("rdCurrent").textContent = amps.toFixed(1);
  $("rdPower").textContent = Math.round(volts * amps);
}

// =====================================================
// Choose amount
// =====================================================
function setMode(mode) {
  if (state.paid) return;
  state.mode = mode;

  $("modeEgp").classList.toggle("is-active", mode === "egp");
  $("modeKwh").classList.toggle("is-active", mode === "kwh");
  $("modeEgp").setAttribute("aria-pressed", mode === "egp");
  $("modeKwh").setAttribute("aria-pressed", mode === "kwh");

  $("amountLabel").textContent = mode === "egp" ? "Amount in EGP" : "Energy in kWh";
  $("amountUnit").textContent = mode === "egp" ? "EGP" : "kWh";
  $("amountInput").value = "";

  renderPresets();
  updatePreview();
}

function renderPresets() {
  const box = $("presets");
  box.innerHTML = "";
  PRESETS[state.mode].forEach((value) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = value + (state.mode === "egp" ? " EGP" : " kWh");
    chip.disabled = isOffline || state.paid;
    chip.addEventListener("click", () => {
      $("amountInput").value = value;
      updatePreview();
    });
    box.appendChild(chip);
  });
}

// Reads the input and works out both energy and price.
// Returns null if empty, { error } if out of range, or { kwh, egp }.
function readRequest() {
  const value = parseFloat($("amountInput").value);
  if (!(value > 0)) return null;

  const rate = station.pricePerKwh;
  const kwh = round2(state.mode === "egp" ? value / rate : value);
  const egp = round2(state.mode === "egp" ? value : value * rate);

  if (kwh < MIN_KWH) return { error: "Minimum is " + MIN_KWH + " kWh (" + fmt(MIN_KWH * rate) + " EGP)." };
  if (kwh > MAX_KWH) return { error: "Maximum is " + MAX_KWH + " kWh (" + fmt(MAX_KWH * rate) + " EGP)." };
  return { kwh, egp };
}

function updatePreview() {
  const req = readRequest();
  const error = $("amountError");

  if (req && req.error) {
    error.textContent = req.error;
    error.hidden = false;
  } else {
    error.hidden = true;
  }

  const valid = req && !req.error;
  $("pvKwh").textContent = valid ? fmt(req.kwh) + " kWh" : "–";
  $("pvEgp").textContent = valid ? fmt(req.egp) + " EGP" : "–";
  $("pvTime").textContent = valid ? formatDuration(req.kwh / powerKw) : "–";

  state.request = valid ? req : null;
  $("payBtn").disabled = isOffline || state.paid || !valid;
  $("payBtn").textContent = valid ? "Pay " + fmt(req.egp) + " EGP (simulated)" : "Pay (simulated)";
}

// =====================================================
// Payment (SIMULATED) – replace with a real provider later
// =====================================================
function simulatePayment(amountEgp) {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1200));
}

async function pay() {
  if (!state.request) return;

  $("payBtn").disabled = true;
  $("payBtn").textContent = "Processing…";

  const result = await simulatePayment(state.request.egp);

  if (!result.ok) {
    $("payBtn").textContent = "Payment failed, try again";
    $("payBtn").disabled = false;
    return;
  }

  state.paid = true;
  $("payBtn").textContent = "Paid (simulated)";
  $("paidNotice").textContent =
    "Simulated payment of " + fmt(state.request.egp) + " EGP accepted. No real money was charged.";
  $("paidNotice").hidden = false;

  // lock the choice and unlock charging
  $("amountInput").disabled = true;
  $("modeEgp").disabled = true;
  $("modeKwh").disabled = true;
  renderPresets();
  $("startBtn").disabled = false;
  $("cancelBtn").hidden = false;
}

function cancelPayment() {
  // Back to the beginning (simulated refund)
  state.paid = false;
  $("paidNotice").hidden = true;
  $("startBtn").disabled = true;
  $("cancelBtn").hidden = true;
  $("amountInput").disabled = false;
  $("modeEgp").disabled = false;
  $("modeKwh").disabled = false;
  renderPresets();
  updatePreview();
}

// =====================================================
// Charging (SIMULATED)
// =====================================================
function startCharging() {
  if (!state.paid || state.charging) return;

  state.charging = true;
  state.consumed = 0;
  state.startedAt = Date.now();

  $("setupBlock").hidden = true;
  $("liveBlock").hidden = false;
  $("lvTarget").textContent = fmt(state.request.kwh);

  updateLive();
  state.timer = setInterval(tick, TICK_MS);
}

function tick() {
  // energy (kWh) = power (kW) x time (h); time is sped up by SIM_SPEED
  const hours = (TICK_MS / 3600000) * SIM_SPEED;
  state.consumed += powerKw * hours;

  if (state.consumed >= state.request.kwh) {
    state.consumed = state.request.kwh;
    updateLive();
    finish("Charging finished: the amount you paid for was delivered.");
    return;
  }
  updateLive();
}

function costSoFar() {
  // never charge more than what was paid
  return Math.min(round2(state.consumed * station.pricePerKwh), state.request.egp);
}

function updateLive() {
  const cost = costSoFar();
  const percent = Math.min(100, (state.consumed / state.request.kwh) * 100);

  $("lvKwh").textContent = fmt(state.consumed);
  $("lvCost").textContent = fmt(cost);
  $("lvBalance").textContent = fmt(state.request.egp - cost);
  $("lvPercent").textContent = Math.round(percent);
  $("progressFill").style.width = percent + "%";
  $("progress").setAttribute("aria-valuenow", Math.round(percent));

  showReadings();
}

function finish(reason) {
  clearInterval(state.timer);
  state.charging = false;
  showReadings();

  const cost = costSoFar();

  $("endReason").textContent = reason;
  $("smKwh").textContent = fmt(state.consumed) + " kWh";
  $("smCost").textContent = fmt(cost) + " EGP";
  $("smPaid").textContent = fmt(state.request.egp) + " EGP";
  $("smRefund").textContent = fmt(state.request.egp - cost) + " EGP (simulated)";
  $("smTime").textContent = formatDuration(state.consumed / powerKw);

  $("liveBlock").hidden = true;
  $("summaryBlock").hidden = false;
}

function newSession() {
  state.paid = false;
  state.request = null;
  state.consumed = 0;

  $("summaryBlock").hidden = true;
  $("setupBlock").hidden = false;
  $("amountInput").value = "";
  $("paidNotice").hidden = true;
  $("startBtn").disabled = true;
  $("cancelBtn").hidden = true;
  $("amountInput").disabled = false;
  $("modeEgp").disabled = false;
  $("modeKwh").disabled = false;
  renderPresets();
  updatePreview();
}

// =====================================================
// Events
// =====================================================
$("modeEgp").addEventListener("click", () => setMode("egp"));
$("modeKwh").addEventListener("click", () => setMode("kwh"));
$("amountInput").addEventListener("input", updatePreview);
$("payBtn").addEventListener("click", pay);
$("cancelBtn").addEventListener("click", cancelPayment);
$("startBtn").addEventListener("click", startCharging);
$("stopBtn").addEventListener("click", () => finish("Charging stopped by you."));
$("newBtn").addEventListener("click", newSession);

init();
