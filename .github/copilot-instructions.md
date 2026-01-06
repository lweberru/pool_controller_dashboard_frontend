# Pool Controller Dashboard Frontend

## Project Overview
Custom Lovelace card (Home Assistant) for the Pool Controller integration. Single-file distribution via HACS as a frontend plugin. No build step, no dependencies—pure vanilla JavaScript targeting modern browser APIs in Home Assistant context.

## Architecture
- **Single-file bundle**: [main.js](../main.js) (546 lines) contains everything—custom card, config editor, styles, and calendar integration
- **Custom element pattern**: Defines two web components:
  - `PoolControllerCard`: Main UI rendering shadow DOM with inline styles
  - `PoolControllerCardEditor`: Visual config editor with entity picker and auto-discovery
- **Integration dependency**: Designed to work with `pool_controller` backend integration (separate repo: https://github.com/lweberru/pool_controller)
- **HACS distribution**: Configured via [hacs.json](../hacs.json) with `content_in_root: true` to serve `main.js` directly

## Key Patterns & Conventions

### Entity Management
- **Config-driven entities**: All entities (climate, sensors, switches, buttons) are referenced via config keys like `climate_entity`, `bathing_start`, `ph_entity`
- **Auto-discovery from config entry**: Editor includes "Automatisch aus Instanz übernehmen" button that queries Home Assistant's entity registry to find all entities from the same `pool_controller` config entry
  - Uses unique_id suffix matching (`_climate`, `_status`, `_aux`, etc.) to map entities to config keys
  - Example in [main.js](../main.js#L433-L463): `_deriveFromController()` method
- **Service calls**: Uses `this._hass.callService(domain, service, data)` pattern—no direct entity state modification
  - Climate control: `climate.set_temperature`
  - Mode triggers: Detects entity domain (button/switch/input_boolean) and calls appropriate service

### State & Rendering
- **Shadow DOM with inline styles**: All CSS embedded in template literals for isolation—no external stylesheets
- **Manual re-render on hass updates**: `set hass(hass)` triggers `_render()` which rebuilds entire shadow DOM innerHTML
  - No virtual DOM or diffing—acceptable for 1-2 second refresh cycles in HA
  - Event handlers re-attached after each render via `_attachHandlers()`
- **Helper methods for state parsing**: 
  - `_num(v)`: Safe number coercion returning `null` on failure
  - `_isOn(stateObj)`: Multi-state check for "on", "heat", "heating"
  - `_modeState(h, entity, untilEntity, fallbackActiveEntity)`: Complex state computation for timed modes (bathing, filtering) with ETA calculation

### Calendar Integration
- **WebSocket API for events**: Uses `this._hass.callWS({ type: "calendar/list_events", ... })` to fetch from multiple calendar entities
- **Simple client-side caching**: `this._calendarCache` stores events for 60 seconds to reduce API calls
  - No invalidation—relies on time-based expiry
- **Promise.allSettled pattern**: Fetches multiple calendars in parallel, gracefully handles failures

### UI/UX Specifics
- **Dial visualization**: Circular temperature display with conic-gradient ring
  - Angle calculation: `_calcDial()` maps temp to 300deg arc (30-330deg, leaving 60deg gap)
  - Accent color changes when aux heater active (`--accent` CSS variable)
- **Water quality bars**: pH uses rainbow gradient (acid→neutral→alkaline), chlorine uses red→green→yellow→red
  - Marker positioning via inline `left: ${pct}%` with absolute positioning
- **German localization**: All UI text hardcoded in German ("Baden", "Filtern", "Chloren", "Wasserqualität", etc.)

### Config Defaults
Defined in `DEFAULTS` constant at [main.js](../main.js#L7-L15):
```javascript
min_temp: 10, max_temp: 40, step: 0.5
chlor_ok_min: 650, chlor_ok_max: 850  // mV thresholds
pv_on: 1000, pv_off: 500  // Watt thresholds for PV logic
show_calendar: 1  // Number of events to display
```

## Development Workflow

### No Build Step
- Edit [main.js](../main.js) directly
- Refresh Home Assistant frontend (Ctrl+F5) to reload
- Use browser DevTools for debugging (custom cards run in main window context, not iframe)

### Testing in Home Assistant
1. Ensure `pool_controller` integration installed and configured
2. Resource must be loaded: `/hacsfiles/pool_controller_dashboard_frontend/main.js` as module
3. Add card: `type: custom:pc-pool-controller` in Lovelace YAML or visual editor
4. Use "Automatisch aus Instanz übernehmen" in config editor to populate entities

### Common Debugging
- **Card not registered**: Check browser console for `customElements.define` errors—likely syntax error in main.js
- **Entities not found**: Config editor shows derived entities in badge row—verify entity IDs match backend's unique_id suffixes
- **Calendar not loading**: Check Network tab for `calendar/list_events` WebSocket messages—requires `calendar_entities` array in config

## Gotchas & Edge Cases
- **Multiple wrapper elements**: Card is wrapped twice—outer `custom:pc-pool-controller` element creates inner `pc-pool-controller-card` element (see bottom of [main.js](../main.js#L533-L545))
- **getConfigElement async but not awaited**: Lovelace expects synchronous return but method is async—works due to immediate `document.createElement` return
- **No TypeScript**: HA frontend is TypeScript but custom cards can be vanilla JS—no type checking, rely on runtime
- **Service call domains**: Button entities use `button.press` (no turn_on/turn_off), switches and input_booleans have separate domains
