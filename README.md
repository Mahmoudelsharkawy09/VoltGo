# VoltGo – low-voltage EV charging prototype

A small website for a graduation project. Plain HTML, CSS and JavaScript. No frameworks, no build step, no installs. Home cards cover EV, wired phone and wireless phone charging.

**Charging and payments are demos.** EV readings are simulated; phone sessions use a demo timer; no charger is controlled and no real payment is taken. The optional camera preview uses the camera available to this browser after permission is granted. It does not connect to a station-mounted camera, record, or analyze video.

## Run it

1. Open this project folder (`New folder`).
2. Double-click `index.html` (it opens in your browser).

That is all. The site starts in night mode; the header button switches to light mode and remembers your choice. If you prefer a local server, run `python3 -m http.server` inside the folder and open `http://localhost:8000`.

## Files

```
voltgo/
├── index.html        Home page: choose a station
├── station.html      EV station details and live camera preview
├── phone.html        Shared wired/wireless phone charging page
├── css/style.css     All styling. Colors are at the top in :root
└── js/
    ├── theme.js      Light / night mode switch (remembers the choice)
    ├── stations.js   Station data (edit this to add stations)
    ├── home.js       Builds the station cards
    ├── station.js    EV readings, payment, session, and camera preview
    └── phone.js      Phone ports, packages, simulated checkout, timed session
```

## Add a station

Open `js/stations.js`, copy one station block, and change the `id`, `name` and the other values:

```js
{
  id: "VG-04",
  name: "Library",
  location: "Next to the library",
  type: "ev",
  status: "available",   // or "offline"
  voltage: 48,
  current: 10,
  pricePerKwh: 4.0,
},
```

Save and refresh. The new card appears on the home page and its EV details page works automatically. Each `id` must be unique. Phone services use `type: "wired"` or `"wireless"`, plus `ports` and `packages` arrays; see the `USB-01` and `PAD-01` examples in `js/stations.js`.

## Change settings

- **Price:** `pricePerKwh` for each station in `js/stations.js`.
- **Session limits, preset buttons, demo speed:** the settings at the top of `js/station.js`. The estimate uses requested energy and rated station power. During an EV session, simulated voltage and current vary smoothly around station ratings; displayed power and delivered energy use those same readings. `SIM_SPEED` makes demo progress faster than real time. “Session runtime” is wall-clock time for the demo. Phone package timers use wall-clock time.
- **Colors:** the variables at the top of `css/style.css`. Light colors are in `:root`, night colors are in `:root[data-theme="dark"]`.
- **Night mode:** the site starts in night mode; the header button switches to light mode and remembers the choice in the browser.

## Connecting real hardware later

The animated 3D charging columns and service station models are CSS illustrations. On an EV detail page, **Turn on camera preview** requests browser permission and shows a live local camera preview beside the illustration. The feed is not recorded or analyzed. The simulated parts are clearly marked in `js/station.js`:

- `showReadings()` – replace the smooth demo readings with real voltage and current from your device.
- `simulatePayment()` – replace with a call to a real payment provider (done on a server, never directly in the browser).
- `tick()` – replace the calculated energy with the real energy meter value.
- Browser camera preview is local only. A real charger-camera system would need a supported hardware feed and appropriate backend connection.
