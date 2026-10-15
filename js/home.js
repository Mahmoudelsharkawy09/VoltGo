// Home page: build one tall card per station found in STATIONS.

const list = document.getElementById("stations");
const summary = document.getElementById("summary");

function createCard(station, index) {
  const card = document.createElement("a");
  card.className = "station-card is-" + station.status;
  card.href = "station.html?id=" + encodeURIComponent(station.id);
  card.style.setProperty("--i", index); // used for the staggered entrance animation

  card.innerHTML = `
    <div class="card-top">
      <span class="card-id">${station.id}</span>
      <span class="status status--${station.status}">${STATUS_LABELS[station.status]}</span>
    </div>

    <h2 class="card-name">${station.name}</h2>
    <p class="card-location">${station.location}</p>

    <div class="energy" aria-hidden="true">
      <div class="energy-fill"></div>
    </div>

    <div class="card-foot">
      <span class="card-spec">${station.voltage} V &middot; ${station.current} A</span>
      <span class="card-go">${station.status === "offline" ? "View" : "Select"} &rarr;</span>
    </div>
  `;
  return card;
}

STATIONS.forEach((station, index) => list.appendChild(createCard(station, index)));

const availableCount = STATIONS.filter((s) => s.status === "available").length;
summary.textContent = availableCount + " of " + STATIONS.length + " stations available right now.";
