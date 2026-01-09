# Pool Controller Dashboard Frontend (Home Assistant Lovelace Card)

## Überblick
- Single-file HACS-Frontend-Plugin ohne Build/Deps: alles in [main.js](../main.js), ausgeliefert via [hacs.json](../hacs.json) (`content_in_root: true`).
- Abhängigkeit: Backend-Integration `pool_controller` (separates Repo). Ziel: UI funktioniert YAML-first mit nur `climate_entity`.

## Workspace / Releases
- Workspace-weite Hinweise (Cross-Repo Vertrag + Release-basierter HACS Deploy/Test): [pool_controller/AGENTS.md](../../pool_controller/AGENTS.md)

## Architektur / Datenfluss
- Web Components: `pc-pool-controller-card` (UI) + `pc-pool-controller-editor` (Konfiguration) + Wrapper `custom:pc-pool-controller` am Dateiende.
- Rendering: `set hass()` triggert `_render()` (Shadow DOM, komplettes `innerHTML` neu) und danach `_attachHandlers()`.
- Performance: `_hasRelevantChanges(oldHass, hass)` begrenzt Re-Renders auf relevante Entities.

## Entity-Konventionen
- Config-Keys referenzieren Entities (`climate_entity`, `ph_entity`, `manual_timer_entity`, …). Defaults liegen in `DEFAULTS` in [main.js](../main.js).
- Auto-Discovery: `_ensureDerivedEntities()`/`_deriveFromController()` liest `config/entity_registry/list` und mappt per `unique_id`-Suffix (z. B. `_ph_val`, `_manual_timer_mins`).
- Timer-Modelle:
  - bevorzugt neue Minuten-Sensoren (`*_timer_entity` mit `state=ETA` + Attrs `active`, `duration_minutes`, `type`)
  - Fallback auf Legacy-Entities (`*_until`, `*_start`, `*_stop`, `*_active_binary`).

## Service-/WS-Aufrufe
- Temperatur: `climate.set_temperature` (optimistic UI update, dann Service call).
- Aktionen (Baden/Filtern/Chloren/Pause): bevorzugt `pool_controller.start_*`/`stop_*` mit `climate_entity`; Fallback zu `button.press`/`switch.turn_on/off`/`input_boolean.turn_on/off`.
- More-Info: dispatch `hass-more-info` Event mit `entityId`.

## i18n / UI-Regeln
- Strings über `I18N` + `_t()` (de/en/es/fr). Keine externen Libraries hinzufügen.
- Änderungen an Config-Keys: immer `DEFAULTS` + Editor-UI (in [main.js](../main.js)) konsistent halten und Legacy-Fallback nicht brechen.

## Dev-Workflow
- Lokal: `main.js` editieren → HA Frontend hard reload (Ctrl+F5) / Cache leeren.
- Debug: Browser DevTools Console (Custom Card läuft im HA Hauptfenster, kein iframe).
