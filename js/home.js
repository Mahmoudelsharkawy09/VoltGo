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
  const evCar = station.type === "ev" ? `
    <svg class="ev-car-illustration" viewBox="0 0 240 120" aria-hidden="true">
      <path class="ev-car-body" d="M26 73 38 66l17-25c4-6 10-9 17-9h62c9 0 17 4 23 11l20 23 23 6c8 2 13 8 13 16v8H27z"/>
      <path class="ev-car-window" d="m65 62 13-20h31v20zm52 0V42h16c6 0 11 3 15 8l11 12z"/>
      <path class="ev-car-trim" d="M29 76h181M36 85h14m128 0h14"/>
      <circle class="ev-car-wheel" cx="68" cy="91" r="15"/><circle class="ev-car-wheel-core" cx="68" cy="91" r="6"/>
      <circle class="ev-car-wheel" cx="174" cy="91" r="15"/><circle class="ev-car-wheel-core" cx="174" cy="91" r="6"/>
      <path class="ev-charge-port" d="M191 68h7m-3-4v8"/>
      <path class="ev-charge-cable" d="M199 69c17 0 17-25 34-25"/>
    </svg>` : "";

  card.innerHTML = `
    <div class="card-top">
      <span class="card-id">${station.id} · ${serviceLabel}</span>
      <span class="status status--${station.status}">${STATUS_LABELS[station.status]}</span>
    </div>

    <h2 class="card-name">${station.name}</h2>
    <p class="card-location">${station.location}</p>

    <div class="charger-stage" aria-hidden="true">
      <div class="charger-glow"></div>
      ${evCar}
      <div class="charger-model">
        <div class="charger-face">
          <span class="charger-logo">V<span>G</span></span>
          <span class="charger-bolt">${serviceIcon}</span>
          <span class="charger-light"></span>
          <span class="charger-slot"></span>
        </div>
        <div class="charger-side"></div>
        <div class="charger-foot"></div>
      </div>
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
