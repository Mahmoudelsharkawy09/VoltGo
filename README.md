# VoltGo – low-voltage EV charging prototype

A small website for a graduation project. Plain HTML, CSS and JavaScript. No frameworks, no build step, no installs.

**Everything is simulated.** The station readings, the camera preview and the payment are demo code. No real payment is taken and no real charger is controlled.

## Run it

1. Open the `voltgo` folder.
2. Double-click `index.html` (it opens in your browser).

That is all. If you prefer a local server, run `python3 -m http.server` inside the folder and open `http://localhost:8000`.

## Files

```
voltgo/
├── index.html        Home page: choose a station
├── station.html      Station details page (one page for every station)
├── css/style.css     All styling. Colors are at the top in :root
└── js/
    ├── theme.js      Light / night mode switch (remembers the choice)
    ├── stations.js   Station data (edit this to add stations)
    ├── home.js       Builds the station cards
    └── station.js    Readings, price calculation, payment, charging, summary
```

## Add a station

Open `js/stations.js`, copy one station block, and change the `id`, `name` and the other values:

```js
{
  id: "VG-04",
  name: "Library",
  location: "Next to the library",
  status: "available",   // or "offline"
  voltage: 48,
  current: 10,
  pricePerKwh: 4.0,
},
```

Save and refresh. The new card appears on the home page and its details page works automatically. Each `id` must be unique.

## Change settings

- **Price:** `pricePerKwh` for each station in `js/stations.js`.
- **Session limits, preset buttons, demo speed:** the settings at the top of `js/station.js`. `SIM_SPEED` makes the demo faster than real time so a session finishes in seconds.
- **Colors:** the variables at the top of `css/style.css`. Light colors are in `:root`, night colors are in `:root[data-theme="dark"]`.
- **Night mode:** the button in the header switches it. The site starts in light mode and remembers the choice in the browser.

## Connecting real hardware later

The simulated parts are clearly marked in `js/station.js`:

- `showReadings()` – replace the random values with real voltage and current from your device.
- `simulatePayment()` – replace with a call to a real payment provider (done on a server, never directly in the browser).
- `tick()` – replace the calculated energy with the real energy meter value.
- The camera box in `station.html` – replace the placeholder with a real video stream.
