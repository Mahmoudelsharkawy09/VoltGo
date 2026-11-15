const $phone = (id) => document.getElementById(id);
const requestedPhoneService = STATIONS.find((item) => item.id === new URLSearchParams(location.search).get("id") && ["wired", "wireless"].includes(item.type));
const phonePrices = new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 });
const portTemplate = document.getElementById("phonePortTemplate");
const packageTemplate = document.getElementById("phonePackageTemplate");
let selectedPackage = null;
let selectedPort = null;
let phoneTimer = null;
let phoneStartedAt = null;

function initPhonePage() {
  if (!requestedPhoneService) {
    $phone("phoneNotFound").hidden = false;
    return;
  }
  const item = requestedPhoneService;
  document.title = "VoltGo · " + item.name;
  $phone("phoneView").hidden = false;
  $phone("phoneId").textContent = item.id + " · " + (item.type === "wired" ? "WIRED PHONE CHARGING" : "WIRELESS PHONE CHARGING");
  $phone("phoneName").textContent = item.name;
  $phone("phoneLocation").textContent = item.location;
  $phone("portHeading").textContent = item.type === "wired" ? "Choose an available wired port" : "Choose an available Qi pad";
  $phone("phoneModelIcon").textContent = item.type === "wired" ? "⌁" : "◎";
  renderPorts(item);
  renderPackages(item);
  updatePoleTelemetry();
  $phone("phonePay").addEventListener("click", payForPhoneSession);
  $phone("phoneStart").addEventListener("click", startPhoneSession);
  $phone("phoneStop").addEventListener("click", () => endPhoneSession("Session stopped by customer."));
  window.addEventListener("pagehide", () => window.clearInterval(phoneTimer));
}

function renderPorts(item) {
  const wrap = $phone("phonePorts");
  item.ports.forEach((port, index) => {
    const button = portTemplate.content.firstElementChild.cloneNode(true);
    const selected = port.available && !selectedPort;
    if (selected) button.classList.add("selected");
    if (!port.available) button.classList.add("is-closed");
    button.disabled = !port.available;
    button.querySelector("[data-port-id]").textContent = port.id;
    button.querySelector("[data-port-type]").textContent = port.type;
    button.querySelector("[data-port-location]").textContent = port.available ? port.location : "Closed · unavailable";
    button.querySelector("[data-port-check]").textContent = port.available ? "✓" : "×";
    button.addEventListener("click", () => {
      if (!port.available || $phone("phonePay").disabled) return;
      wrap.querySelectorAll(".phone-port").forEach((node) => node.classList.remove("selected"));
      button.classList.add("selected");
      selectedPort = port.id;
    });
    wrap.appendChild(button);
    if (port.available && !selectedPort) selectedPort = port.id;
  });
}

function renderPackages(item) {
  const wrap = $phone("phonePackages");
  item.packages.forEach((pkg, index) => {
    const button = packageTemplate.content.firstElementChild.cloneNode(true);
    if (index === 1) button.classList.add("selected");
    button.querySelector("[data-package-minutes]").textContent = pkg.minutes;
    button.querySelector("[data-package-price]").textContent = phonePrices.format(pkg.price) + " EGP";
    button.addEventListener("click", () => {
      if ($phone("phonePay").disabled) return;
      wrap.querySelectorAll(".phone-package").forEach((node) => node.classList.remove("selected"));
      button.classList.add("selected");
      selectedPackage = pkg;
      updatePhonePrice();
    });
    wrap.appendChild(button);
    if (index === 1) selectedPackage = pkg;
  });
  updatePhonePrice();
}

function updatePhonePrice() {
  if (!selectedPackage) return;
  const price = phonePrices.format(selectedPackage.price);
  $phone("phoneTimeChoice").textContent = selectedPackage.minutes + " min";
  $phone("phonePrice").textContent = price + " EGP";
  $phone("phoneLimit").textContent = selectedPackage.minutes + " min";
  $phone("phonePay").textContent = "Pay " + price + " EGP (simulated)";
}

// Simulated smart-pole telemetry for the phone charging service only.
function updatePoleTelemetry(elapsedSeconds = 0) {
  const isWireless = requestedPhoneService.type === "wireless";
  const elapsedMinutes = Math.max(0, elapsedSeconds) / 60;
  const batteryUsePerMinute = isWireless ? 0.1 : 0.07;
  const batteryPercent = Math.max(0, Math.round(86 - elapsedMinutes * batteryUsePerMinute));
  const startingTemp = isWireless ? 30 : 29;
  const warmingPerMinute = isWireless ? 0.1 : 0.07;
  const smallSensorVariation = elapsedSeconds > 0 ? Math.sin(elapsedSeconds / 20) * 0.15 : 0;
  const temperature = startingTemp + elapsedMinutes * warmingPerMinute + smallSensorVariation;

  $phone("poleBatteryValue").textContent = batteryPercent + "%";
  $phone("poleBatteryFill").style.width = batteryPercent + "%";
  $phone("poleBatteryMeter").setAttribute("aria-valuenow", batteryPercent);
  $phone("poleTemperatureValue").textContent = temperature.toFixed(1) + " °C";
  $phone("poleTemperatureNote").textContent = temperature < 35
    ? "Normal operating range"
    : "Warm during charging · simulated";
}

function payForPhoneSession() {
  const button = $phone("phonePay");
  button.disabled = true;
  button.textContent = "Processing simulated payment…";
  window.setTimeout(() => {
    $phone("phonePaidNotice").textContent = "Simulated payment accepted for " + selectedPackage.minutes + " minutes on " + selectedPort + ". No real money was charged.";
    $phone("phonePaidNotice").hidden = false;
    $phone("phoneStart").disabled = false;
    $phone("phonePayNote").textContent = "Payment succeeded. Start charging when you’re ready.";
    $phone("phonePorts").querySelectorAll("button").forEach((node) => { node.disabled = true; });
    $phone("phonePackages").querySelectorAll("button").forEach((node) => { node.disabled = true; });
    button.textContent = "Paid (simulated)";
  }, 800);
}

function startPhoneSession() {
  if (!selectedPackage || phoneTimer) return;
  phoneStartedAt = Date.now();
  const totalSeconds = selectedPackage.minutes * 60;
  $phone("phoneSetup").hidden = true;
  $phone("phoneSession").hidden = false;
  $phone("phoneSessionState").textContent = "Charging · " + selectedPort;
  $phone("phoneSessionState").classList.add("is-charging");
  $phone("phonePulse").hidden = false;
  $phone("phoneStop").disabled = false;
  $phone("phoneSessionNote").textContent = "Live session timer · demo service, no hardware control.";
  updatePhoneTimer(totalSeconds);
  phoneTimer = window.setInterval(() => {
    if (updatePhoneTimer(totalSeconds)) endPhoneSession("Purchased time reached. Session complete.");
  }, 1000);
}

function updatePhoneTimer(totalSeconds) {
  const elapsed = Math.min(totalSeconds, Math.floor((Date.now() - phoneStartedAt) / 1000));
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  $phone("phoneElapsed").textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  $phone("phoneProgress").style.width = (elapsed / totalSeconds * 100) + "%";
  updatePoleTelemetry(elapsed);
  return elapsed >= totalSeconds;
}

function endPhoneSession(message) {
  if (!phoneStartedAt) return;
  const purchasedSeconds = selectedPackage ? selectedPackage.minutes * 60 : Infinity;
  const elapsed = Math.min(purchasedSeconds, Math.floor((Date.now() - phoneStartedAt) / 1000));
  updatePoleTelemetry(elapsed);
  window.clearInterval(phoneTimer);
  phoneTimer = null;
  $phone("phoneSessionState").textContent = "Session ended";
  $phone("phoneSessionState").classList.remove("is-charging");
  $phone("phonePulse").hidden = true;
  $phone("phoneStop").disabled = true;
  $phone("phoneSessionNote").textContent = message;
}

initPhonePage();
