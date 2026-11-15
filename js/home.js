const list = document.getElementById("stations");
const summary = document.getElementById("summary");
const cardTemplate = document.getElementById("stationCardTemplate");

function createCard(station, index) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const type = station.type || "ev";
  const isPhone = type === "wired" || type === "wireless";
  card.classList.add("is-" + station.status, "is-service-" + type);
  card.href = (isPhone ? "phone.html" : "station.html") + "?id=" + encodeURIComponent(station.id);
  card.style.setProperty("--i", index); // used for the staggered entrance animation
  const serviceLabel = type === "wired" ? "USB PHONE CHARGING" : type === "wireless" ? "WIRELESS PHONE CHARGING" : "EV CHARGING";
  const spec = isPhone
    ? (type === "wired" ? "USB-C" : "Qi") + " · " + Math.round(station.powerKw * 1000) + " W"
    : station.voltage + " V · " + station.current + " A";
  card.querySelector("[data-card-id]").textContent = station.id + " · " + serviceLabel;
  const status = card.querySelector("[data-card-status]");
  status.classList.add("status--" + station.status);
  status.textContent = STATUS_LABELS[station.status];
  card.querySelector("[data-card-name]").textContent = station.name;
  card.querySelector("[data-card-location]").textContent = station.location;
  card.querySelector("[data-card-spec]").textContent = spec;
  card.querySelector("[data-card-go]").textContent = (station.status === "offline" ? "View" : "Select") + " →";
  card.querySelector("[data-ev-art]").hidden = isPhone;
  card.querySelector("[data-phone-art]").hidden = !isPhone;
  card.querySelector("[data-card-floor]").hidden = !isPhone;
  card.querySelector("[data-service-icon]").textContent = type === "wired" ? "⌁" : "◎";
  return card;
}

STATIONS.forEach((station, index) => list.appendChild(createCard(station, index)));

const availableCount = STATIONS.filter((s) => s.status === "available").length;
summary.textContent = availableCount + " of " + STATIONS.length + " stations available right now.";
