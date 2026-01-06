# Pool Controller Dashboard (Frontend)

Lovelace Custom Card for the Pool Controller integration. This repository is dedicated to the dashboard UI bundle.

- Integration (backend): https://github.com/lweberru/pool_controller
- Frontend card (this repo): provides `/local/pool_controller_dashboard/main.js`

## Installation (HACS plugin)
1. Add this repo as custom repository in HACS: **Category: Plugin**
2. Install, then ensure the resource is registered as JavaScript module with URL `/hacsfiles/pool_controller_dashboard_frontend/main.js` (HACS usually adds it automatically).
3. If you install manually, copy `main.js` to your HA `config/www/pool_controller_dashboard/` and add resource `/local/pool_controller_dashboard/main.js`.

## Usage (card)
After resource is loaded, add a card of type `custom:pc-pool-controller` and click "Automatisch aus Instanz übernehmen" to pull entities from your `pool_controller` config entry.
