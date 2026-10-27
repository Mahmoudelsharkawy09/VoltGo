// Home page: build one tall card per station found in STATIONS.

const list = document.getElementById("stations");
const summary = document.getElementById("summary");

function createCard(station, index) {
  const card = document.createElement("a");
  card.className = "station-card is-" + station.status + " is-service-" + (station.type || "ev");
  card.href = (station.type === "wired" || station.type === "wireless" ? "phone.html" : "station.html") + "?id=" + encodeURIComponent(station.id);
  card.style.setProperty("--i", index); // used for the staggered entrance animation
  const serviceLabel = station.type === "wired" ? "USB PHONE CHARGING" : station.type === "wireless" ? "WIRELESS PHONE CHARGING" : "EV CHARGING";
  const spec = station.type === "wired" || station.type === "wireless"
    ? (station.type === "wired" ? "USB-C" : "Qi") + " · " + Math.round(station.powerKw * 1000) + " W"
    : station.voltage + " V · " + station.current + " A";
  const serviceIcon = station.type === "wired" ? "⌁" : station.type === "wireless" ? "◎" : "ϟ";
  const chargingUnit = station.type === "ev" ? `
    <img class="ev-smart-art" src="assets/smart-pole-ev.svg" alt="Night scene: VoltGo smart streetlight pole charging an electric car via a cable on the pavement">` : `
    <div class="charger-model">
      <div class="charger-face"><span class="charger-logo">V<span>G</span></span><span class="charger-bolt">${serviceIcon}</span><span class="charger-light"></span><span class="charger-slot"></span></div>
      <div class="charger-side"></div><div class="charger-foot"></div>
    </div>`;
  card.innerHTML = `
    <div class="card-top">
      <span class="card-id">${station.id} · ${serviceLabel}</span>
      <span class="status status--${station.status}">${STATUS_LABELS[station.status]}</span>
    </div>

    <h2 class="card-name">${station.name}</h2>
    <p class="card-location">${station.location}</p>

    <div class="charger-stage" aria-hidden="true">
      ${chargingUnit}
      <div class="charger-floor"></div>
    </div>

    <div class="card-foot">
      <span class="card-spec">${spec}</span>
      <span class="card-go">${station.status === "offline" ? "View" : "Select"} &rarr;</span>
    </div>
  `;
  return card;
}

STATIONS.forEach((station, index) => list.appendChild(createCard(station, index)));

const availableCount = STATIONS.filter((s) => s.status === "available").length;
summary.textContent = availableCount + " of " + STATIONS.length + " stations available right now.";
