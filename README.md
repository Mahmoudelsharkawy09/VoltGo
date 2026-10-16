# VoltGo

A simple, responsive website for a low-voltage EV charging system. Built as a graduation project prototype with plain HTML, CSS and JavaScript. No frameworks, no build step, nothing to install.

> **Important:** everything in this prototype is **simulated**. The station readings, the camera preview and the payment are demo code. No real payment is taken and no real charger is controlled.

## Features

**Home page**
- One tall card per charging station, showing its ID, availability status and an animated energy bar.
- Smooth hover effects and a staggered entrance animation.
- Clicking a card opens that station's details page.

**Station details page**
- Station name, ID and online/offline status.
- Simulated voltage, current and power readings.
- Camera preview placeholder.
- Choose charging by money (EGP) or energy (kWh). The other value and the price are calculated automatically.
- Simulated payment. After it succeeds, Start Charging is enabled.
- During charging: consumed energy, cost, remaining balance, progress bar and a Stop button.
- Final session summary with energy delivered, total cost and unused balance.

**General**
- Works on phones and desktop.
- Light mode by default, with a Night mode switch that remembers your choice.

## Run it

1. Download or clone this repository.
2. Open `index.html` in your browser.

Or run a small local server inside the project folder:

```
python3 -m http.server
```

Then open `http://localhost:8000`. (On Windows use `python` or `py` instead of `python3`.)

## Project structure

```
voltgo/
├── index.html        Home page: choose a station
├── station.html      Station details page (one page for every station)
├── css/
│   └── style.css     All styling. Colors are at the top (light and night)
└── js/
    ├── stations.js   Station data. Edit this to add stations
    ├── home.js       Builds the station cards
    ├── station.js    Readings, price calculation, payment, charging, summary
    └── theme.js      Light / night mode switch
```

`css/` and `js/` must stay next to the two HTML pages, or the pages will load without styling.

## Add a station

Open `js/stations.js`, copy one station block, and change the values:

```js
{
  id: "VG-04",           // must be unique
  name: "Library",
  location: "Next to the library",
  status: "available",   // or "offline"
  voltage: 48,
  current: 10,
  pricePerKwh: 4.0,
},
```

Save and refresh. The new card appears on the home page and its details page works automatically.

## Settings you can change

| What | Where |
| --- | --- |
| Price per kWh | `pricePerKwh` for each station in `js/stations.js` |
| Minimum / maximum session, preset buttons, demo speed | the settings at the top of `js/station.js` |
| Colors (light and night) | the variables at the top of `css/style.css` |

`SIM_SPEED` in `js/station.js` makes the demo run faster than real time, so a session finishes in seconds. If you raise the preset EGP buttons, keep them within `MAX_KWH` multiplied by the price per kWh.

## Connecting real hardware later

The simulated parts are marked in `js/station.js`:

- `showReadings()`: replace the random values with real voltage and current from your device.
- `simulatePayment()`: replace with a real payment provider. This must be done on a server, never directly in the browser.
- `tick()`: replace the calculated energy with the real energy meter value.
- The camera box in `station.html`: replace the placeholder with a real video stream.

## Tech

HTML5, CSS3 (custom properties, grid, flexbox) and vanilla JavaScript.
