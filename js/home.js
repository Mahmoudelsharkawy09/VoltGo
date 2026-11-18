const list = document.getElementById("stations");
const summary = document.getElementById("summary");
const cardTemplate = document.getElementById("stationCardTemplate");
const picker = document.getElementById("servicePicker");
const browser = document.getElementById("stationBrowser");
const intro = document.getElementById("homeIntro");
const serviceCounts = {
  ev: STATIONS.filter((station) => (station.type || "ev") === "ev"),
  phone: STATIONS.filter((station) => station.type === "wired" || station.type === "wireless"),
};

document.querySelectorAll("[data-service-count]").forEach((label) => {
  const stations = serviceCounts[label.dataset.serviceCount];
  const count = stations.length;
  label.textContent = count + (label.dataset.serviceCount === "ev" ? " stations" : " options");
});

function createCard(station, index) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const type = station.type || "ev";
  const isPhone = type === "wired" || type === "wireless";
  card.dataset.category = isPhone ? "phone" : "ev";
  card.classList.add("is-" + station.status, "is-service-" + type);
  card.href = (isPhone ? "phone.html" : "station.html") + "?id=" + encodeURIComponent(station.id);
  card.style.setProperty("--i", index); // used for the staggered entrance animation
  const serviceLabel = type === "wired" ? "USB CHARGING" : type === "wireless" ? "QI CHARGING" : "EV CHARGING";
  const location = type === "wired" ? "USB-A and USB-C ports" : type === "wireless" ? "Qi wireless pads" : station.location;
  const spec = isPhone
    ? (type === "wired" ? "USB-C" : "Qi") + " · " + Math.round(station.powerKw * 1000) + " W"
    : station.voltage + " V · " + station.current + " A";
  card.querySelector("[data-card-id]").textContent = station.id + " · " + serviceLabel;
  const status = card.querySelector("[data-card-status]");
  status.classList.add("status--" + station.status);
  status.textContent = STATUS_LABELS[station.status];
  card.querySelector("[data-card-name]").textContent = station.name;
  card.querySelector("[data-card-location]").textContent = location;
  card.querySelector("[data-card-spec]").textContent = spec;
  card.querySelector("[data-card-go]").textContent = (station.status === "offline" ? "View" : "Select") + " →";
  card.querySelector("[data-ev-art]").hidden = isPhone;
  card.querySelector("[data-phone-art]").hidden = !isPhone;
  card.querySelector("[data-card-floor]").hidden = !isPhone;
  card.querySelector("[data-service-icon]").textContent = type === "wired" ? "⌁" : "◎";
  return card;
}

STATIONS.forEach((station, index) => list.appendChild(createCard(station, index)));

function showService(category, addHistoryEntry = true) {
  if (addHistoryEntry) history.pushState({ voltgoView: "stations", category }, "");
  const stations = serviceCounts[category];
  intro.hidden = true;
  picker.hidden = true;
  browser.hidden = false;
  document.getElementById("serviceEyebrow").textContent = category === "ev" ? "ELECTRIC VEHICLE" : "PHONE CHARGING";
  document.getElementById("stationsTitle").textContent = category === "ev" ? "Choose a car charging station" : "Choose a phone charging service";
  const available = stations.filter((station) => station.status === "available").length;
  summary.textContent = available + " of " + stations.length + " " + (category === "ev" ? "car stations" : "phone services") + " available right now.";
  list.querySelectorAll(".station-card").forEach((card) => {
    card.hidden = card.dataset.category !== category;
  });
}

document.querySelectorAll("[data-service-choice]").forEach((button) => {
  button.addEventListener("click", () => showService(button.dataset.serviceChoice));
});

function showServicePicker() {
  browser.hidden = true;
  picker.hidden = false;
  intro.hidden = false;
}

window.addEventListener("popstate", (event) => {
  if (event.state?.voltgoView === "stations") {
    showService(event.state.category, false);
  } else {
    showServicePicker();
  }
});

if (history.state?.voltgoView === "stations") {
  showService(history.state.category, false);
} else {
  history.replaceState({ voltgoView: "service-picker" }, "");
}
