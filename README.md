# WattWise — Smart Energy Saver (SDG 7)

A responsive front-end student project that estimates household appliance electricity consumption and cost. This edition uses a royal-blue and metallic-gold theme and adds saved daily and weekly estimated electricity-cost limits with a custom warning modal.

## Files
- `index.html` — page structure and forms
- `styles.css` — responsive navy, royal-blue and gold design
- `app.js` — calculations, charts, appliance management, persistence and limit warnings

## Run locally
1. Open this folder in Visual Studio Code.
2. Open `index.html` in a browser, or use the Live Server extension.
3. Internet is needed for Google Fonts and Chart.js CDN. The calculator still works without Chart.js, but the doughnut chart requires the Chart.js library to load.

## Features
- Appliance calculator: wattage, quantity and daily operating hours
- Daily, weekly and monthly kWh/cost estimates
- User-defined tariff in naira per kWh
- Monthly summary metrics and doughnut chart
- Add, edit, remove, clear and load sample appliances
- Daily and weekly estimated cost limits saved in `localStorage`
- Custom accessible limit-exceeded modal that reports exact overage
- Responsive layout and energy-saving suggestions

## Formulas
Daily energy (kWh) = watts × quantity × hours/day ÷ 1,000.
Period energy (kWh) = daily energy × number of days (1, 7 or 30).
Estimated cost = energy (kWh) × tariff (₦/kWh).

Daily and weekly limits refer to estimated electricity COST, not kWh or a live prepaid-meter balance. Weekly cost is the daily estimate multiplied by seven. A modal is shown when adding/updating an appliance or changing the tariff causes a total to cross a saved limit. Saving a limit lower than the current total also triggers a warning.

## Important limitations
- This is an estimate, not a live electricity meter reading.
- Appliance power, runtime and tariff are entered by the user.
- Local storage is tied to the current browser/device and can be cleared by the user.
- It does not connect to a utility provider, prepaid meter or actual carbon-emissions dataset.
- The sample tariff of ₦100/kWh is illustrative only; use the tariff that applies to the consumer.


## Recent additions
- One-second WattWise branded splash screen before the dashboard.
- Meter connection explainer: distinguishes a whole-home meter reading from appliance-level monitoring. The button is informational only; no hardware is connected.
- JavaScript comments explain the major calculation, rendering, storage, and event-handling sections.
- Project report: see `WattWise_Project_Report.pdf` (provided separately with the project ZIP).

## Meter integration note
A single main meter usually measures whole-property consumption, not the individual consumption of each appliance. For appliance-level readings, use compatible metering smart plugs or circuit-level sub-meters. A real smart-meter connection also needs a supported interface/API, permission, and a secure integration service.


## Recent additions
- One-second WattWise branded splash screen before the dashboard.
- Meter connection explainer: distinguishes a whole-home meter reading from appliance-level monitoring. The button is informational only; no hardware is connected.
- JavaScript comments explain the major calculation, rendering, storage, and event-handling sections.
- Project report: see `WattWise_Project_Report.pdf` (provided separately with the project ZIP).

## Meter integration note
A single main meter usually measures whole-property consumption, not the individual consumption of each appliance. For appliance-level readings, use compatible metering smart plugs or circuit-level sub-meters. A real smart-meter connection also needs a supported interface/API, permission, and a secure integration service.


## Recent additions
- One-second WattWise branded splash screen before the dashboard.
- Meter connection explainer: distinguishes a whole-home meter reading from appliance-level monitoring. The button is informational only; no hardware is connected.
- JavaScript comments explain the major calculation, rendering, storage, and event-handling sections.
- Project report: see `WattWise_Project_Report.pdf` (provided separately with the project ZIP).

## Meter integration note
A single main meter usually measures whole-property consumption, not the individual consumption of each appliance. For appliance-level readings, use compatible metering smart plugs or circuit-level sub-meters. A real smart-meter connection also needs a supported interface/API, permission, and a secure integration service.


## Recent additions
- One-second WattWise branded splash screen before the dashboard.
- Meter connection explainer: distinguishes a whole-home meter reading from appliance-level monitoring. The button is informational only; no hardware is connected.
- JavaScript comments explain the major calculation, rendering, storage, and event-handling sections.
- Project report: see `WattWise_Project_Report.pdf` (provided separately with the project ZIP).

## Meter integration note
A single main meter usually measures whole-property consumption, not the individual consumption of each appliance. For appliance-level readings, use compatible metering smart plugs or circuit-level sub-meters. A real smart-meter connection also needs a supported interface/API, permission, and a secure integration service.

## How WattWise Helps Save Energy

WattWise estimates household electricity consumption and cost based on appliance power ratings, usage hours, and the electricity tariff entered by the user. It helps users identify high-consuming appliances, set spending limits, and explore ways to reduce electricity usage.

**Note:** WattWise provides estimates; it does not directly measure individual appliance consumption unless supported hardware is integrated in the future.