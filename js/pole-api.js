// Reads smart-pole telemetry from the n8n webhook. This does not control hardware.
const VOLTGO_API_URL = "https://mahmoud-elsharkawy.duckdns.org/webhook/voltgo-status";
const POLE_REFRESH_MS = 5000;
const poleStatus = document.getElementById("poleConnectionStatus");

window.VoltGoPole = window.VoltGoPole || { isLive: false };

function setPoleConnection(state, label) {
  poleStatus.textContent = label;
  poleStatus.className = "pole-connection-status is-" + state;
}

function showDemoReadings() {
  window.VoltGoPole.isLive = false;
  setPoleConnection("offline", "● Disconnected · demo");
  document.getElementById("poleBatteryVoltage").textContent = "— V";
  document.getElementById("poleSolarCurrent").textContent = "— A";
  document.getElementById("poleTelemetryNote").textContent =
    "Demo readings shown · live n8n data is unavailable.";
  if (typeof window.updatePoleTelemetry === "function") window.updatePoleTelemetry();
}

function displayPoleReadings(data) {
  const battery = Number(data.battery_percent);
  const voltage = Number(data.battery_voltage);
  const current = Number(data.solar_current);
  const temperature = Number(data.temperature);
  if (![battery, voltage, current, temperature].every(Number.isFinite) || battery < 0 || battery > 100) {
    throw new Error("The webhook returned missing or invalid sensor readings.");
  }

  window.VoltGoPole.isLive = true;
  document.getElementById("poleBatteryValue").textContent = battery + "%";
  document.getElementById("poleBatteryFill").style.width = battery + "%";
  document.getElementById("poleBatteryMeter").setAttribute("aria-valuenow", battery);
  document.getElementById("poleBatteryVoltage").textContent = voltage.toFixed(1) + " V";
  document.getElementById("poleSolarCurrent").textContent = current.toFixed(2) + " A";
  document.getElementById("poleTemperatureValue").textContent = temperature.toFixed(1) + " °C";
  document.getElementById("poleTemperatureNote").textContent = temperature < 35
    ? "Normal operating range"
    : "High temperature · check pole";
  document.getElementById("poleTelemetryNote").textContent = "Live sensor data · updated every 5 seconds.";
  setPoleConnection("live", "● Online · n8n");
}

async function updatePoleDashboard() {
  try {
    const response = await fetch(VOLTGO_API_URL, { method: "GET", cache: "no-store" });
    if (!response.ok) throw new Error("Webhook returned HTTP " + response.status);
    const payload = await response.json();
    const data = Array.isArray(payload) ? payload[0] : payload;
    if (!data || data.status !== "online") {
      window.VoltGoPole.isLive = false;
      setPoleConnection("offline", "● Pole offline");
      document.getElementById("poleBatteryVoltage").textContent = "— V";
      document.getElementById("poleSolarCurrent").textContent = "— A";
      document.getElementById("poleTelemetryNote").textContent = "Pole reported offline · demo readings shown.";
      if (typeof window.updatePoleTelemetry === "function") window.updatePoleTelemetry();
      return;
    }
    displayPoleReadings(data);
  } catch (error) {
    showDemoReadings();
    console.error("VoltGo n8n webhook error:", error);
  }
}

if (poleStatus) {
  updatePoleDashboard();
  window.setInterval(updatePoleDashboard, POLE_REFRESH_MS);
}
