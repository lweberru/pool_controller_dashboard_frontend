# Contributing (pool_controller_dashboard_frontend)

Danke fürs Mithelfen!

## Repo-Charakter
- Single-file HACS Frontend Plugin: alles in `main.js`.
- Kein Build, keine Dependencies, keine externen Libraries.

## Wichtige Regeln (projektspezifisch)
- UI ist YAML-first: Ziel ist, dass `type: custom:pc-pool-controller` + `climate_entity` in der Regel reicht.
- Auto-Discovery nutzt `config/entity_registry/list` und `unique_id`-Suffixe der Backend-Integration.
  - Änderungen an Auto-Discovery/Entity-Keys müssen den Cross-Repo Vertrag respektieren.
- i18n: Strings nur über `I18N` + `_t()` (de/en/es/fr) in `main.js`.
- Legacy-Fallback nicht brechen: neue Timer-Sensoren werden bevorzugt, aber alte `*_until/*_start/*_stop` werden weiter unterstützt.

## Release/Test-Workflow (kein lokales HA erforderlich)
Dieses Repo wird **über HACS via GitHub Releases** deployt und getestet.

- Version bump: `main.js` → `const VERSION = "x.y.z";`
- Release: GitHub Release erstellen, **Tag-Name = `vX.Y.Z`** (Datei-`VERSION` bleibt `X.Y.Z`)
- Test: in Home Assistant via HACS updaten
  - Frontend-Verifikation: Browser Console zeigt `[pool_controller_dashboard_frontend] loaded vX.Y.Z`.

Konkrete Cross-Repo/Release-Regeln: siehe [pool_controller/AGENTS.md](../pool_controller/AGENTS.md).

## Was in einen PR gehört
- Kurze Beschreibung + Screenshot (wenn UI betroffen)
- Hinweis, ob Auto-Discovery/Config-Keys/Service-Calls betroffen sind
- i18n für de/en/es/fr komplett

## Akzeptanzkriterien (kurz)
- Breaking Changes nur in Major-Releases (und nur mit Migrationshinweisen/Kommunikation).
- Keine Breaking Changes an Auto-Discovery/Config-Keys ohne Legacy-Fallback oder klaren Migrationspfad.
- Keine externen Dependencies/Build-Schritte; alles bleibt in `main.js`.
- i18n bleibt konsistent (de/en/es/fr) und Strings gehen über `I18N`/`_t()`.
- Release-Fähigkeit: `main.js` `VERSION` bump ist Teil der Änderung, wenn HACS-Deploy geplant ist.

## Dateien, die du dir zuerst ansehen solltest
- `main.js`
- `.github/copilot-instructions.md`
