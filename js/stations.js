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
    type: "ev",
    location: "Building A, ground floor",
    status: "available",
    voltage: 48,
    current: 10,
    pricePerKwh: 4.0,
  },
  {
    id: "VG-02",
    name: "Workshop Bay",
    type: "ev",
    location: "Engineering workshop",
    status: "available",
    voltage: 48,
    current: 12,
    pricePerKwh: 4.0,
  },
  {
    id: "VG-03",
    name: "Back Parking",
    type: "ev",
    location: "North parking lot",
    status: "offline",
    voltage: 48,
    current: 10,
    pricePerKwh: 4.0,
  },
  {
    id: "USB-01",
    name: "Wired phone charging",
    location: "USB-A and USB-C ports · charging bay",
    type: "wired",
    status: "available",
    voltage: 5,
    current: 3,
    powerKw: 0.03,
    pricePerKwh: 0,
    ports: [
      { id: "USB-A 1", type: "Standard USB", location: "Near entrance", available: true },
      { id: "USB-C 1", type: "USB Type-C", location: "Center bay", available: true },
      { id: "USB-C 2", type: "USB Type-C", location: "Window side", available: false },
    ],
    packages: [{ minutes: 15, price: 10 }, { minutes: 30, price: 18 }, { minutes: 60, price: 30 }],
  },
  {
    id: "PAD-01",
    name: "Wireless phone charging",
    location: "Qi charging pads · charging bay",
    type: "wireless",
    status: "available",
    voltage: 9,
    current: 1.67,
    powerKw: 0.015,
    pricePerKwh: 0,
    ports: [
      { id: "Qi pad 1", type: "Wireless pad", location: "Near entrance", available: true },
      { id: "Qi pad 2", type: "Wireless pad", location: "Center bay", available: false },
      { id: "Qi pad 3", type: "Wireless pad", location: "Window side", available: false },
    ],
    packages: [{ minutes: 15, price: 10 }, { minutes: 30, price: 18 }, { minutes: 60, price: 30 }],
  },
];

// Shared by both pages
const STATUS_LABELS = {
  available: "Available",
  offline: "Offline",
};

// Power in kW, calculated from the rated voltage and current
function stationPowerKw(station) {
  return station.powerKw || (station.voltage * station.current) / 1000;
}
