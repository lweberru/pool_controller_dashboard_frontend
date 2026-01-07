# Pool Controller Dashboard (Frontend)

This Lovelace custom card is the frontend UI for the Home Assistant integration **pool_controller**.
- Backend integration: https://github.com/lweberru/pool_controller
- This repository (HACS Plugin): ships the single-file resource `main.js`

## Screenshot
![Card example](card_example_1.png)

## Features (high level)
- Thermostat-style dial (current/target temperature)
- Quick actions: **Bathing**, **Filtering**, **Chlorine**, **Pause**
- Optional AUX heater toggle
- Status indicators: Frost protection, Quiet hours, PV surplus
- Water quality: pH, ORP/Chlorine (mV), optional Salt (g/L + %) and TDS (ppm)
- Maintenance hints (e.g. dosing, water change recommendation for high TDS)

## Installation (HACS)

1. In HACS → **Custom repositories** add this repo (Category: **Plugin**)
2. Install
3. Ensure the resource is registered as **JavaScript Module**:
	- `/hacsfiles/pool_controller_dashboard_frontend/main.js`

Note: HACS usually adds the resource automatically.

## Installation (manual)
1. Copy `main.js` to `config/www/pool_controller_dashboard_frontend/`
2. In Home Assistant go to **Settings → Dashboards → Resources** and add as module:
	- `/local/pool_controller_dashboard_frontend/main.js`

## Add the card (UI editor)

Recommended path (because it can auto-map most entities):
1. Open your dashboard → **Edit dashboard**
2. **Add card** → search for “Pool Controller” (custom card)
3. In the card editor select your **Pool Controller** (the `climate.*` entity from `pool_controller`)
4. The editor will auto-fill the related entities (buttons/sensors/binary_sensors) from the same config entry

## Add the card (YAML)
You can also add the card manually via YAML:

```yaml
type: custom:pc-pool-controller
climate_entity: climate.mein_pool
```

### Does auto-discovery work without using the UI editor?

Yes (with one requirement):

- If `climate_entity` belongs to the same `pool_controller` config entry, the card will derive the related entities (buttons/sensors/binary_sensors) from the entity registry at runtime.
- This means **YAML-only** with `type` + `climate_entity` is typically enough to get the full UI (actions, timers, water quality, maintenance).

If entity registry access is blocked/unavailable, only explicitly configured entities will work.

## How to use / meaning of elements

### Temperature dial (left)

- Big number: **current temperature** (measured water temperature)
- Smaller value: **target temperature**
- Dial ring:
	- Progress arc shows current temperature relative to the configured min/max
	- Target marker shows the target temperature
- `+` / `−` buttons: change target temperature (calls `climate.set_temperature`)

### Status icons (inside the dial)

- Frost: frost protection active
- Moon: quiet hours active
- Solar: PV surplus allows heating/filtering

### Actions

- **Bathing**: start/stop bathing mode
- **Filtering**: start/stop filter cycle
- **Chlorine**: start/stop quick chlorine
- **Pause**: pause automation

Depending on the mapped entity type, the card will call `button.press`, `switch.turn_on/off`, or `input_boolean.turn_on/off`.

### AUX heater

- “Additional heater”: toggles the AUX heater (if configured)

## Water quality (right)

- **pH**: scale 0–14
- **Chlorine/ORP**: shown in mV (scale 0–1200)
- **Salt** (optional): shown as g/L plus percent (g/L × 0.1 = %)
- **TDS** (optional): shown in ppm

Salt and TDS bars are rendered when the values are available as sensors (including a value of 0).

## Maintenance

The “Maintenance” section appears when the backend recommends an action, e.g.:

- Add pH+ / pH-
- Add chlorine
- **Water change** (when TDS is high; based on backend recommendation: percent and optionally liters)

## Configuration (key overview)

Required:

- `climate_entity`

Common optional keys (usually filled by the UI editor auto-mapping):

- `aux_entity`
- `bathing_start`, `bathing_stop`, `bathing_until`, `bathing_active_binary`
- `filter_start`, `filter_stop`, `filter_until`, `next_filter_in`
- `chlorine_start`, `chlorine_stop`, `chlorine_until`, `chlorine_active_entity`
- `pause_start`, `pause_stop`, `pause_until`, `pause_active_entity`
- `ph_entity`, `chlorine_value_entity`, `salt_entity`, `tds_entity`
- `tds_assessment_entity`, `water_change_percent_entity`, `water_change_liters_entity`

## Troubleshooting

- After updates: hard reload the browser (Ctrl+F5) and/or clear the HA frontend cache.
- If auto-discovery does not work: verify `climate_entity` is the `pool_controller` climate entity and that the frontend can access the entity registry.
# Pool Controller Dashboard (Frontend)

Diese Lovelace Custom Card ist das Frontend für die Home-Assistant-Integration **pool_controller**.

- Backend-Integration: https://github.com/lweberru/pool_controller
- Diese Card (HACS Plugin): liefert die Single-File-Ressource `main.js`

## Screenshot

![Beispielkarte](card_example_1.png)

## Features (Kurz)

- Temperatur-Dial mit IST/SOLL und ringförmigem Fortschritt
- Schnellaktionen: **Baden**, **Filtern**, **Chloren**, **Pause**
- Zusätzliche Heizung (AUX) schaltbar
- Status-Icons: Frostschutz, Ruhezeit, PV-Überschuss
- Wasserqualität: pH, Chlor (mV), optional Salz (g/L + %) und TDS (ppm)
- Wartungshinweise (z.B. pH+/pH-/Chlor-Dosierung, Wasserwechsel bei hoher TDS)
- Auto-Discovery: zieht Entities aus derselben `pool_controller`-Instanz (Config Entry)

## Installation (HACS)

1. In HACS → **Custom repositories** dieses Repo hinzufügen (Kategorie: **Plugin**)
2. Installieren
3. Prüfen, ob die Ressource als **JavaScript Module** eingetragen ist:
	- `/hacsfiles/pool_controller_dashboard_frontend/main.js`

Hinweis: HACS trägt die Ressource meist automatisch ein.

## Installation (manuell)

1. `main.js` nach `config/www/pool_controller_dashboard_frontend/` kopieren
2. In Home Assistant unter **Einstellungen → Dashboards → Ressourcen** als Modul hinzufügen:
	- `/local/pool_controller_dashboard_frontend/main.js`

## Card hinzufügen

In Lovelace eine Karte hinzufügen:

```yaml
type: custom:pc-pool-controller
climate_entity: climate.mein_pool
```

Danach im visuellen Editor der Karte den Controller auswählen. Wenn möglich werden die zugehörigen Entities automatisch übernommen.

## Bedienung & Bedeutung der Elemente

### Temperatur-Dial (links)

- Große Zahl: **IST-Temperatur** (aktuelle Wassertemperatur)
- Kleine Zahl links im Dial: **SOLL-Temperatur**
- Ring:
  - Farbiger Fortschritt zeigt die IST-Temperatur relativ zu Min/Max
  - Zielmarkierung zeigt die SOLL-Temperatur
- `+` / `−`: SOLL-Temperatur ändern (Service `climate.set_temperature`)

### Status-Icons (im Ring)

- ❄️ Frostschutz: aktiv, wenn der Backend-Status Frost meldet
- 🌙 Ruhezeit: aktiv, wenn aktuell Ruhezeit gilt
- ☀️ PV-Überschuss: aktiv, wenn PV-Logik das Heizen/Filtern erlaubt

### Aktionen

- **Baden**: startet/stoppt Bade-Modus (Timer aus Backend)
- **Filtern**: startet/stoppt Filterlauf
- **Chloren**: startet/stoppt „Quick Chlor“
- **Pause**: pausiert Automatik

Die Buttons rufen – je nach Entity-Typ – `button.press` oder `switch.turn_on/off` bzw. `input_boolean.turn_on/off` auf.

### Zusatzheizung

- „Zusatzheizung“: schaltet die AUX-Heizung, falls konfiguriert

### Nächster Termin

- Optionaler Block „Nächster Termin“ zeigt den nächsten geplanten Start / Kalendertermin, falls entsprechende Sensoren im Backend vorhanden sind.

## Wasserqualität (rechts)

- **pH-Wert**: Skala 0–14
- **Chlor**: Darstellung in mV (ORP), Skala 0–1200
- **Salzgehalt** (optional): Anzeige in g/L plus Umrechnung in Prozent (g/L × 0,1 = %)
- **TDS** (optional): Anzeige in ppm

Die Salz- und TDS-Balken werden angezeigt, sobald die Werte als Sensoren vorhanden sind (auch wenn der Wert 0 ist).

## Wartungsarbeiten

Unter „Wartungsarbeiten“ erscheinen Hinweise, wenn das Backend eine Maßnahme empfiehlt, z.B.:

- pH+ / pH- hinzufügen
- Chlor hinzufügen
- **Wasser wechseln** (bei hoher TDS; basierend auf Backend-Empfehlung: Prozent und ggf. Liter)

## Konfiguration (wichtigste Keys)

Minimal erforderlich:

- `climate_entity` (Pflicht)

Optional (typische Beispiele, werden oft automatisch abgeleitet):

- `aux_entity`
- `bathing_start`, `bathing_stop`, `bathing_until`, `bathing_active_binary`
- `filter_start`, `filter_stop`, `filter_until`, `next_filter_in`
- `chlorine_start`, `chlorine_stop`, `chlorine_until`, `chlorine_active_entity`
- `pause_start`, `pause_stop`, `pause_until`, `pause_active_entity`
- `ph_entity`, `chlorine_value_entity`, `salt_entity`, `tds_entity`
- `tds_assessment_entity`, `water_change_percent_entity`, `water_change_liters_entity`

## Troubleshooting

- Nach Updates: Browser Hard-Reload (`Ctrl+F5`) und ggf. HA-Frontend Cache leeren.
- Wenn Auto-Discovery nicht greift: prüfen, ob die Karte Zugriff auf die Entity Registry hat und die `climate_entity` wirklich aus `pool_controller` stammt.
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
