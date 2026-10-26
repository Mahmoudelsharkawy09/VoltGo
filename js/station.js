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

function formatClock(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
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
  modeledSeconds: 0,
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
  }

  renderPresets();
  showReadings();
  updatePreview();
}

// =====================================================
// Readings (SIMULATED): smooth readings are used by both the display and meter.
// =====================================================
function sampleReadings(elapsedSeconds = 0) {
  if (isOffline) return { volts: 0, amps: 0, powerKw: 0 };
  if (!state.charging) return { volts: station.voltage, amps: 0, powerKw: 0 };

  // Small, gradual changes around the rated values. Values stay correlated.
  const volts = station.voltage * (1 + 0.004 * Math.sin(elapsedSeconds * 0.019));
  const amps = station.current * (1 + 0.018 * Math.sin(elapsedSeconds * 0.013 + 0.7));
  return { volts, amps, powerKw: volts * amps / 1000 };
}

function showReadings(readings = sampleReadings(state.modeledSeconds)) {
  if (isOffline) {
    $("rdVoltage").textContent = "–";
    $("rdCurrent").textContent = "–";
    $("rdPower").textContent = "–";
    return;
  }

  $("rdVoltage").textContent = readings.volts.toFixed(1);
  $("rdCurrent").textContent = readings.amps.toFixed(1);
  $("rdPower").textContent = Math.round(readings.volts * readings.amps);
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
  state.modeledSeconds = 0;
  state.startedAt = Date.now();

  $("setupBlock").hidden = true;
  $("liveBlock").hidden = false;
  $("lvTarget").textContent = fmt(state.request.kwh);

  updateLive();
  state.timer = setInterval(tick, TICK_MS);
}

function tick() {
  // Integrate displayed voltage × current over simulated time, in kWh.
  const deltaSeconds = (TICK_MS / 1000) * SIM_SPEED;
  const nextSeconds = state.modeledSeconds + deltaSeconds;
  const readings = sampleReadings(nextSeconds);
  const energyAdded = readings.powerKw * deltaSeconds / 3600;
  const energyRemaining = state.request.kwh - state.consumed;

  if (energyAdded >= energyRemaining) {
    // Use only the fraction of this tick needed to reach the purchased limit.
    state.modeledSeconds += energyRemaining / readings.powerKw * 3600;
    state.consumed = state.request.kwh;
    updateLive(readings);
    finish("Charging finished: the amount you paid for was delivered.");
    return;
  }

  state.modeledSeconds = nextSeconds;
  state.consumed += energyAdded;

  updateLive(readings);
}

function costSoFar() {
  // never charge more than what was paid
  return Math.min(round2(state.consumed * station.pricePerKwh), state.request.egp);
}

function updateLive(readings) {
  const cost = costSoFar();
  const percent = Math.min(100, (state.consumed / state.request.kwh) * 100);

  $("lvKwh").textContent = fmt(state.consumed);
  $("lvCost").textContent = fmt(cost);
  $("lvBalance").textContent = fmt(state.request.egp - cost);
  // Runtime is wall-clock time for this accelerated demo session.
  $("lvTime").textContent = formatClock((Date.now() - state.startedAt) / 1000);
  $("lvPercent").textContent = Math.round(percent);
  $("progressFill").style.width = percent + "%";
  $("progress").setAttribute("aria-valuenow", Math.round(percent));

  showReadings(readings);
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
  $("smTime").textContent = formatClock((Date.now() - state.startedAt) / 1000);

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

// Camera preview starts only after an explicit click and browser permission.
let cameraStream = null;
$("cameraToggle").addEventListener("click", async () => {
  const button = $("cameraToggle");
  const video = $("cameraFeed");
  const help = $("cameraHelp");
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    video.srcObject = null;
    video.hidden = true;
    $("camera").classList.remove("is-live");
    $("cameraMessage").textContent = "Camera preview is off · 3D station illustration";
    button.textContent = "Turn on camera preview";
    help.textContent = "Camera stays off until you allow access in your browser.";
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    help.textContent = "Live camera is not available in this browser or page context. Open the site on localhost or HTTPS.";
    return;
  }

  button.disabled = true;
  button.textContent = "Waiting for camera permission…";
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = cameraStream;
    video.hidden = false;
    $("camera").classList.add("is-live");
    $("cameraMessage").textContent = "LIVE CAMERA PREVIEW · 3D station illustration";
    button.textContent = "Turn off camera preview";
    help.textContent = "Live preview only. The camera feed is not recorded or analyzed.";
  } catch (error) {
    const messages = {
      NotAllowedError: "Camera access was denied. Allow it in your browser settings to use the live preview.",
      NotFoundError: "No camera was found on this device.",
      NotReadableError: "The camera is busy in another app. Close that app and try again.",
    };
    help.textContent = messages[error.name] || "The camera could not be started. Check browser permissions and try again.";
    button.textContent = "Try camera again";
  } finally {
    button.disabled = false;
  }
});

window.addEventListener("pagehide", () => {
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
});

init();
