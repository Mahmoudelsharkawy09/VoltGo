const $phone = (id) => document.getElementById(id);
const requestedPhoneService = STATIONS.find((item) => item.id === new URLSearchParams(location.search).get("id") && ["wired", "wireless"].includes(item.type));
const phonePrices = new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 });
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
  $phone("phonePay").addEventListener("click", payForPhoneSession);
  $phone("phoneStart").addEventListener("click", startPhoneSession);
  $phone("phoneStop").addEventListener("click", () => endPhoneSession("Session stopped by customer."));
  window.addEventListener("pagehide", () => window.clearInterval(phoneTimer));
}

function renderPorts(item) {
  const wrap = $phone("phonePorts");
  item.ports.forEach((port, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "phone-port" + (port.available && !selectedPort ? " selected" : "") + (port.available ? "" : " is-closed");
    button.disabled = !port.available;
    button.innerHTML = `<span class="phone-port-dot"></span><span><strong>${port.id} <small class="phone-port-type">${port.type}</small></strong><small>${port.available ? port.location : "Closed · unavailable"}</small></span><span class="phone-port-check">${port.available ? "✓" : "×"}</span>`;
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "phone-package" + (index === 1 ? " selected" : "");
    button.innerHTML = `<strong>${pkg.minutes}<small> min</small></strong><span>${phonePrices.format(pkg.price)} EGP</span>`;
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
  return elapsed >= totalSeconds;
}

function endPhoneSession(message) {
  if (!phoneStartedAt) return;
  window.clearInterval(phoneTimer);
  phoneTimer = null;
  $phone("phoneSessionState").textContent = "Session ended";
  $phone("phoneSessionState").classList.remove("is-charging");
  $phone("phonePulse").hidden = true;
  $phone("phoneStop").disabled = true;
  $phone("phoneSessionNote").textContent = message;
}

initPhonePage();
