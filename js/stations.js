/* ------------------------------------------------------------
   VoltGo — station data
   To add a station, copy one block below, give it a new unique
   "id", and save. Both pages pick it up automatically.

   status: "available" or "offline"
   voltage / current: simulated rated readings (V and A)
   pricePerKwh: price in EGP for one kWh
   ------------------------------------------------------------ */

const STATIONS = [
  {
    id: "VG-01",
    name: "Main Gate",
    location: "Building A, ground floor",
    status: "available",
    voltage: 48,
    current: 10,
    pricePerKwh: 4.0,
  },
  {
    id: "VG-02",
    name: "Workshop Bay",
    location: "Engineering workshop",
    status: "available",
    voltage: 48,
    current: 12,
    pricePerKwh: 4.0,
  },
  {
    id: "VG-03",
    name: "Back Parking",
    location: "North parking lot",
    status: "offline",
    voltage: 48,
    current: 10,
    pricePerKwh: 4.0,
  },
];

// Shared by both pages
const STATUS_LABELS = {
  available: "Available",
  offline: "Offline",
};

// Power in kW, calculated from the rated voltage and current
function stationPowerKw(station) {
  return (station.voltage * station.current) / 1000;
}
