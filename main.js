/**
 * Pool Controller - simplified modular Lovelace card
 * - Single-file HACS frontend plugin
 * - Supports `content` config: controller | calendar | waterquality | maintenance (default: controller)
 */

const VERSION = "2.0.13";
try { console.info(`[pool_controller_dashboard_frontend] loaded v${VERSION}`); } catch (_e) {}

const CARD_TYPE = "pc-pool-controller";
const DEFAULTS = { content: "controller" };

const I18N = {
	de: {
		ui: {
			controller_title: "Steuerung",
			calendar_title: "Kalender",
			waterquality_title: "Wasserqualität",
			maintenance_title: "Wartungsarbeiten",
			select_content: "Angezeigter Inhalt",
			maintenance_mode_title: "Wartungsmodus aktiv",
			maintenance_mode_text: "Automatik ist deaktiviert. Schalte Wartung aus, um Automatik wieder zu erlauben.",
			maintenance: "Wartung",
			water_quality: "Wasserqualität",
			sanitizer: "Desinfektion",
			sanitizer_chlorine: "Chlor",
			sanitizer_saltwater: "Salzwasser",
			sanitizer_mixed: "Mischbetrieb",
			ph: "pH",
			chlorine: "Chlor (mV)",
			salt: "Salz",
			tds: "TDS",
			add_ph_plus: "pH+ hinzufügen",
			add_ph_minus: "pH- hinzufügen",
			add_salt: "Salz hinzufügen",
			add_chlorine: "Chlor hinzufügen",
			low_chlorine: "Niedriger Chlorgehalt",
			mixed_chlor_hint: "Im Mischbetrieb: Chlor-Generator prüfen",
			saltwater_chlor_hint: "Salzwasser: Elektrolyse prüfen statt man. Zugabe",
			change_water: "Wasser wechseln",
			no_actions_needed: "Keine Aktionen notwendig",
			sanitizer_label: "Desinfektion",
			next_event: "Nächstes Ereignis",
			next_filter_cycle: "Nächster Filterlauf",
			next_frost_cycle: "Nächster Frostlauf",
			main_switch: "Netz/Versorgung",
			pump_switch: "Umwälzpumpe",
			aux_heater_switch: "Zusatzheizung",
			pv: "PV",
			frost: "Frostschutz",
			quiet: "Ruhezeit",
			additional_heater: "Zusatzheizung",
			sanitizer: "Desinfektion",
			in_short: "in",
			days_short: "T",
			hours_short: "h",
			minutes_short: "min",
		},
		editor: {
			select_controller: "Controller wählen",
			please_choose: "Bitte wählen",
			temp_min: "Min. Temperatur",
			temp_max: "Max. Temperatur",
			step: "Schrittweite",
			controller_placeholder: "Wähle eine Integration/Instanz",
			content: "Angezeigter Inhalt",
			content_options: {
				controller: "Steuerung",
				calendar: "Kalender",
				waterquality: "Wasserqualität",
				maintenance: "Wartung"
			}
		},
		actions: {
			maintenance: "Wartung",
			bathing: "Baden",
			filter: "Filtern",
			chlorine: "Chloren",
			pause: "Pause"
		},
		tooltips: {
			bathing: { active: "Bade-Modus — verbleibend: {mins} min — Klick beendet", inactive: "Baden für {mins} Minuten starten" },
			filter: { active: "Filter — verbleibend: {mins} min — Klick beendet", inactive: "Filtern für {mins} Minuten starten" },
			chlorine: { active: "Stoßchlorung — verbleibend: {mins} min — Klick beendet", inactive: "Stoßchlorung für {mins} Minuten starten" },
			pause: { active: "Pause — verbleibend: {mins} min — Klick beendet", inactive: "Pause für {mins} Minuten starten" },
			aux: { active: "Zusatzheizung erlauben an", inactive: "Zusatzheizung erlauben aus" }
		},
		dial: {
			bathing_left: "Baden — verbleibend: {mins} min",
			filter_left: "Filtern — verbleibend: {mins} min",
			chlorine_left: "Chloren — verbleibend: {mins} min",
			pause_left: "Pause — verbleibend: {mins} min",
			chlorine_active: "Stoßchlorung — verbleibend: {mins} min",
			frost: "Frostschutz"
		},
		status: {
			maintenance: "Wartung",
			pause: "Pause",
			bathing: "Baden",
			chlorine: "Chloren",
			filter: "Filtern",
			heating: "Heizbetrieb",
			off: "Aus"
		}
	},
	en: {
		ui: {
			controller_title: "Controller",
			calendar_title: "Calendar",
			waterquality_title: "Water quality",
			maintenance_title: "Maintenance",
			select_content: "Displayed content",
			maintenance_mode_title: "Maintenance mode active",
			maintenance_mode_text: "Automation is disabled. Turn off maintenance to resume automation.",
			maintenance: "Maintenance",
			water_quality: "Water quality",
			sanitizer: "Sanitizer",
			sanitizer_chlorine: "Chlorine",
			sanitizer_saltwater: "Saltwater",
			sanitizer_mixed: "Mixed",
			ph: "pH",
			chlorine: "Chlorine (mV)",
			salt: "Salt",
			tds: "TDS",
			add_ph_plus: "Add pH+",
			add_ph_minus: "Add pH-",
			add_salt: "Add salt",
			add_chlorine: "Add chlorine",
			low_chlorine: "Low chlorine",
			mixed_chlor_hint: "Mixed mode: check chlorinator",
			saltwater_chlor_hint: "Saltwater: use chlorinator instead of manual dosing",
			change_water: "Change water",
			no_actions_needed: "No actions needed",
			sanitizer_label: "Sanitizer",
			next_event: "Next event",
			next_filter_cycle: "Next filter cycle",
			next_frost_cycle: "Next frost run",
			main_switch: "Main supply",
			pump_switch: "Pump",
			aux_heater_switch: "Aux heater",
			pv: "PV",
			frost: "Frost protection",
			quiet: "Quiet hours",
			additional_heater: "Auxiliary heater",
			in_short: "in",
			days_short: "d",
			hours_short: "h",
			minutes_short: "min",
		},
		editor: {
			select_controller: "Select controller",
			please_choose: "Please choose",
			temp_min: "Min temperature",
			temp_max: "Max temperature",
			step: "Step",
			controller_placeholder: "Select an integration/instance",
			content: "Displayed content",
			content_options: {
				controller: "Controller",
				calendar: "Calendar",
				waterquality: "Water quality",
				maintenance: "Maintenance"
			}
		},
		actions: {
			maintenance: "Maintenance",
			bathing: "Bathing",
			filter: "Filter",
			chlorine: "Chlorine",
			pause: "Pause"
		},
		tooltips: {
			bathing: { active: "Bathing — left: {mins} min — click to stop", inactive: "Start bathing for {mins} minutes" },
			filter: { active: "Filter — left: {mins} min — click to stop", inactive: "Start filter for {mins} minutes" },
			chlorine: { active: "Quick chlorine — left: {mins} min — click to stop", inactive: "Start quick chlorine for {mins} minutes" },
			pause: { active: "Pause — left: {mins} min — click to stop", inactive: "Start pause for {mins} minutes" },
			aux: { active: "Allow auxiliary heater on", inactive: "Allow auxiliary heater off" }
		},
		dial: {
			bathing_left: "Bathing — left: {mins} min",
			filter_left: "Filter — left: {mins} min",
			chlorine_left: "Chlorine — left: {mins} min",
			pause_left: "Pause — left: {mins} min",
			chlorine_active: "Quick — left: {mins} min",
			frost: "Frost protection"
		},
		status: {
			maintenance: "Maintenance",
			pause: "Pause",
			bathing: "Bathing",
			chlorine: "Chlorine",
			filter: "Filter",
			heating: "Heating",
			off: "Off"
		}
	}
};

function _langFromHass(hass) { return (hass?.language || hass?.locale?.language || 'de').split('-')[0]; }
function _t(lang, key, vars) {
	const dict = I18N[lang] || I18N.de;
	const parts = key.split('.');
	let cur = dict;
	for (const p of parts) cur = cur?.[p];
	let res = (typeof cur === 'string') ? cur : key;
	if (vars && typeof vars === 'object') {
		for (const k of Object.keys(vars)) {
			try {
				res = String(res).replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
			} catch (_e) {
				// ignore replacement errors
			}
		}
	}
	return res;
}

class PoolControllerCard extends HTMLElement {
	setConfig(config) {
		if (!config || !config.climate_entity) {
			throw new Error(_t("de", "errors.required_climate"));
		}
		this._config = { ...DEFAULTS, ...config };
		this._derivedEntities = null;
		this._derivedForClimate = null;
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
		}
		this._render();
	}

	set hass(hass) {
		const oldHass = this._hass;
		this._hass = hass;
		// Während Dial-Drag: UI nicht neu aufbauen (würde Pointer-Interaktion / Hover stören)
		if (this._isDraggingDial) return;
		// Nur rendern wenn sich relevante States geändert haben (wie native HA Components)
		if (!oldHass || this._hasRelevantChanges(oldHass, hass)) {
			this._render();
		}
	}

	connectedCallback() {
		this._render();
	}

	getCardSize() {
		return 5;
	}

	// ========================================
	// MODULAR: Haupt-Render orchestriert alles
	// ========================================
	async _render() {
		if (!this._hass || !this._config) return;
		const h = this._hass;
		const c = this._config;
		const lang = _langFromHass(h);
		const climate = h.states[c.climate_entity];
		if (!climate) {
			this._renderError(_t(lang, "errors.entity_not_found", { entity: c.climate_entity }));
			return;
		}

		// Falls optionale Entities nicht im Config sind, leite sie aus der Backend-Instanz ab.
		await this._ensureDerivedEntities();
		const effectiveConfig = this._withDerivedConfig(c);

		// Daten vorbereiten
		const data = this._prepareData(h, effectiveConfig, climate);
		this._renderData = data;

		// Komplettes Rendering
		// Determine selected content block and title (append pool friendly name)
		const content = (c.content || DEFAULTS.content).toString().trim();
		const poolName = climate.attributes?.friendly_name || "";
		const titles = {
			controller: _t(lang, "ui.controller_title"),
			calendar: _t(lang, "ui.calendar_title"),
			waterquality: _t(lang, "ui.waterquality_title"),
			maintenance: _t(lang, "ui.maintenance_title"),
		};
		const headerTitle = c.title || ((titles[content] || "Pool Controller") + (poolName ? ` — ${poolName}` : ""));

		let blockHtml = "";
		switch (content) {
			case "calendar":
				blockHtml = this._renderCalendarBlock(data, effectiveConfig);
				break;
			case "waterquality":
				blockHtml = this._renderWaterqualityBlock(data, effectiveConfig);
				break;
			case "maintenance":
				blockHtml = this._renderMaintenanceBlock(data, effectiveConfig);
				break;
			case "controller":
			default:
				blockHtml = this._renderControllerBlock(data, effectiveConfig);
		}

		this.shadowRoot.innerHTML = `
		${this._getStyles()}
		<ha-card>
			<div class="header">
				<div class="title">${headerTitle}</div>
				<div class="header-actions"></div>
			</div>
			${data.maintenanceActive ? `
			<div class="maintenance-mode" ${data.maintenanceEntityId ? `data-more-info="${data.maintenanceEntityId}"` : ""}>
				<div class="maintenance-mode-title">${_t(lang, "ui.maintenance_mode_title")}</div>
				<div class="maintenance-mode-text">${_t(lang, "ui.maintenance_mode_text")}</div>
			</div>` : ""}

			<div class="block">${blockHtml}</div>
		</ha-card>`;

		this._attachHandlers();
	}

	// ========================================
	// MODULAR: Daten-Vorbereitung
	// ========================================
	_prepareData(h, c, climate) {
		const tc = this._effectiveTempConfig();
		const current = this._num(climate.attributes.current_temperature);
		const target = this._num(climate.attributes.temperature) ?? this._num(climate.attributes.target_temp) ?? this._num(climate.attributes.max_temp);
		const hvac = climate.state;
		const hvacAction = climate.attributes.hvac_action;
		const climateOff = hvac === "off" || hvac === "unavailable" || hvac === "unknown";
		const auxOn = c.aux_entity ? this._isOn(h.states[c.aux_entity]) : (h.states[c.aux_binary]?.state === "on");

		const maintenanceEntityId = c.maintenance_entity || this._derivedEntities?.maintenance_entity || null;
		const maintenanceActive = maintenanceEntityId ? this._isOn(h.states[maintenanceEntityId]) : false;

		const heatReasonEntityId = c.heat_reason_entity || this._derivedEntities?.heat_reason_entity || null;
		const runReasonEntityId = c.run_reason_entity || this._derivedEntities?.run_reason_entity || null;
		const heatReason = heatReasonEntityId ? (h.states[heatReasonEntityId]?.state || null) : null;
		const runReason = runReasonEntityId ? (h.states[runReasonEntityId]?.state || null) : null;

		// Physical switch states (mirrored by backend as binary_sensors)
		const mainSwitchOnEntityId = c.main_switch_on_entity || this._derivedEntities?.main_switch_on_entity || null;
		const pumpSwitchOnEntityId = c.pump_switch_on_entity || this._derivedEntities?.pump_switch_on_entity || null;
		const auxHeatingSwitchOnEntityId = c.aux_heating_switch_on_entity || this._derivedEntities?.aux_heating_switch_on_entity || null;

		const shouldMainOnEntityId = c.should_main_on_entity || this._derivedEntities?.should_main_on_entity || null;
		const shouldPumpOnEntityId = c.should_pump_on_entity || this._derivedEntities?.should_pump_on_entity || null;
		const shouldAuxOnEntityId = c.should_aux_on_entity || this._derivedEntities?.should_aux_on_entity || null;
		const mainSwitchOn = mainSwitchOnEntityId ? this._isOn(h.states[mainSwitchOnEntityId]) : false;
		const pumpSwitchOn = pumpSwitchOnEntityId ? this._isOn(h.states[pumpSwitchOnEntityId]) : false;
		const auxHeatingSwitchOn = auxHeatingSwitchOnEntityId ? this._isOn(h.states[auxHeatingSwitchOnEntityId]) : false;

		const shouldMainOn = shouldMainOnEntityId ? this._isOn(h.states[shouldMainOnEntityId]) : null;
		const shouldPumpOn = shouldPumpOnEntityId ? this._isOn(h.states[shouldPumpOnEntityId]) : null;
		const shouldAuxOn = shouldAuxOnEntityId ? this._isOn(h.states[shouldAuxOnEntityId]) : null;

		// Timer-States: bevorzugt neue Minuten-Sensoren (v2 Timer-Refactor), mit Fallback auf alte *_until Sensoren.
		const manualTimerEntity = c.manual_timer_entity;
		const autoFilterTimerEntity = c.auto_filter_timer_entity;
		const pauseTimerEntity = c.pause_timer_entity;
		const hasNewTimerSensors = (
			(manualTimerEntity && h.states[manualTimerEntity]) ||
			(autoFilterTimerEntity && h.states[autoFilterTimerEntity]) ||
			(pauseTimerEntity && h.states[pauseTimerEntity])
		);

		let bathingState;
		let filterState;
		let chlorState;
		let pauseState;
		let frostState;
		if (hasNewTimerSensors) {
			bathingState = this._manualTimerState(h, manualTimerEntity, "bathing");
			chlorState = this._manualTimerState(h, manualTimerEntity, "chlorine");
			const manualFilterState = this._manualTimerState(h, manualTimerEntity, "filter");
			const autoFilterState = this._simpleTimerState(h, autoFilterTimerEntity);
			filterState = (manualFilterState.active ? manualFilterState : autoFilterState);
			pauseState = this._simpleTimerState(h, pauseTimerEntity);
			// Frost-Timer analog zu anderen Timern
			const frostTimerEntity = this._derivedEntities?.frost_timer_entity || this._config?.frost_timer_entity;
			frostState = this._simpleTimerState(h, frostTimerEntity);
		} else {
			bathingState = this._modeState(h, c.bathing_entity, c.bathing_until, c.bathing_active_binary);
			filterState = this._modeState(h, c.filter_entity, c.filter_until, c.next_filter_in);
			chlorState = this._modeState(h, c.chlorine_entity, c.chlorine_until, c.chlorine_active_entity);
			pauseState = this._modeState(h, c.pause_entity, c.pause_until, c.pause_active_entity);
			frostState = { active: false, eta: null, duration_minutes: null };
		}
		
		const frost = c.frost_entity ? this._isOn(h.states[c.frost_entity]) : false;
		const quiet = c.quiet_entity ? this._isOn(h.states[c.quiet_entity]) : false;
		const pvAllows = c.pv_entity ? this._isOn(h.states[c.pv_entity]) : false;
		const pvPowerEntityId = c.pv_power_entity || null;
		const outdoorTempEntityId = c.outdoor_temp_entity || this._derivedEntities?.outdoor_temp_entity || null;
		const outdoorTemp = outdoorTempEntityId ? this._num(h.states[outdoorTempEntityId]?.state) : null;
		const nextFrostMinsEntityId = c.next_frost_mins_entity || this._derivedEntities?.next_frost_mins_entity || null;
		const nextFrostMins = nextFrostMinsEntityId ? this._num(h.states[nextFrostMinsEntityId]?.state) : null;
		
		const mainPowerEntityId = c.main_power_entity || null;
		const auxPowerEntityId = c.aux_power_entity || null;
		const mainPower = mainPowerEntityId ? this._num(h.states[mainPowerEntityId]?.state) : null;
		const auxPower = auxPowerEntityId ? this._num(h.states[auxPowerEntityId]?.state) : null;
		const powerVal = mainPower ?? (c.power_entity ? this._num(h.states[c.power_entity]?.state) : null);

		// Display power: prefer total (main + aux) if available, else fallback.
		let displayPower = null;
		let powerMoreInfoEntityId = null;
		let powerTooltip = "";
		if (mainPower != null || auxPower != null) {
			displayPower = (mainPower ?? 0) + (auxPower ?? 0);
			powerMoreInfoEntityId = mainPowerEntityId || auxPowerEntityId;
			if (mainPower != null && auxPower != null) {
				powerTooltip = `${mainPower}W + ${auxPower}W`;
			} else if (mainPower != null) {
				powerTooltip = `${mainPower}W`;
			} else if (auxPower != null) {
				powerTooltip = `${auxPower}W`;
			}
		} else if (powerVal != null) {
			displayPower = powerVal;
			powerMoreInfoEntityId = c.power_entity || null;
			powerTooltip = `${powerVal}W`;
		}

		const ph = c.ph_entity ? this._num(h.states[c.ph_entity]?.state) : null;
		const chlor = c.chlorine_value_entity ? this._num(h.states[c.chlorine_value_entity]?.state) : null;
		const saltEntityId = c.salt_entity || this._derivedEntities?.salt_entity;
		const saltAddEntityId = c.salt_add_entity || this._derivedEntities?.salt_add_entity || null;
		const tdsEntityId = c.tds_entity || this._derivedEntities?.tds_entity;
		const sanitizerModeEntityId = c.sanitizer_mode_entity || this._derivedEntities?.sanitizer_mode_entity || null;
		const sanitizerModeRaw = sanitizerModeEntityId ? (h.states[sanitizerModeEntityId]?.state || null) : null;
		const sanitizerMode = (sanitizerModeRaw && ["chlorine", "saltwater", "mixed"].includes(String(sanitizerModeRaw)))
			? String(sanitizerModeRaw)
			: null;
		const sanitizerModeLabel = sanitizerMode ? this._sanitizerModeLabel(sanitizerMode) : null;
		const salt = saltEntityId ? this._num(h.states[saltEntityId]?.state) : null;
		const saltAddStateObj = saltAddEntityId ? h.states[saltAddEntityId] : null;
		const saltAddNum = saltAddStateObj ? this._num(saltAddStateObj.state) : null;
		const saltAddUnit = saltAddStateObj?.attributes?.unit_of_measurement || 'g';
		const tds = tdsEntityId ? this._num(h.states[tdsEntityId]?.state) : null;

		// TDS assessment and recommended water change: prefer backend-provided values (entities or attributes),
		// otherwise fall back to local computation.
		let tdsAssessment = null;
		let waterChangePercent = 0;
		let waterChangeLiters = null;

		const tdsAssessmentEntityId = c.tds_assessment_entity || this._derivedEntities?.tds_assessment_entity;
		const waterChangePercentEntityId = c.water_change_percent_entity || this._derivedEntities?.water_change_percent_entity;
		const waterChangeLitersEntityId = c.water_change_liters_entity || this._derivedEntities?.water_change_liters_entity;

		// 1) Try configured/derived backend sensors
		if (tdsAssessmentEntityId && h.states[tdsAssessmentEntityId]) {
			tdsAssessment = h.states[tdsAssessmentEntityId].state;
		}
		if (waterChangePercentEntityId && h.states[waterChangePercentEntityId]) {
			waterChangePercent = this._num(h.states[waterChangePercentEntityId].state) || 0;
		}
		if (waterChangeLitersEntityId && h.states[waterChangeLitersEntityId]) {
			waterChangeLiters = this._num(h.states[waterChangeLitersEntityId].state) || null;
		}

		// 2) Fallback: check attributes on the TDS sensor (common integration pattern)
		if ((tds == null || tdsAssessment == null) && tdsEntityId && h.states[tdsEntityId]) {
			const attrs = h.states[tdsEntityId].attributes || {};
			if (!tdsAssessment && attrs.assessment) tdsAssessment = attrs.assessment;
			if ((!waterChangePercent || waterChangePercent === 0) && attrs.recommended_water_change_percent) {
				waterChangePercent = this._num(attrs.recommended_water_change_percent) || 0;
			}
			if (!waterChangeLiters && attrs.recommended_water_change_liters) {
				waterChangeLiters = this._num(attrs.recommended_water_change_liters) || null;
			}
		}

		// 3) Final fallback: local heuristic based on numeric TDS value
		if ((tds != null) && (tdsAssessment == null) && (waterChangePercent === 0) && !waterChangeLiters) {
			if (tds <= 500) {
				tdsAssessment = 'Gut';
				waterChangePercent = 0;
			} else if (tds <= 1000) {
				tdsAssessment = 'Erhöht';
				waterChangePercent = 0;
			} else if (tds <= 1500) {
				tdsAssessment = 'Hoch';
				waterChangePercent = 20; // empfehlen 20% Wasser wechseln
			} else {
				tdsAssessment = 'Sehr hoch';
				waterChangePercent = 50; // empfehlen 50% Wasser wechseln
			}
			if (waterChangePercent > 0 && Number.isFinite(Number(c.pool_volume_l))) {
				waterChangeLiters = Math.round((Number(c.pool_volume_l) * waterChangePercent) / 100);
			}
		}

		// If percent provided but liters missing, compute liters if pool_volume_l set
		if ((waterChangePercent > 0) && (!waterChangeLiters) && Number.isFinite(Number(c.pool_volume_l))) {
			waterChangeLiters = Math.round((Number(c.pool_volume_l) * waterChangePercent) / 100);
		}
		
		const phPlusStateObj = c.ph_plus_entity ? h.states[c.ph_plus_entity] : null;
		const phPlusNum = phPlusStateObj ? this._num(phPlusStateObj.state) : null;
		const phPlusUnit = phPlusStateObj?.attributes?.unit_of_measurement || 'g';
		
		const phMinusStateObj = c.ph_minus_entity ? h.states[c.ph_minus_entity] : null;
		const phMinusNum = phMinusStateObj ? this._num(phMinusStateObj.state) : null;
		const phMinusUnit = phMinusStateObj?.attributes?.unit_of_measurement || 'g';
		
		const chlorDoseStateObj = c.chlor_dose_entity ? h.states[c.chlor_dose_entity] : null;
		const chlorDoseNum = chlorDoseStateObj ? this._num(chlorDoseStateObj.state) : null;
		const chlorDoseUnit = chlorDoseStateObj?.attributes?.unit_of_measurement || 'Messlöffel';

		const nextStartMins = c.next_start_entity ? this._num(h.states[c.next_start_entity]?.state) : null;
		const nextFilterMins = c.next_filter_in ? this._num(h.states[c.next_filter_in]?.state) : null;
		const nextEventStart = c.next_event_entity ? h.states[c.next_event_entity]?.state : null;
		const nextEventEnd = c.next_event_end_entity ? h.states[c.next_event_end_entity]?.state : null;
		const nextEventSummary = c.next_event_summary_entity ? h.states[c.next_event_summary_entity]?.state : null;

		const dialAngle = this._calcDial(current ?? tc.min_temp, tc.min_temp, tc.max_temp);
		const targetAngle = this._calcDial(target ?? current ?? tc.min_temp, tc.min_temp, tc.max_temp);

		const bathingEta = bathingState.eta;
		const filterEta = filterState.eta;
		const chlorEta = chlorState.eta;
		const pauseEta = pauseState.eta;
		const frostEta = frostState?.eta;
		// Dauer: bevorzugt vom Timer-Sensor (duration_minutes), sonst ggf. alte Duration-Entities, sonst DEFAULTS.
		const bathingMaxMins = this._num(bathingState.duration_minutes) ?? (c.bathing_duration_entity ? this._num(h.states[c.bathing_duration_entity]?.state) : null);
		const filterMaxMins = this._num(filterState.duration_minutes) ?? (c.filter_duration_entity ? this._num(h.states[c.filter_duration_entity]?.state) : null);
		const chlorMaxMins = this._num(chlorState.duration_minutes) ?? (c.chlorine_duration_entity ? this._num(h.states[c.chlorine_duration_entity]?.state) : null);
		const pauseMaxMins = this._num(pauseState.duration_minutes) ?? (c.pause_duration_entity ? this._num(h.states[c.pause_duration_entity]?.state) : null);
		const frostMaxMins = this._num(frostState?.duration_minutes) ?? null;
		// Progress = verbleibender Anteil
		const bathingProgress = bathingEta != null ? this._clamp(bathingEta / (bathingMaxMins || bathingEta || c.bathing_max_mins), 0, 1) : 0;
		const filterProgress = filterEta != null ? this._clamp(filterEta / (filterMaxMins || filterEta || c.filter_max_mins), 0, 1) : 0;
		const chlorProgress = chlorEta != null ? this._clamp(chlorEta / (chlorMaxMins || chlorEta || c.chlor_max_mins), 0, 1) : 0;
		const pauseProgress = pauseEta != null ? this._clamp(pauseEta / (pauseMaxMins || pauseEta || c.pause_max_mins), 0, 1) : 0;
		const frostProgress = frostEta != null ? this._clamp(frostEta / (frostMaxMins || frostEta || 1), 0, 1) : 0;

		const pillClass = maintenanceActive ? "active" : (bathingState.active || filterState.active || chlorState.active) ? "active" : pauseState.active ? "warn" : frost ? "on" : "";
		const statusText = this._getStatusText(hvac, hvacAction, maintenanceActive, bathingState.active, filterState.active, chlorState.active, pauseState.active);

		return {
			// Entity IDs (for HA more-info popups)
			climateEntityId: c.climate_entity,
			maintenanceEntityId: maintenanceEntityId,
			heatReasonEntityId: heatReasonEntityId,
			runReasonEntityId: runReasonEntityId,
			sanitizerModeEntityId,
			mainSwitchOnEntityId,
			pumpSwitchOnEntityId,
			auxHeatingSwitchOnEntityId,
			phEntityId: c.ph_entity || null,
			chlorEntityId: c.chlorine_value_entity || null,
			saltEntityId: saltEntityId || null,
			saltAddEntityId: saltAddEntityId,
			tdsEntityId: tdsEntityId || null,
			frostEntityId: c.frost_entity || null,
			quietEntityId: c.quiet_entity || null,
			pvAllowsEntityId: c.pv_entity || null,
			pvPowerEntityId: pvPowerEntityId,
			outdoorTempEntityId,
			nextFrostMinsEntityId,
			mainPowerEntityId: mainPowerEntityId,
			auxPowerEntityId: auxPowerEntityId,
			shouldMainOnEntityId,
			shouldPumpOnEntityId,
			shouldAuxOnEntityId,
			powerEntityId: c.power_entity || null,
			powerMoreInfoEntityId,

			maintenanceActive,
			heatReason,
			runReason,
			mainSwitchOn,
			pumpSwitchOn,
			auxHeatingSwitchOn,
			shouldMainOn,
			shouldPumpOn,
			shouldAuxOn,
			current, target, hvac, hvacAction, climateOff, auxOn,
			bathingState, filterState, chlorState, pauseState,
			frost, quiet, pvAllows,
			outdoorTemp,
			nextFrostMins,
			mainPower, auxPower, powerVal,
			displayPower, powerTooltip,
			ph, chlor, salt, saltAddNum, saltAddUnit, tds,
			sanitizerMode,
			sanitizerModeLabel,
			tdsAssessment, waterChangePercent, waterChangeLiters,
			phPlusNum, phPlusUnit, phMinusNum, phMinusUnit, chlorDoseNum, chlorDoseUnit,
			nextStartMins, nextFilterMins, nextEventStart, nextEventEnd, nextEventSummary,
			nextStartMinsEntityId: c.next_start_entity || null,
			nextFilterMinsEntityId: c.next_filter_in || null,
			nextEventEntityId: c.next_event_entity || null,
			effectiveMinTemp: tc.min_temp,
			effectiveMaxTemp: tc.max_temp,
			effectiveStep: tc.step,
			dialAngle, targetAngle,
			bathingEta, filterEta, chlorEta, pauseEta, frostEta,
			bathingMaxMins, filterMaxMins, chlorMaxMins, pauseMaxMins, frostMaxMins,
			bathingProgress, filterProgress, chlorProgress, pauseProgress, frostProgress,
			frostState,
			pillClass, statusText
		};
	}

	_effectiveTempConfig() {
		const c = this._config || DEFAULTS;
		const climate = this._hass?.states?.[c.climate_entity];
		const a = climate?.attributes || {};
		const min_temp = this._num(a.min_temp) ?? Number(c.min_temp);
		const max_temp = this._num(a.max_temp) ?? Number(c.max_temp);
		const step = (
			this._num(a.target_temp_step) ??
			this._num(a.target_temperature_step) ??
			Number(c.step || 0.5)
		);
		return {
			min_temp: Number.isFinite(min_temp) ? min_temp : Number(DEFAULTS.min_temp),
			max_temp: Number.isFinite(max_temp) ? max_temp : Number(DEFAULTS.max_temp),
			step: Number.isFinite(step) && step > 0 ? step : Number(DEFAULTS.step),
		};
	}

	// ========================================
	// MODULAR: Styles
	// ========================================
	_getStyles() {
		return `<style>
			:host { display: block; }
			[data-more-info] { cursor: pointer; }
			ha-card { padding: 16px; background: linear-gradient(180deg, #fdfbfb 0%, #f2f5f8 100%); color: var(--primary-text-color); container-type: inline-size; }
			* { box-sizing: border-box; }
			.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-family: "Montserrat", "Segoe UI", sans-serif; }
			.header-actions { display: flex; align-items: center; gap: 10px; }
			.header-actions .action-btn { padding: 8px 10px; font-size: 12px; }
			.title { font-size: 18px; font-weight: 600; letter-spacing: 0.3px; }
			.maintenance-mode { border: 1px solid #f3c2a2; border-radius: 12px; padding: 12px 14px; background: #fff9f5; margin: 0 0 12px 0; }
			.maintenance-mode-title { font-weight: 700; color: #c0392b; }
			.maintenance-mode-text { margin-top: 4px; color: #8a3b32; font-weight: 500; }
			.pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #f4f6f8; color: #333; }
			.pill.on { background: #d0f0d0; color: #0f6b2f; }
			.pill.warn { background: #ffe5d5; color: #b44; }
			.pill.active { background: #8a3b32; color: #fff; }
			
			.content-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
			/* Fallback (viewport-basiert), falls Container Queries fehlen */
			@media (min-width: 501px) { .content-grid { grid-template-columns: 1fr 1fr; } }
			/* Card-basiert (Home Assistant Layout): reagiert auf Kartenbreite, nicht Viewport */
			@container (min-width: 520px) { .content-grid { grid-template-columns: 1fr 1fr; } }
			@container (min-width: 850px) {
				.content-grid { grid-template-columns: 1.35fr 0.65fr; gap: 24px; }
				.dial { max-width: 380px; }
				/* right-column removed: layout now single-column or controlled by content-grid */
			}
			
			.dial-container { display: grid; place-items: center; }
			.dial { position: relative; aspect-ratio: 1 / 1; width: 100%; max-width: 280px; display: grid; place-items: center; }
			.dial.disabled { opacity: 0.6; }
			.ring { width: 100%; height: 100%; border-radius: 50%; position: relative; display: grid; place-items: center; padding: 20px; }
			
			/* SVG Ring */
			.ring-svg { position: absolute; width: 100%; height: 100%; }
			.ring-track { fill: none; stroke: #e6e9ed; stroke-width: 8; stroke-linecap: round; }
			.ring-progress { fill: none; stroke: var(--accent, #8a3b32); stroke-width: 8; stroke-linecap: round; }
			.ring-target { fill: none; stroke: var(--target-accent, rgba(138,59,50,0.3)); stroke-width: 8; stroke-linecap: round; }
			.ring-highlight { fill: none; stroke: var(--accent, #8a3b32); stroke-width: 10; stroke-linecap: round; opacity: 0.4; }
			.ring-dot-current { fill: var(--accent, #8a3b32); }
			.ring-dot-target { fill: #fff; stroke: #d0d7de; stroke-width: 2; }
			
			.ring::after { content: ""; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 50% 50%, #fff 68%, transparent 69%); }
			
			/* Power badge: keep inside ring (avoid overlapping arc on small screens) */
			.power-top { position: absolute; top: 10%; left: 50%; transform: translateX(-50%); z-index: 2; }
			.power-pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.94); border: 1px solid #e0e6ed; color: #4a5568; }
			.status-icons { position: absolute; top: 22%; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; align-items: center; z-index: 1; }
			.status-icon { width: 32px; height: 32px; border-radius: 50%; background: #f4f6f8; display: grid; place-items: center; border: 2px solid #d0d7de; opacity: 0.35; transition: all 200ms ease; }
			.status-icon.active { background: #8a3b32; color: #fff; border-color: #8a3b32; opacity: 1; box-shadow: 0 2px 8px rgba(138,59,50,0.3); }
			.status-icon.frost.active { background: #2a7fdb; border-color: #2a7fdb; box-shadow: 0 2px 8px rgba(42,127,219,0.3); }
			.status-icon ha-icon { --mdc-icon-size: 18px; }
			
			.dial-core { position: absolute; top: 57.5%; left: 50%; transform: translate(-50%, -50%); display: grid; gap: 6px; place-items: center; text-align: center; z-index: 1; }
			.temp-current { font-size: 42px; font-weight: 700; line-height: 1; }
			.divider { width: 80px; height: 2px; background: #d0d7de; margin: 4px 0; }
			.temp-target-row { display: grid; grid-template-columns: 1fr auto 1fr; column-gap: 10px; align-items: center; width: 160px; font-size: 16px; color: var(--secondary-text-color); }
			.temp-target-left { justify-self: start; }
			.temp-target-mid { justify-self: center; display: grid; place-items: center; opacity: 0.9; }
			.temp-target-right { justify-self: end; }
			.temp-target-left, .temp-target-right { font-weight: 600; white-space: nowrap; }
			.temp-target-row ha-icon { --mdc-icon-size: 18px; }

			.switch-icons-row { display: flex; gap: 10px; align-items: center; justify-content: center; margin-top: 6px; }
			.switch-icon { width: 26px; height: 26px; border-radius: 50%; background: #f4f6f8; display: grid; place-items: center; border: 2px solid #d0d7de; opacity: 0.45; transition: all 200ms ease; }
			.switch-icon.active { background: var(--accent, #8a3b32); color: #fff; border-color: var(--accent, #8a3b32); opacity: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
			.switch-icon ha-icon { --mdc-icon-size: 16px; }
			
			.dial-timer { position: relative; margin: 12px auto 0; left: auto; bottom: auto; transform: none; width: 60%; max-width: 320px; z-index: 1; }
			.timer-bar { height: 4px; background: #e6e9ed; border-radius: 999px; overflow: hidden; position: relative; }
			.timer-fill { height: 100%; border-radius: inherit; transition: width 300ms ease; }
			.timer-text { font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; text-align: center; }

			/* right-column styles removed (no dedicated right column in markup) */
			
			.action-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px; max-width: 300px; }
			.action-btn { padding: 12px; border-radius: 10px; border: 2px solid #d0d7de; background: #fff; cursor: pointer; transition: all 150ms ease; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
			.action-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); border-color: #8a3b32; }
			.action-btn.active { background: #8a3b32; color: #fff; border-color: #8a3b32; }
			.action-btn.maintenance.active { background: #c0392b; border-color: #c0392b; }
			.action-btn.filter.active { background: #2a7fdb; border-color: #2a7fdb; }
			.action-btn.chlorine.active { background: #27ae60; border-color: #27ae60; }
			.action-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; border-color: #d0d7de; }
			.action-btn:disabled:hover { box-shadow: none; transform: none; border-color: #d0d7de; }
			.action-btn ha-icon { --mdc-icon-size: 20px; }
			
			.temp-controls { display: grid; grid-template-columns: repeat(2, 64px); gap: 16px; margin-top: 16px; }
			.temp-btn { height: 64px; border-radius: 50%; border: 2px solid #d0d7de; background: #fff; font-size: 28px; font-weight: 700; cursor: pointer; transition: all 150ms ease; }
			.temp-btn:hover { box-shadow: 0 6px 14px rgba(0,0,0,0.1); transform: scale(1.05); border-color: #8a3b32; }
			.temp-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; border-color: #d0d7de; }
			.temp-btn:disabled:hover { box-shadow: none; transform: none; border-color: #d0d7de; }
			
			.aux-switch { margin-top: 16px; padding: 12px 16px; border: 2px solid #d0d7de; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: space-between; gap: 20px; cursor: pointer; transition: all 150ms ease; max-width: 300px; }
			.aux-switch:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
			.aux-switch.active { background: #27ae60; color: #fff; border-color: #27ae60; }
			.aux-switch.disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
			.aux-switch.disabled:hover { box-shadow: none; }
			.aux-switch-label { font-weight: 600; display: flex; align-items: center; gap: 8px; }
			.aux-switch-label ha-icon { --mdc-icon-size: 20px; }
			.toggle { width: 44px; height: 24px; background: #d0d7de; border-radius: 999px; position: relative; transition: background 200ms ease; }
			.toggle::after { content: ""; position: absolute; width: 18px; height: 18px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: left 200ms ease; }
			.aux-switch.active .toggle { background: #fff; }
			.aux-switch.active .toggle::after { left: 23px; background: #27ae60; }
			
			.quality { border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #fff; display: grid; gap: 20px; }
			.section-title { font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: #4a5568; margin-bottom: 8px; }
			
			.scale-container { position: relative; }
			.scale-bar { height: 50px; border-radius: 10px; position: relative; overflow: visible; }
			.ph-bar { background: linear-gradient(90deg, #d7263d 0%, #e45a2a 7%, #fbb13c 14%, #f6d32b 21%, #8bd448 35%, #27ae60 50%, #1abc9c 65%, #1c9ed8 78%, #2a7fdb 85%, #5c4ac7 100%); }
			.chlor-bar { background: linear-gradient(90deg, #d7263d 0%, #f5a524 25%, #1bbc63 50%, #1bbc63 75%, #f5a524 87%, #d7263d 100%); }
			.salt-bar { background: linear-gradient(90deg, #e6f7ff 0%, #7fd1ff 50%, #0a84ff 100%); }
			.tds-bar { background: linear-gradient(90deg, #2ecc71 0%, #f1c40f 50%, #e74c3c 100%); }
			.scale-tick { position: absolute; bottom: 0; width: 2px; background: rgba(255,255,255,0.4); height: 50%; pointer-events: none; }
			.scale-tick.major { height: 70%; background: rgba(255,255,255,0.6); width: 3px; }
			.scale-tick.minor { height: 30%; background: rgba(255,255,255,0.3); width: 1px; }
			
			.scale-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #666; font-weight: 600; }
			/* Absolute-positioned labels (used for pH 0-14 to avoid 2-digit misalignment) */
			.scale-labels-abs { position: relative; height: 14px; margin-top: 6px; font-size: 11px; color: #666; font-weight: 600; }
			.scale-label-abs { position: absolute; bottom: 0; transform: translateX(-50%); white-space: nowrap; }
			.scale-label-abs.first { transform: translateX(0); }
			.scale-label-abs.last { transform: translateX(-100%); }
			/* Marker sollen im Balken sitzen (nicht über der Überschrift). */
			.scale-marker { position: absolute; top: 8px; transform: translateX(-50%); z-index: 1; }
			.marker-value { background: #0b132b; color: #fff; padding: 6px 10px; border-radius: 8px; font-weight: 700; font-size: 13px; white-space: nowrap; position: relative; }
			.marker-value::after { content: ""; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 10px solid #0b132b; }
			@container (max-width: 520px) {
				/* Schmal: Dial-UI leicht kompakter, Marker weiterhin im Balken. */
				.temp-current { font-size: 38px; }
				.status-icons { top: 22%; gap: 10px; }
				.power-top { top: 10%; }
				.power-pill { font-size: 10px; padding: 2px 7px; }
				.status-icon { width: 28px; height: 28px; }
				.status-icon ha-icon { --mdc-icon-size: 16px; }
				.dial-core { top: 59%; }
				.dial-timer { margin-top: 8px; width: 70%; max-width: 260px; }
				.scale-marker { top: 6px; }
				.marker-value { padding: 5px 8px; font-size: 12px; }
				.marker-value::after { bottom: -7px; border-left-width: 4px; border-right-width: 4px; border-top-width: 9px; }
			}
			.info-badge { padding: 8px 12px; border-radius: 10px; background: #f4f6f8; font-size: 13px; border: 1px solid #e0e6ed; font-weight: 500; }
			
			.maintenance { border: 1px solid #f3c2a2; border-radius: 12px; padding: 16px; background: #fff9f5; margin-top: 16px; }
			.maintenance .section-title { color: #c0392b; }
			.maintenance-items { display: grid; gap: 12px; margin-top: 12px; }
			.maintenance-item { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 10px; background: #fff; border: 1px solid #f3c2a2; }
			.maintenance-item ha-icon { --mdc-icon-size: 24px; color: #c0392b; }
			.maintenance-text { flex: 1; }
			.maintenance-label { font-weight: 600; color: #8a3b32; }
			.maintenance-value { font-size: 18px; font-weight: 700; color: #c0392b; margin-top: 2px; }
			
			.calendar { border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #fff; display: grid; gap: 10px; margin-top: 16px; }
			.event { padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e9f0; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
			.event-title { font-weight: 500; }
			.event-time { color: #555; font-size: 13px; }
			
			.next-start { background: #e8f5e9; border: 1px solid #b8e3b8; padding: 12px; border-radius: 10px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
			.next-start-label { font-weight: 600; color: #0f6b2f; }
			.next-start-time { color: #0f6b2f; font-size: 14px; }

			/* Upcoming rows: align title | value like a table */
			.next-rows { display: grid; gap: 8px; }
			.next-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; }
			.next-row-title { font-weight: 700; }
			.next-row-value { color: var(--secondary-text-color); font-weight: 700; white-space: nowrap; }
		</style>`;
	}

	// ========================================
	// MODULAR: Linke Spalte (Dial + Controls)
	// ========================================
	_formatCountdown(lang, mins) {
		const m0 = this._num(mins);
		if (m0 == null) return { text: "", title: "" };
		const m = Math.max(0, Math.round(m0));
		if (m <= 0) return { text: _t(lang, "ui.now_short"), title: "" };

		const inShort = _t(lang, "ui.in_short");
		const dShort = _t(lang, "ui.days_short");
		const hShort = _t(lang, "ui.hours_short");
		const minShort = _t(lang, "ui.minutes_short");

		const days = Math.floor(m / (24 * 60));
		const hours = Math.floor((m % (24 * 60)) / 60);
		const minutes = m % 60;

		let parts = [];
		if (days > 0) {
			parts.push(`${days} ${dShort}`);
			if (hours > 0) parts.push(`${hours} ${hShort}`);
		} else if (hours > 0) {
			parts.push(`${hours} ${hShort}`);
			// Show minutes only for shorter horizons to keep it readable.
			if (hours < 6 && minutes > 0) parts.push(`${minutes} ${minShort}`);
		} else {
			parts.push(`${minutes} ${minShort}`);
		}

		return { text: `${inShort} ${parts.join(" ")}`.trim(), title: this._absoluteTimeFromMinutes(m) };
	}

	_absoluteTimeFromMinutes(mins) {
		try {
			const m = this._num(mins);
			if (m == null || m <= 0) return "";
			const locale = this._hass?.locale?.language || this._hass?.language || undefined;
			const dt = new Date(Date.now() + Math.round(m) * 60000);
			if (Number.isNaN(dt.getTime())) return "";
			return dt.toLocaleString(locale, {
				weekday: "short",
				day: "2-digit",
				month: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (_e) {
			return "";
		}
	}

	// ========================================
	// Block Renderers (single-block mode)
	// ========================================

	_renderControllerBlock(d, c) {
		const lang = _langFromHass(this._hass);
		const disabled = !!d.maintenanceActive;
		// Compute runtime-visible aux availability:
		// - If the backend provides a dedicated `aux_binary` sensor (preferred), only
		//   show the UI when that sensor reports ON (this follows the integration option).
		// - Fallback: if no aux_binary exists, show the aux controls when an aux_entity is configured.
		const showAuxSwitch = (() => {
			if (c.aux_binary && this._hass.states[c.aux_binary]) {
				return this._isOn(this._hass.states[c.aux_binary]);
			}
			return (c.aux_entity && this._hass.states[c.aux_entity]);
		})();
		// Use dynamic durations for tooltips / data-duration attributes (prefer backend-provided values)
		const _numPos = (v, fallback) => {
			if (v == null) return fallback;
			const n = Number(v);
			if (!Number.isFinite(n) || n <= 0) return fallback;
			return n;
		};
		const bathingDur = _numPos(d.bathingMaxMins, (Number.isFinite(Number(c.bathing_max_mins)) ? Number(c.bathing_max_mins) : 60));
		const filterDur = _numPos(d.filterMaxMins, (Number.isFinite(Number(c.filter_max_mins)) ? Number(c.filter_max_mins) : 30));
		const chlorDur = _numPos(d.chlorMaxMins, (Number.isFinite(Number(c.chlor_max_mins)) ? Number(c.chlor_max_mins) : 5));
		const pauseDur = _numPos(d.pauseMaxMins, (Number.isFinite(Number(c.pause_max_mins)) ? Number(c.pause_max_mins) : 60));

		// If backend exposes configured defaults via config sensors, prefer them
		const cfgFilter = c.filter_duration_entity ? this._num(this._hass.states[c.filter_duration_entity]?.state) : null;
		const cfgChlor = c.chlorine_duration_entity ? this._num(this._hass.states[c.chlorine_duration_entity]?.state) : null;
		const cfgBath = c.bathing_duration_entity ? this._num(this._hass.states[c.bathing_duration_entity]?.state) : null;
		const finalFilterDur = Number.isFinite(Number(cfgFilter)) ? cfgFilter : filterDur;
		const finalChlorDur = Number.isFinite(Number(cfgChlor)) ? cfgChlor : chlorDur;
		const finalBathDur = Number.isFinite(Number(cfgBath)) ? cfgBath : bathingDur;
		const RING_CX = 50;
		const RING_CY = 50;
		const RING_R = 44;
		const DOT_R = RING_R;
		const accent = d.climateOff ? "#d0d7de" : (d.auxOn ? "#c0392b" : "#8a3b32");
		const targetAccent = d.climateOff ? "rgba(208,215,222,0.6)" : (d.auxOn ? "rgba(192,57,43,0.3)" : "rgba(138,59,50,0.3)");
		const dotCurrentFill = d.climateOff ? "rgba(208,215,222,0.85)" : (d.auxOn ? "rgba(192,57,43,0.45)" : "rgba(138,59,50,0.45)");
		// SVG-Winkel (Screen-Koordinaten): 0°=3 Uhr, 90°=6 Uhr.
		// Gap unten (zentriert bei 90°): Gap 45°..135° => Arc Start 135°, Sweep 270° bis 45°.
		const RING_START_DEG = 135;
		return `<div class="dial-container">
				<div class="dial ${disabled ? "disabled" : ""}" style="--accent:${accent}; --target-accent:${targetAccent}" data-dial>
					<div class="ring">
						<div class="power-top" ${d.powerMoreInfoEntityId ? `data-more-info="${d.powerMoreInfoEntityId}"` : ''} ${d.powerTooltip ? `title="${d.powerTooltip}"` : ''}>
							${d.displayPower !== null ? `<span class="power-pill">${d.displayPower}W</span>` : ""}
						</div>
						<!-- SVG Ring mit 270° Arc (Öffnung bei 6 Uhr) -->
						<svg class="ring-svg" viewBox="0 0 100 100">
							<!-- Track: 270° Arc (Gap unten) -->
							<path class="ring-track" d="${this._arcPath(RING_CX, RING_CY, RING_R, RING_START_DEG, 270)}" />
							<!-- Target Range (nur wenn Target > Current) -->
							${d.targetAngle > d.dialAngle ? `<path class="ring-target" d="${this._arcPath(RING_CX, RING_CY, RING_R, RING_START_DEG + d.dialAngle, d.targetAngle - d.dialAngle)}" />` : ''}
							<!-- Current Progress -->
							<path class="ring-progress" d="${this._arcPath(RING_CX, RING_CY, RING_R, RING_START_DEG, d.dialAngle)}" />
							<!-- Highlight zwischen IST und SOLL -->
							${d.targetAngle > d.dialAngle ? `<path class="ring-highlight" d="${this._arcPath(RING_CX, RING_CY, RING_R, RING_START_DEG + d.dialAngle, d.targetAngle - d.dialAngle)}" />` : ''}
							<!-- Dot am IST-Wert (kleiner) -->
							<circle class="ring-dot-current" cx="${RING_CX + DOT_R * Math.cos((RING_START_DEG + d.dialAngle) * Math.PI / 180)}" 
								cy="${RING_CY + DOT_R * Math.sin((RING_START_DEG + d.dialAngle) * Math.PI / 180)}" r="1.25" style="fill:${dotCurrentFill};" />
							<!-- Dot am SOLL-Wert (größer, weiß) -->
							<circle class="ring-dot-target" cx="${RING_CX + DOT_R * Math.cos((RING_START_DEG + d.targetAngle) * Math.PI / 180)}" 
								cy="${RING_CY + DOT_R * Math.sin((RING_START_DEG + d.targetAngle) * Math.PI / 180)}" r="2.5" />
						</svg>
						<div class="status-icons">
							<div class="status-icon frost ${d.frost ? "active" : ""}" title="${_t(lang, "ui.frost")}" ${(d.frostEntityId || d.runReasonEntityId) ? `data-more-info="${d.frostEntityId || d.runReasonEntityId}"` : ''}>
								<ha-icon icon="mdi:snowflake"></ha-icon>
							</div>
							<div class="status-icon ${d.quiet ? "active" : ""}" title="${_t(lang, "ui.quiet")}" ${d.quietEntityId ? `data-more-info="${d.quietEntityId}"` : ''}>
								<ha-icon icon="mdi:power-sleep"></ha-icon>
							</div>
							<div class="status-icon ${d.pvAllows ? "active" : ""}" title="${_t(lang, "ui.pv")}" ${(d.pvPowerEntityId || d.pvAllowsEntityId) ? `data-more-info="${d.pvPowerEntityId || d.pvAllowsEntityId}"` : ''}>
								<ha-icon icon="mdi:solar-power"></ha-icon>
							</div>
						</div>
					</div>
					<div class="dial-core">
						<div class="temp-current" ${d.climateEntityId ? `data-more-info="${d.climateEntityId}"` : ''}>${d.current != null ? d.current.toFixed(1) : "–"}<span style="font-size:0.55em">°C</span></div>
						<div class="divider"></div>
						<div class="temp-target-row">
							<span class="temp-target-left" ${d.climateEntityId ? `data-more-info="${d.climateEntityId}"` : ''}>${d.target != null ? d.target.toFixed(1) : "–"}°C</span>
							<span class="temp-target-mid">${this._renderStatusMidIcon(d)}</span>
							<span class="temp-target-right" ${d.outdoorTempEntityId ? `data-more-info="${d.outdoorTempEntityId}"` : ''}>${d.outdoorTemp != null ? `${d.outdoorTemp.toFixed(1)}°C` : ''}</span>
						</div>
						<div class="switch-icons-row">
							<div class="switch-icon ${d.mainSwitchOn ? "active" : ""}" title="${_t(lang, "ui.main_switch")}" ${d.mainSwitchOnEntityId ? `data-more-info="${d.mainSwitchOnEntityId}"` : ""}>
								<ha-icon icon="mdi:power-plug"></ha-icon>
							</div>
							<div class="switch-icon ${d.pumpSwitchOn ? "active" : ""}" title="${_t(lang, "ui.pump_switch")}" ${d.pumpSwitchOnEntityId ? `data-more-info="${d.pumpSwitchOnEntityId}"` : ""}>
								<ha-icon icon="mdi:pump"></ha-icon>
							</div>
							${showAuxSwitch ? `<div class="switch-icon ${d.auxHeatingSwitchOn ? "active" : ""}" title="${_t(lang, "ui.aux_heater_switch")}" ${d.auxHeatingSwitchOnEntityId ? `data-more-info="${d.auxHeatingSwitchOnEntityId}"` : ""}>
								<ha-icon icon="mdi:fire"></ha-icon>
							</div>` : ''}
						</div>
					</div>
					${this._renderDialTimer(d)}
				</div>
				<div class="temp-controls">
					<button class="temp-btn" data-action="dec" ${disabled ? "disabled" : ""}>−</button>
					<button class="temp-btn" data-action="inc" ${disabled ? "disabled" : ""}>+</button>
				</div>
				<div class="action-buttons">
					<button class="action-btn ${d.bathingState.active ? "active" : ""}" data-mode="bathing" data-duration="${finalBathDur}" data-start="${c.bathing_start || ""}" data-stop="${c.bathing_stop || ""}" data-active="${d.bathingState.active}" ${disabled ? "disabled" : ""} title="${d.bathingState.active ? _t(lang, 'tooltips.bathing.active', { mins: (d.bathingEta != null ? d.bathingEta : finalBathDur) }) : _t(lang, 'tooltips.bathing.inactive', { mins: finalBathDur })}">
						<ha-icon icon="mdi:pool"></ha-icon><span>${_t(lang, "actions.bathing")}</span>
					</button>
					<button class="action-btn filter ${d.filterState.active ? "active" : ""}" data-mode="filter" data-duration="${finalFilterDur}" data-start="${c.filter_start || ""}" data-stop="${c.filter_stop || ""}" data-active="${d.filterState.active}" ${disabled ? "disabled" : ""} title="${d.filterState.active ? _t(lang, 'tooltips.filter.active', { mins: (d.filterEta != null ? d.filterEta : finalFilterDur) }) : _t(lang, 'tooltips.filter.inactive', { mins: finalFilterDur })}">
						<ha-icon icon="mdi:rotate-right"></ha-icon><span>${_t(lang, "actions.filter")}</span>
					</button>
					<button class="action-btn chlorine ${d.chlorState.active ? "active" : ""}" data-mode="chlorine" data-duration="${finalChlorDur}" data-start="${c.chlorine_start || ""}" data-stop="${c.chlorine_stop || ""}" data-active="${d.chlorState.active}" ${disabled ? "disabled" : ""} title="${d.chlorState.active ? _t(lang, 'tooltips.chlorine.active', { mins: (d.chlorEta != null ? d.chlorEta : finalChlorDur) }) : _t(lang, 'tooltips.chlorine.inactive', { mins: finalChlorDur })}">
						<ha-icon icon="mdi:fan"></ha-icon><span>${_t(lang, "actions.chlorine")}</span>
					</button>
					<button class="action-btn ${d.pauseState.active ? "active" : ""}" data-mode="pause" data-duration="${pauseDur}" data-start="${c.pause_start || ""}" data-stop="${c.pause_stop || ""}" data-active="${d.pauseState.active}" ${disabled ? "disabled" : ""} title="${d.pauseState.active ? _t(lang, 'tooltips.pause.active', { mins: (d.pauseEta != null ? d.pauseEta : pauseDur) }) : _t(lang, 'tooltips.pause.inactive', { mins: pauseDur })}">
						<ha-icon icon="mdi:pause-circle"></ha-icon><span>${_t(lang, "actions.pause")}</span>
					</button>
				</div>
				${showAuxSwitch ? `
					<div class="aux-switch ${d.auxOn ? "active" : ""} ${disabled ? "disabled" : ""}" data-entity="${c.aux_entity || ""}" title="${d.auxOn ? _t(lang, 'tooltips.aux.active') : _t(lang, 'tooltips.aux.inactive')}">
						<div class="aux-switch-label">
							<ha-icon icon="mdi:fire"></ha-icon><span>${_t(lang, "ui.additional_heater")}</span>
						</div>
						<div class="toggle"></div>
					</div>
				` : ''}
			</div>`;
	}

	_renderWaterqualityBlock(d, c) {
		const lang = _langFromHass(this._hass);
		const saltAddDisplay = (d.saltAddNum != null && d.saltAddNum > 0)
			? (d.saltAddNum >= 1000
				? `${Math.round(d.saltAddNum)} ${d.saltAddUnit} (${(d.saltAddNum / 1000).toFixed(2)} kg)`
				: `${Math.round(d.saltAddNum)} ${d.saltAddUnit}`)
			: null;

		const chlorOkMin = Number.isFinite(Number(c?.chlor_ok_min)) ? Number(c.chlor_ok_min) : DEFAULTS.chlor_ok_min;
		const chlorLow = (d.chlor != null) && (chlorOkMin != null) && (Number(d.chlor) < Number(chlorOkMin));
		const isSaltwater = d.sanitizerMode === "saltwater";
		const isMixed = d.sanitizerMode === "mixed";
		const saltAddNeeded = !!saltAddDisplay;
		// If salt is missing, the primary recommendation should be "add salt" (no extra hint noise).
		const showSaltwaterHint = isSaltwater && chlorLow && !saltAddNeeded;
		const showMixedHint = isMixed && chlorLow && !saltAddNeeded;
		// Safety: never show manual chlorine dosing recommendation in pure saltwater mode.
		const showChlorDose = (d.chlorDoseNum != null && d.chlorDoseNum > 0) && !isSaltwater;
		return `<div class="quality">
				<div class="section-title">${_t(lang, "ui.water_quality")}</div>
				${d.sanitizerModeLabel ? `<div class="info-badge" ${d.sanitizerModeEntityId ? `data-more-info="${d.sanitizerModeEntityId}"` : ''}>${_t(lang, "ui.sanitizer")}: ${d.sanitizerModeLabel}</div>` : ""}
				<div class="scale-container" ${d.phEntityId ? `data-more-info="${d.phEntityId}"` : ''}>
					<div style="font-weight: 600; margin-bottom: 8px;">${_t(lang, "ui.ph")}</div>
					<div style="position: relative;">
						${d.ph != null ? `<div class="scale-marker" style="left: ${this._pct(d.ph, 0, 14)}%"><div class="marker-value">${d.ph.toFixed(2)}</div></div>` : ""}
						<div class="scale-bar ph-bar">
							${Array.from({length: 15}, (_, i) => `<div class="scale-tick major" style="left: ${(i / 14) * 100}%"></div>`).join("")}
							${Array.from({length: 14}, (_, i) => `<div class="scale-tick minor" style="left: ${((i + 0.5) / 14) * 100}%"></div>`).join("")}
						</div>
					</div>
					<div class="scale-labels-abs">
						${Array.from({ length: 15 }, (_, i) => {
							const cls = `scale-label-abs${i === 0 ? " first" : ""}${i === 14 ? " last" : ""}`;
							return `<span class="${cls}" style="left: ${(i / 14) * 100}%">${i}</span>`;
						}).join("")}
					</div>
				</div>
				
				<div class="scale-container" ${d.chlorEntityId ? `data-more-info="${d.chlorEntityId}"` : ''}>
					<div style="font-weight: 600; margin-bottom: 8px;">${_t(lang, "ui.chlorine")}</div>
					<div style="position: relative;">
						${d.chlor != null ? `<div class="scale-marker" style="left: ${this._pct(d.chlor, 0, 1200)}%"><div class="marker-value">${d.chlor.toFixed(0)} mV</div></div>` : ""}
						<div class="scale-bar chlor-bar">
							${[0, 300, 600, 900, 1200].map((n, i) => `<div class="scale-tick major" style="left: ${(i / 4) * 100}%"></div>`).join("")}
							${[1, 2, 3].map(i => `<div class="scale-tick minor" style="left: ${((i - 0.5) / 4) * 100}%"></div>`).join("")}
						</div>
					</div>
					<div class="scale-labels">
						<span>0</span><span>300</span><span>600</span><span>900</span><span>1200</span>
					</div>
				</div>
				
				${(d.salt != null) ? `
				<div class="scale-container" ${d.saltEntityId ? `data-more-info="${d.saltEntityId}"` : ''}>
					<div style="font-weight: 600; margin-bottom: 8px;">${_t(lang, "ui.salt")}</div>
					<div style="position: relative;">
						<div class="scale-marker" style="left: ${this._pct(d.salt, 0, 10)}%"><div class="marker-value">${d.salt.toFixed(2)} g/L (${(d.salt * 0.1).toFixed(2)}%)</div></div>
						<div class="scale-bar salt-bar">
							${[0,2.5,5,7.5,10].map((n, i) => `<div class="scale-tick major" style="left: ${(i / 4) * 100}%"></div>`).join("")}
						</div>
					</div>
					<div class="scale-labels">
						<span>0</span><span>2.5</span><span>5</span><span>7.5</span><span>10</span>
					</div>
					<div class="scale-labels" style="margin-top:6px; font-size:11px; color:#666;">
						<span>0%</span><span>0.25%</span><span>0.50%</span><span>0.75%</span><span>1.00%</span>
					</div>
				</div>` : ""}

				${(d.tds != null) ? `
				<div class="scale-container" ${d.tdsEntityId ? `data-more-info="${d.tdsEntityId}"` : ''}>
					<div style="font-weight: 600; margin-bottom: 8px;">${_t(lang, "ui.tds")}</div>
					<div style="position: relative;">
						<div class="scale-marker" style="left: ${this._pct(d.tds, 0, 2000)}%"><div class="marker-value">${d.tds.toFixed(0)} ppm</div></div>
						<div class="scale-bar tds-bar">
							${[0,500,1000,1500,2000].map((n, i) => `<div class="scale-tick major" style="left: ${(i / 4) * 100}%"></div>`).join("")}
						</div>
					</div>
					<div class="scale-labels">
						<span>0</span><span>500</span><span>1000</span><span>1500</span><span>2000</span>
					</div>
				</div>` : ""}
		</div>`;
	}

	_renderCalendarBlock(d, c) {
        const lang = _langFromHass(this._hass);
		const nextStart = d.nextStartMins;
		const nextFilter = d.nextFilterMins;
		const nextEventSummary = d.nextEventSummary || _t(lang, "ui.scheduled_start");
		const nextEvent = d.nextEventStart ? this._formatEventTime(d.nextEventStart, d.nextEventEnd) : null;
		const nextStartText = nextStart != null ? this._formatCountdown(lang, nextStart).text : '–';
		return `<div class="calendar-block">
			<div class="section-title">${_t(lang, "ui.calendar_title")}</div>
			<div style="margin-top:8px">${nextEvent ? `<div><strong>${nextEventSummary}</strong><div class="event-time">${nextEvent}</div><div style="margin-top:6px">${_t(lang, "ui.next_event")} : ${nextStartText}</div></div>` : `<div>${_t(lang, "ui.next_event")} : ${nextStartText}</div>`}</div>
			${nextFilter != null ? `<div style="margin-top:8px">${_t(lang, "ui.next_filter_cycle")}: ${this._formatCountdown(lang, nextFilter).text}</div>` : ''}
		</div>`;
	}

	_renderMaintenanceBlock(d, c) {
        const lang = _langFromHass(this._hass);
		const saltAddDisplay = (d.saltAddNum != null && d.saltAddNum > 0)
			? (d.saltAddNum >= 1000 ? `${Math.round(d.saltAddNum)} ${d.saltAddUnit} (${(d.saltAddNum / 1000).toFixed(2)} kg)` : `${Math.round(d.saltAddNum)} ${d.saltAddUnit}`)
			: null;
		const items = [];
		if (d.phPlusNum && d.phPlusNum > 0) items.push(`<div class="maintenance-item"><ha-icon icon="mdi:ph"></ha-icon><div class="maintenance-text"><div class="maintenance-label">${_t(lang, "ui.add_ph_plus")}</div><div class="maintenance-value">${d.phPlusNum} ${d.phPlusUnit}</div></div></div>`);
		if (saltAddDisplay) items.push(`<div class="maintenance-item"><ha-icon icon="mdi:shaker"></ha-icon><div class="maintenance-text"><div class="maintenance-label">${_t(lang, "ui.add_salt")}</div><div class="maintenance-value">${saltAddDisplay}</div></div></div>`);
		if (d.waterChangePercent && d.waterChangePercent > 0) items.push(`<div class="maintenance-item"><ha-icon icon="mdi:water"></ha-icon><div class="maintenance-text"><div class="maintenance-label">${_t(lang, "ui.change_water")}</div><div class="maintenance-value">${d.waterChangePercent}%${d.waterChangeLiters ? ` — ${d.waterChangeLiters} L` : ''}</div></div></div>`);
		if (d.phMinusNum && d.phMinusNum > 0) items.push(`<div class="maintenance-item"><ha-icon icon="mdi:ph"></ha-icon><div class="maintenance-text"><div class="maintenance-label">${_t(lang, "ui.add_ph_minus")}</div><div class="maintenance-value">${d.phMinusNum} ${d.phMinusUnit}</div></div></div>`);
		if (d.chlorDoseNum && d.chlorDoseNum > 0) items.push(`<div class="maintenance-item"><ha-icon icon="mdi:beaker"></ha-icon><div class="maintenance-text"><div class="maintenance-label">${_t(lang, "ui.add_chlorine")}</div><div class="maintenance-value">${d.chlorDoseNum} ${d.chlorDoseUnit}</div></div></div>`);
		if (items.length === 0) items.push(`<div class="maintenance-item"><div class="maintenance-text"><div class="maintenance-label">${_t(lang, "ui.maintenance")}</div><div class="maintenance-value">${_t(lang, "ui.no_actions_needed") || '—'}</div></div></div>`);

		return `<div class="maintenance-block">
			<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
				<div class="section-title">${_t(lang, "ui.maintenance")}</div>
				<button class="action-btn maintenance ${d.maintenanceActive ? "active" : ""}" data-action="maintenance-toggle" title="${_t(lang, "actions.maintenance")}">
					<ha-icon icon="mdi:tools"></ha-icon><span>${_t(lang, "actions.maintenance")}</span>
				</button>
			</div>
			<div class="maintenance-items">${items.join('')}</div>
		</div>`;
	}

	// ========================================
	// Event Handlers
	// ========================================
	_attachHandlers() {
		const maintenanceActive = !!this._renderData?.maintenanceActive;

		// More-info popups (Home Assistant entity details)
		this.shadowRoot.querySelectorAll("[data-more-info]").forEach((el) => {
			const entityId = el.getAttribute("data-more-info");
			if (!entityId) return;
			// Prevent dial drag when clicking on inner elements (icons, numbers)
			el.addEventListener("pointerdown", (ev) => ev.stopPropagation());
			el.addEventListener("click", (ev) => {
				ev.stopPropagation();
				this._openMoreInfo(entityId);
			});
		});

		// Maintenance toggle: prefer pool_controller services, fallback to climate hvac_mode
		const maintenanceBtn = this.shadowRoot.querySelector('[data-action="maintenance-toggle"]');
		if (maintenanceBtn) {
			maintenanceBtn.addEventListener("click", (ev) => {
				ev.stopPropagation();
				if (!this._hass) return;
				const svc = maintenanceActive ? "stop_maintenance" : "start_maintenance";
				if (this._hasService("pool_controller", svc)) {
					this._hass.callService("pool_controller", svc, { climate_entity: this._config?.climate_entity });
					return;
				}
				this._hass.callService("climate", "set_hvac_mode", {
					entity_id: this._config?.climate_entity,
					hvac_mode: maintenanceActive ? "heat" : "off",
				});
			});
		}

		const tempButtons = this.shadowRoot.querySelectorAll(".temp-btn");
		tempButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				if (maintenanceActive) return;
				const action = btn.dataset.action;
				if (!this._hass) return;
				const tc = this._effectiveTempConfig();
				const step = Number(tc.step || 0.5);
				const climate = this._hass.states[this._config.climate_entity];
				const currentTarget = this._num(climate?.attributes?.temperature) ?? this._num(climate?.attributes?.target_temp) ?? tc.min_temp;
				const next = action === "inc" ? currentTarget + step : currentTarget - step;
				const newTemp = this._clamp(next, tc.min_temp, tc.max_temp);
				
				// Optimistic update: Sofort lokale Änderung anzeigen
				if (climate) {
					const optimisticState = { ...climate };
					optimisticState.attributes = { ...climate.attributes, temperature: newTemp };
					this._hass.states[this._config.climate_entity] = optimisticState;
					this._render();
				}
				
				// Service call im Hintergrund
				this._hass.callService("climate", "set_temperature", { 
					entity_id: this._config.climate_entity, 
					temperature: newTemp 
				});
			});
		});

		// Dial: Target-Temperatur per Klick/Drag am Ring setzen (ähnlich HA Climate Card)
		const dial = this.shadowRoot.querySelector("[data-dial]");
		if (dial) {
			const onPointerDown = (ev) => {
				if (!this._hass || !this._config) return;
				if (maintenanceActive) return;
				// Nur primäre Taste/Touch
				if (ev.pointerType === "mouse" && ev.button !== 0) return;
				// Nur wenn auf dem Ring gedrückt wurde (nicht in der Mitte).
				const rect = dial.getBoundingClientRect();
				if (!this._isPointerOnDialRing(ev.clientX, ev.clientY, rect)) return;
				this._isDraggingDial = true;
				dial.setPointerCapture?.(ev.pointerId);
				this._updateDialPreviewFromPointer(ev);
			};
			const onPointerMove = (ev) => {
				if (!this._isDraggingDial) return;
				this._updateDialPreviewFromPointer(ev);
			};
			const onPointerUp = (ev) => {
				if (!this._isDraggingDial) return;
				this._isDraggingDial = false;
				dial.releasePointerCapture?.(ev.pointerId);
				this._commitDialTargetIfAny();
			};
			dial.addEventListener("pointerdown", onPointerDown);
			dial.addEventListener("pointermove", onPointerMove);
			dial.addEventListener("pointerup", onPointerUp);
			dial.addEventListener("pointercancel", onPointerUp);
		}

		const actionButtons = this.shadowRoot.querySelectorAll(".action-btn");
		actionButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				const eff = this._withDerivedConfig(this._config || {});
				if (btn.dataset.action === "maintenance-toggle") return;
				if (maintenanceActive) return;
				const mode = btn.dataset.mode;
				const duration = Number(btn.dataset.duration);
				const active = btn.dataset.active === "true";
				const start = btn.dataset.start;
				const stop = btn.dataset.stop;

				// Prefer pool_controller services (new timer model). Fallback to entity triggers (old model).
					if (mode && this._hasService("pool_controller", active ? `stop_${mode}` : `start_${mode}`)) {
					const svc = active ? `stop_${mode}` : `start_${mode}`;
					const data = active
						? { climate_entity: this._config?.climate_entity }
						: { climate_entity: this._config?.climate_entity, duration_minutes: Number.isFinite(duration) ? duration : undefined };
					this._hass.callService("pool_controller", svc, data);
						// backend services will trigger coordinator refresh; still request entity update as fallback
						try {
							this._requestBackendEntityRefresh(eff);
						} catch (e) {}
						return;
				}

				if (active && stop) {
					this._triggerEntity(stop, false);
					try { this._requestBackendEntityRefresh(eff); } catch (e) {}
				} else if (!active && start) {
					this._triggerEntity(start, true);
					try { this._requestBackendEntityRefresh(eff); } catch (e) {}
				} else if (active && mode && this._hasService("pool_controller", `stop_${mode}`)) {
					this._hass.callService("pool_controller", `stop_${mode}`, { climate_entity: this._config?.climate_entity });
					try { this._requestBackendEntityRefresh(eff); } catch (e) {}
				}
			});
		});

		const auxSwitch = this.shadowRoot.querySelector(".aux-switch");
		if (auxSwitch) {
			auxSwitch.addEventListener("click", () => {
				if (maintenanceActive) return;
				const entity = auxSwitch.dataset.entity;
				if (entity && this._hass) {
					const isOn = this._isOn(this._hass.states[entity]);
					this._triggerEntity(entity, !isOn);
				}
			});
		}
	}

	_openMoreInfo(entityId) {
		if (!entityId) return;
		const ev = new CustomEvent("hass-more-info", {
			detail: { entityId },
			bubbles: true,
			composed: true,
		});

		// Primary: dispatch from this card element.
		this.dispatchEvent(ev);

		// Extra robustness: also dispatch from the HA root element (some wrappers/listeners are finicky).
		try {
			const haRoot = document.querySelector("home-assistant");
			haRoot?.dispatchEvent?.(ev);
		} catch (_e) {
			// ignore
		}

		// Fallback: setting moreInfoEntityId is commonly supported.
		try {
			if (this._hass && ("moreInfoEntityId" in this._hass)) {
				this._hass.moreInfoEntityId = entityId;
			}
		} catch (_e) {
			// ignore
		}
		try {
			const haRoot = document.querySelector("home-assistant");
			if (haRoot?.hass && ("moreInfoEntityId" in haRoot.hass)) {
				haRoot.hass.moreInfoEntityId = entityId;
			}
		} catch (_e) {
			// ignore
		}
	}

	_triggerEntity(entityId, turnOn = true) {
		if (!entityId || !this._hass) return;
		const [domain] = entityId.split(".");
		if (domain === "button") {
			this._hass.callService("button", "press", { entity_id: entityId });
			return;
		}
		if (domain === "switch") {
			this._hass.callService("switch", turnOn ? "turn_on" : "turn_off", { entity_id: entityId });
			return;
		}
		if (domain === "input_boolean") {
			this._hass.callService("input_boolean", turnOn ? "turn_on" : "turn_off", { entity_id: entityId });
			return;
		}
		this._hass.callService("homeassistant", turnOn ? "turn_on" : "turn_off", { entity_id: entityId });
	}

	_hasService(domain, service) {
		const services = this._hass?.services;
		return !!(services && services[domain] && services[domain][service]);
	}

	_requestBackendEntityRefresh(eff) {
		if (!this._hass || !eff) return;
		const ids = [
			eff.climate_entity,
			eff.main_switch_on_entity,
			eff.pump_switch_on_entity,
			eff.aux_heating_switch_on_entity,
			eff.manual_timer_entity,
			eff.auto_filter_timer_entity,
			eff.pause_timer_entity,
			eff.should_main_on_entity,
			eff.should_pump_on_entity,
			eff.should_aux_on_entity,
		].filter(Boolean);
		ids.forEach((eid) => {
			try {
				this._hass.callService("homeassistant", "update_entity", { entity_id: eid });
			} catch (e) {
				// best-effort: ignore errors
			}
		});
	}

	_getStatusText(hvac, hvacAction, maintenance, bathing, filtering, chlorinating, paused) {
		const lang = _langFromHass(this._hass);
		if (maintenance) return _t(lang, "status.maintenance");
		if (paused) return _t(lang, "status.pause");
		if (bathing) return _t(lang, "status.bathing");
		if (chlorinating) return _t(lang, "status.chlorine");
		if (filtering) return _t(lang, "status.filter");
		if (hvacAction === "heating" || hvacAction === "heat") return _t(lang, "status.heating");
		if (hvac === "off") return _t(lang, "status.off");
		return hvac || "–";
	}

	_heatReasonLabel(reason) {
		const lang = _langFromHass(this._hass);
		const r = String(reason || "").toLowerCase();
		const labels = {
			de: {
				off: "Aus",
				disabled: "Deaktiviert",
				bathing: "Baden",
				chlorine: "Chloren",
				filter: "Filtern",
				preheat: "Vorheizen (Kalender)",
				pv: "PV-Überschuss",
				thermostat: "Thermostat",
			},
			en: {
				off: "Off",
				disabled: "Disabled",
				bathing: "Bathing",
				chlorine: "Chlorine",
				filter: "Filter",
				preheat: "Preheat (calendar)",
				pv: "PV surplus",
				thermostat: "Thermostat",
			},
			es: {
				off: "Apagado",
				disabled: "Desactivado",
				bathing: "Baño",
				chlorine: "Cloro",
				filter: "Filtrar",
				preheat: "Precalentar (calendario)",
				pv: "Excedente FV",
				thermostat: "Termostato",
			},
			fr: {
				off: "Arrêt",
				disabled: "Désactivé",
				bathing: "Bain",
				chlorine: "Chlore",
				filter: "Filtrer",
				preheat: "Préchauffage (calendrier)",
				pv: "Surplus PV",
				thermostat: "Thermostat",
			},
		};
		return labels?.[lang]?.[r] || r || null;
	}

	_sanitizerModeLabel(mode) {
		const lang = _langFromHass(this._hass);
		const m = String(mode || "").toLowerCase();
		if (m === "chlorine") return _t(lang, "ui.sanitizer_chlorine");
		if (m === "saltwater") return _t(lang, "ui.sanitizer_saltwater");
		if (m === "mixed") return _t(lang, "ui.sanitizer_mixed");
		return m || null;
	}

	_runReasonLabel(reason) {
		const lang = _langFromHass(this._hass);
		const r = String(reason || "").toLowerCase();
		const labels = {
			de: {
				maintenance: "Wartung",
				pause: "Pause",
				bathing: "Baden",
				chlorine: "Chloren",
				filter: "Filtern",
				preheat: "Vorheizen (Kalender)",
				pv: "PV-Überschuss",
				frost: "Frostschutz",
				idle: "Leerlauf",
			},
			en: {
				maintenance: "Maintenance",
				pause: "Pause",
				bathing: "Bathing",
				chlorine: "Chlorine",
				filter: "Filtering",
				preheat: "Preheat (calendar)",
				pv: "PV surplus",
				frost: "Frost protection",
				idle: "Idle",
			},
			es: {
				maintenance: "Mantenimiento",
				pause: "Pausa",
				bathing: "Baño",
				chlorine: "Cloro",
				filter: "Filtrar",
				preheat: "Precalentar (calendario)",
				pv: "Excedente FV",
				frost: "Protección contra heladas",
				idle: "Inactivo",
			},
			fr: {
				maintenance: "Maintenance",
				pause: "Pause",
				bathing: "Bain",
				chlorine: "Chlore",
				filter: "Filtration",
				preheat: "Préchauffage (calendrier)",
				pv: "Surplus PV",
				frost: "Protection antigel",
				idle: "Inactif",
			},
		};
		return labels?.[lang]?.[r] || r || null;
	}

	_renderStatusMidIcon(d) {
		const title = d.statusText || "";
		const lang = _langFromHass(this._hass);
		const heatReason = String(d.heatReason || "").toLowerCase();
		const runReason = String(d.runReason || "").toLowerCase();

		// Choose what to display:
		// - if the backend explicitly says heating is disabled -> show that
		// - else if heating has a specific reason (pv/preheat/bathing/...) -> show heat reason
		// - else if the pool is running for a reason (filter/chlorine/...) -> show run reason
		const showKey = (heatReason === "disabled")
			? "disabled"
			: (heatReason && heatReason !== "off")
				? heatReason
				: (runReason && runReason !== "idle")
					? runReason
					: "";
		const isHeatKey = (heatReason === "disabled") || (heatReason && heatReason !== "off" && showKey === heatReason);

		const label = isHeatKey ? this._heatReasonLabel(showKey) : this._runReasonLabel(showKey);
		const heatPrefix = {
			de: "Heizgrund",
			en: "Heat reason",
			es: "Motivo de calefacción",
			fr: "Raison de chauffe",
		}[lang] || "Heat reason";
		const runPrefix = {
			de: "Grund",
			en: "Reason",
			es: "Motivo",
			fr: "Raison",
		}[lang] || "Reason";
		const tip = label ? `${isHeatKey ? heatPrefix : runPrefix}: ${label}` : title;
		const moreInfoEntityId = (d.heatReasonEntityId && isHeatKey)
			? d.heatReasonEntityId
			: (d.runReasonEntityId && !isHeatKey)
				? d.runReasonEntityId
				: (d.runReasonEntityId || d.heatReasonEntityId || d.climateEntityId || null);
		const moreInfo = moreInfoEntityId ? `data-more-info="${moreInfoEntityId}"` : "";

		if (showKey) {
			if (showKey === "pv") return `<span ${moreInfo}><ha-icon icon="mdi:solar-power" title="${tip}"></ha-icon></span>`;
			if (showKey === "preheat") return `<span ${moreInfo}><ha-icon icon="mdi:calendar-clock" title="${tip}"></ha-icon></span>`;
			if (showKey === "bathing") return `<span ${moreInfo}><ha-icon icon="mdi:pool" title="${tip}"></ha-icon></span>`;
			if (showKey === "chlorine") return `<span ${moreInfo}><ha-icon icon="mdi:fan" title="${tip}"></ha-icon></span>`;
			if (showKey === "filter") return `<span ${moreInfo}><ha-icon icon="mdi:rotate-right" title="${tip}"></ha-icon></span>`;
			if (showKey === "pause") return `<span ${moreInfo}><ha-icon icon="mdi:pause-circle" title="${tip}"></ha-icon></span>`;
			if (showKey === "frost") return `<span ${moreInfo}><ha-icon icon="mdi:snowflake" title="${tip}"></ha-icon></span>`;
			if (showKey === "maintenance") return `<span ${moreInfo}><ha-icon icon="mdi:tools" title="${tip}"></ha-icon></span>`;
			if (showKey === "disabled") return `<span ${moreInfo}><ha-icon icon="mdi:radiator-off" title="${tip}"></ha-icon></span>`;
			// Unknown value: show radiator with the raw label.
			return `<span ${moreInfo}><ha-icon icon="mdi:radiator" title="${tip}"></ha-icon></span>`;
		}

		// Legacy fallback: infer from UI state (still clickable; fallback to climate entity)
		if (d.pauseState?.active) return `<span ${moreInfo}><ha-icon icon="mdi:pause-circle" title="${title}" style="color:#e67e22"></ha-icon></span>`;
		if (d.bathingState?.active) return `<span ${moreInfo}><ha-icon icon="mdi:pool" title="${title}" style="color:#8a3b32"></ha-icon></span>`;
		if (d.chlorState?.active) return `<span ${moreInfo}><ha-icon icon="mdi:fan" title="${title}" style="color:#27ae60"></ha-icon></span>`;
		if (d.filterState?.active) return `<span ${moreInfo}><ha-icon icon="mdi:rotate-right" title="${title}" style="color:#2a7fdb"></ha-icon></span>`;
		if (d.hvacAction === "heating" || d.hvacAction === "heat") return `<span ${moreInfo}><ha-icon icon="mdi:radiator" title="${title}" style="color:#c0392b"></ha-icon></span>`;
		if (d.hvac === "off") return `<span ${moreInfo}><ha-icon icon="mdi:power" title="${title}" style="color:var(--secondary-text-color)"></ha-icon></span>`;
		return `<span ${moreInfo}><ha-icon icon="mdi:thermometer" title="${title}" style="color:var(--secondary-text-color)"></ha-icon></span>`;
	}

	_renderDialTimer(d) {
		const lang = _langFromHass(this._hass);
		// Frostlauf hat höchste Priorität, wenn aktiv
		if (d.frostState?.active && d.frostEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.frostProgress * 100}%; background: linear-gradient(90deg, #2a7fdb, #5c4ac7);"></div></div>
				<div class="timer-text">${_t(lang, "ui.frost")}: ${d.frostEta} min</div>
			</div>`;
		}
		if (d.bathingState?.active && d.bathingEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.bathingProgress * 100}%; background: linear-gradient(90deg, #8a3b32, #c0392b);"></div></div>
				<div class="timer-text">${_t(lang, "actions.bathing")}: ${d.bathingEta} min</div>
			</div>`;
		}
		if (d.filterState?.active && d.filterEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.filterProgress * 100}%; background: linear-gradient(90deg, #2a7fdb, #3498db);"></div></div>
				<div class="timer-text">${_t(lang, "actions.filter")}: ${d.filterEta} min</div>
			</div>`;
		}
		if (d.chlorState?.active && d.chlorEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.chlorProgress * 100}%; background: linear-gradient(90deg, #27ae60, #2ecc71);"></div></div>
				<div class="timer-text">${_t(lang, "actions.chlorine")}: ${d.chlorEta} min</div>
			</div>`;
		}
		if (d.chlorState?.active) {
			return `<div class="dial-timer">
				<div class="timer-text" style="font-weight: 600; color: #27ae60;">${_t(lang, "dial.chlorine_active")}</div>
			</div>`;
		}
		if (d.pauseState?.active && d.pauseEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.pauseProgress * 100}%; background: linear-gradient(90deg, #e67e22, #f39c12);"></div></div>
				<div class="timer-text">${_t(lang, "actions.pause")}: ${d.pauseEta} min</div>
			</div>`;
		}
		return "";
	}

	_formatEventTime(startTs, endTs) {
		if (!startTs) return "";
		const locale = this._hass?.locale?.language || this._hass?.language || undefined;
		const start = new Date(startTs);
		if (isNaN(start.getTime())) {
			return endTs && endTs !== startTs ? `${startTs} - ${endTs}` : startTs;
		}
		const startStr = start.toLocaleString(locale, { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
		if (!endTs) return startStr;
		const end = new Date(endTs);
		if (isNaN(end.getTime())) return `${startStr} - ${endTs}`;
		const endStr = end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
		return `${startStr} - ${endStr}`;
	}

	_modeState(h, entity, untilEntity, fallbackActiveEntity) {
		const now = Date.now();
		let active = false;
		let eta = null;
		if (entity && h.states[entity]) {
			active = this._isOn(h.states[entity]);
		}
		if (!active && fallbackActiveEntity && h.states[fallbackActiveEntity]) {
			active = this._isOn(h.states[fallbackActiveEntity]);
		}
		if (untilEntity && h.states[untilEntity]?.state) {
			const ts = new Date(h.states[untilEntity].state).getTime();
			if (!Number.isNaN(ts) && ts > now) {
				active = true;
				eta = Math.max(0, Math.round((ts - now) / 60000));
			}
		}
		return { active, eta };
	}

	_simpleTimerState(h, timerEntity) {
		if (!timerEntity || !h.states[timerEntity]) return { active: false, eta: null, duration_minutes: null };
		const st = h.states[timerEntity];
		const eta = this._num(st.state);
		const duration = this._num(st.attributes?.duration_minutes);
		const activeAttr = st.attributes?.active;
		const active = (activeAttr === true || activeAttr === "true") || (eta != null && eta > 0);
		return { active, eta: (eta != null ? Math.max(0, Math.round(eta)) : null), duration_minutes: duration };
	}

	_manualTimerState(h, timerEntity, expectedType) {
		if (!timerEntity || !h.states[timerEntity]) return { active: false, eta: null, duration_minutes: null };
		const st = h.states[timerEntity];
		const eta = this._num(st.state);
		const duration = this._num(st.attributes?.duration_minutes);
		const type = st.attributes?.type;
		const activeAttr = st.attributes?.active;
		const activeBase = (activeAttr === true || activeAttr === "true") || (eta != null && eta > 0);
		const active = activeBase && (!expectedType || type === expectedType);
		return { active, eta: (active && eta != null ? Math.max(0, Math.round(eta)) : null), duration_minutes: duration, type };
	}

	_calcDial(val, min, max) {
		const pct = this._clamp((val - min) / (max - min), 0, 1);
		return Math.round(pct * 270);
	}

	_arcPath(cx, cy, r, startDeg, sweepDeg) {
		const sweep = Number(sweepDeg);
		if (!Number.isFinite(sweep) || sweep === 0) return "";
		const startRad = (startDeg * Math.PI) / 180;
		const endRad = ((startDeg + sweep) * Math.PI) / 180;
		const x1 = cx + r * Math.cos(startRad);
		const y1 = cy + r * Math.sin(startRad);
		const x2 = cx + r * Math.cos(endRad);
		const y2 = cy + r * Math.sin(endRad);
		const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
		const sweepFlag = sweep >= 0 ? 1 : 0;
		return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${x2} ${y2}`;
	}

	_num(v) {
		if (v == null || v === '') return null;
		let str = String(v).trim();
		str = str.replace(/[a-zA-Z°%]+/g, '').trim();
		str = str.replace(',', '.');
		const n = Number(str);
		return Number.isFinite(n) ? n : null;
	}

	_clamp(v, a, b) {
		return Math.min(Math.max(v, a), b);
	}

	_isOn(stateObj) {
		if (!stateObj) return false;
		return stateObj.state === "on" || stateObj.state === "heat" || stateObj.state === "heating";
	}

	_pct(val, min, max) {
		return this._clamp(((val - min) / (max - min)) * 100, 0, 100);
	}

	_hasRelevantChanges(oldHass, newHass) {
		if (!this._config) return true;
		
		const relevantEntities = [
			this._config.climate_entity,
			this._config.outdoor_temp_entity,
			this._config.next_frost_mins_entity,
			this._config.maintenance_entity,
			this._config.heat_reason_entity,
			this._config.run_reason_entity,
			this._config.sanitizer_mode_entity,
			this._config.aux_entity,
			this._config.manual_timer_entity,
			this._config.auto_filter_timer_entity,
			this._config.pause_timer_entity,
			// Physische Schalter-Status-Entities explizit aufnehmen:
			this._config.main_switch_on_entity,
			this._config.pump_switch_on_entity,
			this._config.aux_heating_switch_on_entity,
			// Legacy timer model (backward compatible)
			this._config.bathing_entity,
			this._config.bathing_until,
			this._config.bathing_active_binary,
			this._config.filter_entity,
			this._config.filter_until,
			this._config.next_filter_in,
			this._config.chlorine_entity,
			this._config.chlorine_until,
			this._config.chlorine_active_entity,
			this._config.pause_entity,
			this._config.pause_until,
			this._config.pause_active_entity,
			this._config.frost_entity,
			this._config.quiet_entity,
			this._config.pv_entity,
			this._config.pv_power_entity,
			this._config.should_main_on_entity,
			this._config.should_pump_on_entity,
			this._config.should_aux_on_entity,
			this._config.main_power_entity,
			this._config.aux_power_entity,
			this._config.power_entity,
			this._config.ph_entity,
			this._config.chlorine_value_entity,
			this._config.salt_entity,
			this._config.salt_add_entity,
			this._config.tds_entity,
			this._config.tds_assessment_entity,
			this._config.water_change_percent_entity,
			this._config.water_change_liters_entity,
			this._config.ph_plus_entity,
			this._config.ph_minus_entity,
			this._config.chlor_dose_entity,
			this._config.next_start_entity,
			this._config.next_event_entity,
			this._config.next_event_end_entity,
			this._config.next_event_summary_entity,
		].filter(Boolean);

		const derived = this._derivedEntities ? Object.values(this._derivedEntities).filter(Boolean) : [];
		const allRelevant = relevantEntities.concat(derived);
		
		return allRelevant.some(entityId => {
			const oldState = oldHass.states[entityId];
			const newState = newHass.states[entityId];
			// Optional / nicht vorhandene Entities sollen keine Dauer-Re-Renders auslösen.
			if (!oldState && !newState) return false;
			if (!oldState || !newState) return true;
			return this._stateSig(entityId, oldState) !== this._stateSig(entityId, newState);
		});
	}

	_stateSig(entityId, st) {
		if (!st) return "";
		const [domain] = String(entityId).split(".");
		const a = st.attributes || {};
		const sig = { s: st.state };
		if (domain === "climate") {
			sig.a = {
				current_temperature: a.current_temperature,
				temperature: a.temperature,
				target_temp: a.target_temp,
				max_temp: a.max_temp,
				hvac_action: a.hvac_action,
				friendly_name: a.friendly_name,
			};
		} else if (domain === "sensor" && String(entityId).includes("timer_mins")) {
			sig.a = { active: a.active, duration_minutes: a.duration_minutes, type: a.type };
		} else if (domain === "sensor" && (String(entityId).endsWith("_heat_reason") || String(entityId).endsWith("_run_reason"))) {
			sig.a = { friendly_name: a.friendly_name };
		}
		return JSON.stringify(sig);
	}

	_updateDialPreviewFromPointer(ev) {
		if (!this._hass || !this._config) return;
		const dial = this.shadowRoot?.querySelector("[data-dial]");
		if (!dial) return;
		const rect = dial.getBoundingClientRect();
		const tc = this._effectiveTempConfig();
		const progress = this._dialProgressFromClientXY(ev.clientX, ev.clientY, rect);
		if (progress == null) return;
		const temp = this._tempFromDialProgress(progress, tc.min_temp, tc.max_temp, tc.step);
		this._dialDragTemp = temp;
		this._updateDialPreview(temp);
	}

	_commitDialTargetIfAny() {
		if (!this._hass || !this._config) return;
		if (this._dialDragTemp == null) return;
		const newTemp = this._dialDragTemp;
		this._dialDragTemp = null;
		const climate = this._hass.states[this._config.climate_entity];
		if (climate) {
			const optimisticState = { ...climate };
			optimisticState.attributes = { ...climate.attributes, temperature: newTemp };
			this._hass.states[this._config.climate_entity] = optimisticState;
			this._render();
		}
		this._hass.callService("climate", "set_temperature", {
			entity_id: this._config.climate_entity,
			temperature: newTemp,
		});
	}

	_dialProgressFromClientXY(clientX, clientY, rect) {
		if (!rect || !Number.isFinite(rect.width) || rect.width <= 0) return null;
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const dx = clientX - cx;
		const dy = clientY - cy;
		let deg = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
		deg = (deg + 360) % 360; // 0..359 (0°=3 Uhr, 90°=6 Uhr)
		// Arc: Start 135°, Sweep 270° bis 45° (Gap 45°..135°)
		if (deg > 45 && deg < 135) {
			// Im Gap: zum nächstgelegenen Ende snappen
			return (deg < 90) ? 270 : 0;
		}
		// Map 135..360 -> 0..225, 0..45 -> 225..270
		return (deg >= 135) ? (deg - 135) : (225 + deg);
	}

	_isPointerOnDialRing(clientX, clientY, rect) {
		if (!rect || !Number.isFinite(rect.width) || rect.width <= 0) return false;
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const dx = clientX - cx;
		const dy = clientY - cy;
		const r = Math.sqrt(dx * dx + dy * dy);
		const outer = Math.min(rect.width, rect.height) / 2;
		if (outer <= 0) return false;
		const ratio = r / outer;
		// Ring sits close to the outer edge (SVG radius 44 in a 100x100 box => ~0.88 of outer radius).
		// Use a tolerant band so it feels natural across sizes.
		return ratio >= 0.72 && ratio <= 1.02;
	}

	_tempFromDialProgress(progress, min, max, step) {
		const pct = this._clamp(progress / 270, 0, 1);
		let t = min + pct * (max - min);
		const s = Number(step) || 0.5;
		t = Math.round(t / s) * s;
		// 0.1er Floating-Fehler sauber machen
		t = Math.round(t * 10) / 10;
		return this._clamp(t, min, max);
	}

	_updateDialPreview(newTemp) {
		const tc = this._effectiveTempConfig();
		const min = Number(tc.min_temp);
		const max = Number(tc.max_temp);
		const progress = 270 * this._clamp((newTemp - min) / (max - min), 0, 1);
		const angle = 135 + progress;
		const dot = this.shadowRoot?.querySelector("circle.ring-dot-target");
		if (dot) {
			const cx = 50 + 44 * Math.cos(angle * Math.PI / 180);
			const cy = 50 + 44 * Math.sin(angle * Math.PI / 180);
			dot.setAttribute("cx", String(cx));
			dot.setAttribute("cy", String(cy));
		}
		const label = this.shadowRoot?.querySelector(".temp-target-left");
		if (label) {
			label.textContent = `${Number(newTemp).toFixed(1)}°C`;
		}
	}

	_withDerivedConfig(c) {
		const d = this._derivedEntities || {};
		const prefer = (key) => {
			const v = c?.[key];
			if (v == null) return d[key] ?? v;
			if (typeof v === 'string' && v.trim() === '') return d[key] ?? v;
			return v;
		};

		return {
			...c,
			outdoor_temp_entity: prefer('outdoor_temp_entity'),
			next_frost_mins_entity: prefer('next_frost_mins_entity'),
			sanitizer_mode_entity: prefer('sanitizer_mode_entity'),
			main_switch_on_entity: prefer('main_switch_on_entity'),
			pump_switch_on_entity: prefer('pump_switch_on_entity'),
			aux_heating_switch_on_entity: prefer('aux_heating_switch_on_entity'),
			should_main_on_entity: prefer('should_main_on_entity'),
			should_pump_on_entity: prefer('should_pump_on_entity'),
			should_aux_on_entity: prefer('should_aux_on_entity'),
			maintenance_entity: prefer('maintenance_entity'),
			heat_reason_entity: prefer('heat_reason_entity'),
			run_reason_entity: prefer('run_reason_entity'),
			manual_timer_entity: prefer('manual_timer_entity'),
			auto_filter_timer_entity: prefer('auto_filter_timer_entity'),
			pause_timer_entity: prefer('pause_timer_entity'),
			aux_entity: prefer('aux_entity'),
			aux_binary: prefer('aux_binary'),
			bathing_entity: prefer('bathing_entity'),
			bathing_start: prefer('bathing_start'),
			bathing_stop: prefer('bathing_stop'),
			bathing_until: prefer('bathing_until'),
			bathing_active_binary: prefer('bathing_active_binary'),
			filter_entity: prefer('filter_entity'),
			filter_start: prefer('filter_start'),
			filter_stop: prefer('filter_stop'),
			filter_until: prefer('filter_until'),
			next_filter_in: prefer('next_filter_in'),
			chlorine_entity: prefer('chlorine_entity'),
			chlorine_start: prefer('chlorine_start'),
			chlorine_stop: prefer('chlorine_stop'),
			chlorine_until: prefer('chlorine_until'),
			chlorine_active_entity: prefer('chlorine_active_entity'),
			pause_entity: prefer('pause_entity'),
			pause_start: prefer('pause_start'),
			pause_stop: prefer('pause_stop'),
			pause_until: prefer('pause_until'),
			pause_active_entity: prefer('pause_active_entity'),
			frost_entity: prefer('frost_entity'),
			quiet_entity: prefer('quiet_entity'),
			pv_entity: prefer('pv_entity'),
			pv_power_entity: prefer('pv_power_entity'),
			main_power_entity: prefer('main_power_entity'),
			aux_power_entity: prefer('aux_power_entity'),
			power_entity: prefer('power_entity'),
			ph_entity: prefer('ph_entity'),
			chlorine_value_entity: prefer('chlorine_value_entity'),
			// Config duration sensors
			filter_duration_entity: prefer('filter_duration_entity'),
			chlorine_duration_entity: prefer('chlorine_duration_entity'),
			bathing_duration_entity: prefer('bathing_duration_entity'),
			salt_entity: prefer('salt_entity'),
			salt_add_entity: prefer('salt_add_entity'),
			tds_entity: prefer('tds_entity'),
			tds_assessment_entity: prefer('tds_assessment_entity'),
			water_change_percent_entity: prefer('water_change_percent_entity'),
			water_change_liters_entity: prefer('water_change_liters_entity'),
			ph_plus_entity: prefer('ph_plus_entity'),
			ph_minus_entity: prefer('ph_minus_entity'),
			chlor_dose_entity: prefer('chlor_dose_entity'),
			next_start_entity: prefer('next_start_entity'),
			next_event_entity: prefer('next_event_entity'),
			next_event_end_entity: prefer('next_event_end_entity'),
			next_event_summary_entity: prefer('next_event_summary_entity'),
		};
	}

	async _getEntityRegistry() {
		if (!this._registry && this._hass) {
			this._registry = await this._hass.callWS({ type: "config/entity_registry/list" });
		}
		return this._registry || [];
	}

	_pickEntity(entries, domain, suffixes = []) {
		const list = Array.isArray(suffixes) ? suffixes.filter(Boolean) : [];
		for (const suffix of list) {
			const hit = entries.find((e) => e.entity_id?.startsWith(`${domain}.`) && e.unique_id?.endsWith(`_${suffix}`));
			if (hit?.entity_id) return hit.entity_id;
		}
		for (const suffix of list) {
			const token = String(suffix).toLowerCase();
			const hit = entries.find((e) => e.entity_id?.startsWith(`${domain}.`) && String(e.entity_id).toLowerCase().includes(token));
			if (hit?.entity_id) return hit.entity_id;
		}
		return null;
	}

	async _ensureDerivedEntities() {
		if (!this._hass || !this._config?.climate_entity) return;
		if (this._derivedEntities && this._derivedForClimate === this._config.climate_entity) return;

		let reg = [];
		try {
			reg = await this._getEntityRegistry();
		} catch (e) {
			return;
		}
		const selected = reg.find((r) => r.entity_id === this._config.climate_entity);
		if (!selected?.config_entry_id) return;
		const ceid = selected.config_entry_id;
		const entries = reg.filter((r) => r.config_entry_id === ceid && r.platform === "pool_controller");

		this._derivedEntities = {
			outdoor_temp_entity: this._pickEntity(entries, "sensor", ["outdoor_temp"]) || null,
			next_frost_mins_entity: this._pickEntity(entries, "sensor", ["next_frost_mins"]) || null,
			sanitizer_mode_entity: this._pickEntity(entries, "sensor", ["sanitizer_mode"]) || null,
			// Physical switch states (mirrors)
			main_switch_on_entity: this._pickEntity(entries, "binary_sensor", ["main_switch_on"]) || null,
			pump_switch_on_entity: this._pickEntity(entries, "binary_sensor", ["pump_switch_on"]) || null,
			aux_heating_switch_on_entity: this._pickEntity(entries, "binary_sensor", ["aux_heating_switch_on"]) || null,

			// Desired/should states exposed by the backend
			should_main_on_entity: this._pickEntity(entries, "binary_sensor", ["should_main_on"]) || null,
			should_pump_on_entity: this._pickEntity(entries, "binary_sensor", ["should_pump_on"]) || null,
			should_aux_on_entity: this._pickEntity(entries, "binary_sensor", ["should_aux_on", "should_aux_heating_on", "should_aux"]) || null,

			// Maintenance (hard lockout)
			maintenance_entity: this._pickEntity(entries, "binary_sensor", ["maintenance_active"]) || null,

			// Transparency
			heat_reason_entity: this._pickEntity(entries, "sensor", ["heat_reason"]) || null,
			run_reason_entity: this._pickEntity(entries, "sensor", ["run_reason"]) || null,

			// New v2 timers (minutes sensor)
			manual_timer_entity: this._pickEntity(entries, "sensor", ["manual_timer_mins"]) || null,
			auto_filter_timer_entity: this._pickEntity(entries, "sensor", ["auto_filter_timer_mins"]) || null,
			pause_timer_entity: this._pickEntity(entries, "sensor", ["pause_timer_mins"]) || null,
            // Frost-Timer (analog zu den anderen Timern)
            frost_timer_entity: this._pickEntity(entries, "sensor", ["frost_timer_mins"]) || null,

			// Core / controls
			climate_entity: this._pickEntity(entries, "climate", ["climate"]) || null,
			aux_entity: this._pickEntity(entries, "switch", ["aux"]) || null,
			// Binary sensor indicating an aux heater is configured (picked by unique_id suffix)
			aux_binary: this._pickEntity(entries, "binary_sensor", ["aux_present", "aux_configured", "aux"]) || null,
			bathing_entity: this._pickEntity(entries, "switch", ["bathing"]) || null,
			bathing_start: this._pickEntity(entries, "button", ["bath_60", "bath_30"]) || null,
			bathing_stop: this._pickEntity(entries, "button", ["bath_stop"]) || null,
			bathing_until: this._pickEntity(entries, "sensor", ["bathing_until"]) || null,
			bathing_active_binary: this._pickEntity(entries, "binary_sensor", ["is_bathing"]) || null,
			filter_entity: this._pickEntity(entries, "binary_sensor", ["filter_active"]) || null,
			filter_start: this._pickEntity(entries, "button", ["filter_30", "filter_60"]) || null,
			filter_stop: this._pickEntity(entries, "button", ["filter_stop"]) || null,
			filter_until: this._pickEntity(entries, "sensor", ["filter_until"]) || null,
			next_filter_in: this._pickEntity(entries, "sensor", ["next_filter_mins"]) || null,
			chlorine_entity: this._pickEntity(entries, "binary_sensor", ["is_quick_chlor"]) || null,
			chlorine_start: this._pickEntity(entries, "button", ["chlorine_5", "quick_chlor"]) || null,
			chlorine_stop: this._pickEntity(entries, "button", ["quick_chlor_stop"]) || null,
			chlorine_until: this._pickEntity(entries, "sensor", ["quick_chlorine_until"]) || null,
			chlorine_active_entity: this._pickEntity(entries, "binary_sensor", ["is_quick_chlor"]) || null,
			pause_entity: this._pickEntity(entries, "binary_sensor", ["is_paused"]) || null,
			pause_start: this._pickEntity(entries, "button", ["pause_60", "pause_30"]) || null,
			pause_stop: this._pickEntity(entries, "button", ["pause_stop"]) || null,
			pause_until: this._pickEntity(entries, "sensor", ["pause_until"]) || null,
			pause_active_entity: this._pickEntity(entries, "binary_sensor", ["is_paused"]) || null,

			// Status
			frost_entity: this._pickEntity(entries, "binary_sensor", ["frost_danger"]) || null,
			quiet_entity: this._pickEntity(entries, "binary_sensor", ["in_quiet"]) || null,
			pv_entity: this._pickEntity(entries, "binary_sensor", ["pv_allows"]) || null,

			// Power
			pv_power_entity: this._pickEntity(entries, "sensor", ["pv_power"]) || null,
			main_power_entity: this._pickEntity(entries, "sensor", ["main_power"]) || null,
			aux_power_entity: this._pickEntity(entries, "sensor", ["aux_power"]) || null,

			// Water quality
			ph_entity: this._pickEntity(entries, "sensor", ["ph_val"]) || null,
			chlorine_value_entity: this._pickEntity(entries, "sensor", ["chlor_val"]) || null,
			salt_entity: this._pickEntity(entries, "sensor", ["salt_val", "salt"]) || null,
			salt_add_entity: this._pickEntity(entries, "sensor", ["salt_add_g"]) || null,
			tds_entity: this._pickEntity(entries, "sensor", ["tds_effective", "tds_val", "tds", "tds_ppm"]) || null,
			tds_assessment_entity: this._pickEntity(entries, "sensor", ["tds_status", "tds_assessment", "tds_state"]) || null,
			water_change_liters_entity: this._pickEntity(entries, "sensor", ["tds_water_change_liters", "water_change_liters"]) || null,
			water_change_percent_entity: this._pickEntity(entries, "sensor", ["tds_water_change_percent", "water_change_percent"]) || null,
			ph_plus_entity: this._pickEntity(entries, "sensor", ["ph_plus_g"]) || null,
			ph_minus_entity: this._pickEntity(entries, "sensor", ["ph_minus_g"]) || null,
			chlor_dose_entity: this._pickEntity(entries, "sensor", ["chlor_spoons"]) || null,

			// Upcoming event
			next_start_entity: this._pickEntity(entries, "sensor", ["next_start_mins"]) || null,
			next_event_entity: this._pickEntity(entries, "sensor", ["next_event"]) || null,
			next_event_end_entity: this._pickEntity(entries, "sensor", ["next_event_end"]) || null,
			next_event_summary_entity: this._pickEntity(entries, "sensor", ["next_event_summary"]) || null,

			// Config value sensors (configured durations)
			filter_duration_entity: this._pickEntity(entries, "sensor", ["config_filter_minutes", "filter_minutes_config", "filter_minutes"]) || null,
			chlorine_duration_entity: this._pickEntity(entries, "sensor", ["config_chlorine_minutes", "chlorine_duration", "chlorine_minutes"]) || null,
			bathing_duration_entity: this._pickEntity(entries, "sensor", ["config_bathing_minutes", "bathing_minutes"]) || null,
		};
		this._derivedForClimate = this._config.climate_entity;
	}

	_renderError(msg) {
		this.shadowRoot.innerHTML = `<ha-card><div style="padding:16px;color:var(--error-color)">${msg}</div></ha-card>`;
	}
}

class PoolControllerCardEditor extends HTMLElement {
	set hass(hass) {
		this._hass = hass;
		this._lang = _langFromHass(hass);
		if (!this._initialized) {
			this._render();
			this._initialized = true;
		} else {
			const picker = this.shadowRoot?.querySelector("#controller");
			if (picker && this._hass) {
				picker.hass = this._hass;
			}
		}
	}

	setConfig(config) {
		this._config = { ...DEFAULTS, ...config };
		this._initialized = false;
		this._render();
		// If a controller_entity is already present in the config (editing an existing card),
		// immediately derive its related entities so the editor shows the mapped fields
		// without requiring the user to delete & recreate the card.
		try {
			if (this._config && this._config.controller_entity) {
				setTimeout(() => this._deriveFromController(), 100);
			}
		} catch (_e) {
			// best-effort: ignore errors during editor boot
		}
	}

	get value() {
		return this._config;
	}

	_render() {
		if (!this.shadowRoot) this.attachShadow({ mode: "open" });
		const c = this._config || DEFAULTS;
		const lang = this._lang || _langFromHass(this._hass);
		// Only show temperature bounds/step when the editor's content is 'controller'
		const showTempControls = (String(c.content || '').trim() === 'controller');
		const tempControlsHtml = showTempControls ? `
			<div class="grid2">
				<div class="row">
					<label>${_t(lang, "editor.temp_min")}</label>
					<input id="min_temp" type="number" step="0.5" value="${c.min_temp}">
				</div>
				<div class="row">
					<label>${_t(lang, "editor.temp_max")}</label>
					<input id="max_temp" type="number" step="0.5" value="${c.max_temp}">
				</div>
				<div class="row">
					<label>${_t(lang, "editor.step")}</label>
					<input id="step" type="number" step="0.1" value="${c.step || 0.5}">
				</div>
			</div>` : '';
		this.shadowRoot.innerHTML = `
		<style>
			:host { display:block; }
			.wrapper { display:grid; gap:12px; padding:12px; }
			.row { display:grid; gap:6px; }
			label { font-weight:600; }
			.grid2 { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; }
			.box { border:1px solid #d0d7de; border-radius:10px; padding:10px; background:#fff; }
			.badge { display:inline-block; padding:4px 8px; border-radius:8px; background:#f4f6f8; border:1px solid #e0e6ed; margin:2px 4px 0 0; font-size:12px; }
			button { border:1px solid #d0d7de; border-radius:8px; padding:8px 10px; cursor:pointer; background:#fff; font-weight:600; }
		</style>
		<div class="wrapper">
			<div class="row" id="derived-box" style="display:none;">
				<label>Abgeleitete Entities</label>
				<div id="derived-list" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
			</div>

			<div class="row">
				<label>${_t(lang, "editor.select_controller")}</label>
				<select id="controller-select" style="padding:8px; border:1px solid #d0d7de; border-radius:8px; background:#fff;">
					<option value="">${_t(lang, "editor.please_choose")}</option>
				</select>
			</div>
			<div class="row">
				<label>${_t(lang, "editor.content")}</label>
				<select id="content-select" style="padding:8px; border:1px solid #d0d7de; border-radius:8px; background:#fff;">
					<option value="controller">${_t(lang, "editor.content_options.controller")}</option>
					<option value="calendar">${_t(lang, "editor.content_options.calendar")}</option>
					<option value="waterquality">${_t(lang, "editor.content_options.waterquality")}</option>
					<option value="maintenance">${_t(lang, "editor.content_options.maintenance")}</option>
				</select>
			</div>
			${tempControlsHtml}
		</div>`;

		this._populateControllerSelect();

		this.shadowRoot.querySelectorAll("input").forEach((inp) => {
			inp.addEventListener("change", () => {
				const id = inp.id;
				const num = Number(inp.value);
				this._updateConfig({ [id]: Number.isFinite(num) ? num : inp.value });
			});
		});

		// Populate derived list if we have derived keys
		setTimeout(() => {
			const derivedBox = this.shadowRoot?.querySelector('#derived-box');
			const list = this.shadowRoot?.querySelector('#derived-list');
			if (!derivedBox || !list) return;
			list.innerHTML = '';
			const keys = ['filter_duration_entity','chlorine_duration_entity','bathing_duration_entity'];
			let any = false;
			for (const k of keys) {
				const v = this._config?.[k];
				if (v) {
					any = true;
					const span = document.createElement('span');
					span.className = 'badge';
					span.textContent = `${k}: ${v}`;
					span.title = 'Klicken für more-info';
					span.style.cursor = 'pointer';
					span.addEventListener('click', () => {
						this._openMoreInfo(v);
					});
					list.appendChild(span);
				}
			}
			derivedBox.style.display = any ? 'block' : 'none';
		}, 150);
	}

	async _populateControllerSelect() {
		if (!this._hass) return;
		const select = this.shadowRoot.querySelector("#controller-select");
		if (!select) return;
		const lang = this._lang || _langFromHass(this._hass);

		const reg = await this._getEntityRegistry();
		const poolControllers = reg.filter((r) => 
			r.platform === "pool_controller" && 
			r.entity_id.startsWith("climate.")
		);

		select.innerHTML = `<option value="">${_t(lang, "editor.please_choose")}</option>`;
		poolControllers.forEach((entity) => {
			const state = this._hass.states[entity.entity_id];
			const name = state?.attributes?.friendly_name || entity.entity_id;
			const option = document.createElement("option");
			option.value = entity.entity_id;
			option.textContent = name;
			if (entity.entity_id === this._config?.controller_entity) {
				option.selected = true;
			}
			select.appendChild(option);
		});

		if (poolControllers.length === 1 && !this._config?.controller_entity) {
			const firstController = poolControllers[0].entity_id;
			select.value = firstController;
			this._updateConfig({ controller_entity: firstController, climate_entity: firstController });
			setTimeout(() => this._deriveFromController(), 100);
		}

		// Use `onchange` to avoid stacking multiple anonymous listeners across re-renders.
		select.onchange = (ev) => {
			const val = ev.target.value;
			if (val) {
				this._updateConfig({ controller_entity: val, climate_entity: val });
				// Automatisch alle Entities vom ausgewählten Controller ableiten
				setTimeout(() => this._deriveFromController(), 100);
			}
		};



		// Populate content select (controller/calendar/waterquality/maintenance)
		try {
			const contentSelect = this.shadowRoot.querySelector('#content-select');
				if (contentSelect) {
				const opts = (I18N[lang] && I18N[lang].editor && I18N[lang].editor.content_options) || (I18N.de && I18N.de.editor && I18N.de.editor.content_options) || {};
				// ensure current value
				if (this._config && this._config.content) contentSelect.value = this._config.content;
				// Assign onchange to avoid duplicate listeners when re-rendering the editor
				contentSelect.onchange = (e) => { this._updateConfig({ content: e.target.value }); };
				// update option labels if localized map available
				for (const key of ['controller','calendar','waterquality','maintenance']) {
					const opt = contentSelect.querySelector(`option[value="${key}"]`);
					if (opt && opts && opts[key]) opt.textContent = opts[key];
				}
			}
		} catch (_e) {
			// ignore
		}

		// Note: do not add an internal 'config-changed' listener here — the host
		// will call `setConfig()` when config changes. Avoid redundant re-renders.
	}

	async _deriveFromController() {
		if (!this._hass || !this._config?.controller_entity) return;
		const reg = await this._getEntityRegistry();
		const selected = reg.find((r) => r.entity_id === this._config.controller_entity);
		if (!selected || !selected.config_entry_id) return;
		const ceid = selected.config_entry_id;
		const entries = reg.filter((r) => r.config_entry_id === ceid && r.platform === "pool_controller");
		
		const pick = (domain, suffix) => {
			const hit = entries.find((e) => e.entity_id.startsWith(`${domain}.`) && (suffix ? e.unique_id?.endsWith(`_${suffix}`) : true));
			return hit?.entity_id;
		};
			const cfg = {
			controller_entity: this._config.controller_entity,
			climate_entity: pick("climate", "climate") || this._config.climate_entity,
			outdoor_temp_entity: pick("sensor", "outdoor_temp") || this._config.outdoor_temp_entity,
			next_frost_mins_entity: pick("sensor", "next_frost_mins") || this._config.next_frost_mins_entity,
			sanitizer_mode_entity: pick("sensor", "sanitizer_mode") || this._config.sanitizer_mode_entity,
			main_switch_on_entity: pick("binary_sensor", "main_switch_on") || this._config.main_switch_on_entity,
			pump_switch_on_entity: pick("binary_sensor", "pump_switch_on") || this._config.pump_switch_on_entity,
			aux_heating_switch_on_entity: pick("binary_sensor", "aux_heating_switch_on") || this._config.aux_heating_switch_on_entity,
			maintenance_entity: pick("binary_sensor", "maintenance_active") || this._config.maintenance_entity,
			heat_reason_entity: pick("sensor", "heat_reason") || this._config.heat_reason_entity,
			run_reason_entity: pick("sensor", "run_reason") || this._config.run_reason_entity,
			// New v2 timers (minutes sensor)
			manual_timer_entity: pick("sensor", "manual_timer_mins") || this._config.manual_timer_entity,
			auto_filter_timer_entity: pick("sensor", "auto_filter_timer_mins") || this._config.auto_filter_timer_entity,
			pause_timer_entity: pick("sensor", "pause_timer_mins") || this._config.pause_timer_entity,
			aux_entity: pick("switch", "aux") || this._config.aux_entity,
			// Binary sensor indicating aux presence (aux_present / aux_configured)
			aux_binary: pick("binary_sensor", "aux_present") || pick("binary_sensor", "aux_configured") || pick("binary_sensor", "aux") || this._config.aux_binary,
			bathing_entity: pick("switch", "bathing") || this._config.bathing_entity,
			bathing_start: pick("button", "bath_60") || pick("button", "bath_30") || this._config.bathing_start,
			bathing_stop: pick("button", "bath_stop") || this._config.bathing_stop,
			bathing_until: pick("sensor", "bathing_until") || this._config.bathing_until,
			bathing_active_binary: pick("binary_sensor", "is_bathing") || this._config.bathing_active_binary,
			filter_entity: pick("binary_sensor", "filter_active") || this._config.filter_entity,
			filter_start: pick("button", "filter_30") || pick("button", "filter_60") || this._config.filter_start,
			filter_stop: pick("button", "filter_stop") || this._config.filter_stop,
			filter_until: pick("sensor", "filter_until") || this._config.filter_until,
			next_filter_in: pick("sensor", "next_filter_mins") || this._config.next_filter_in,
			chlorine_entity: pick("binary_sensor", "is_quick_chlor") || this._config.chlorine_entity,
			chlorine_start: pick("button", "chlorine_5") || pick("button", "quick_chlor") || this._config.chlorine_start,
			chlorine_stop: pick("button", "quick_chlor_stop") || this._config.chlorine_stop,
			chlorine_until: pick("sensor", "quick_chlorine_until") || this._config.chlorine_until,
			chlorine_active_entity: pick("binary_sensor", "is_quick_chlor") || this._config.chlorine_active_entity,
			pause_entity: pick("binary_sensor", "is_paused") || this._config.pause_entity,
			pause_start: pick("button", "pause_60") || pick("button", "pause_30") || this._config.pause_start,
			pause_stop: pick("button", "pause_stop") || this._config.pause_stop,
			pause_until: pick("sensor", "pause_until") || this._config.pause_until,
			pause_active_entity: pick("binary_sensor", "is_paused") || this._config.pause_active_entity,
			frost_entity: pick("binary_sensor", "frost_danger") || this._config.frost_entity,
			quiet_entity: pick("binary_sensor", "in_quiet") || this._config.quiet_entity,
			main_power_entity: pick("sensor", "main_power") || this._config.main_power_entity,
			aux_power_entity: pick("sensor", "aux_power") || this._config.aux_power_entity,
			pv_entity: pick("binary_sensor", "pv_allows") || this._config.pv_entity,
			pv_power_entity: pick("sensor", "pv_power") || this._config.pv_power_entity,
			ph_entity: pick("sensor", "ph_val") || this._config.ph_entity,
			chlorine_value_entity: pick("sensor", "chlor_val") || this._config.chlorine_value_entity,
			salt_entity: pick("sensor", "salt_val") || this._config.salt_entity,
			salt_add_entity: pick("sensor", "salt_add_g") || this._config.salt_add_entity,
			tds_entity: pick("sensor", "tds_effective") || pick("sensor", "tds_val") || this._config.tds_entity,
			tds_assessment_entity: pick("sensor", "tds_status") || this._config.tds_assessment_entity,
			water_change_liters_entity: pick("sensor", "tds_water_change_liters") || this._config.water_change_liters_entity,
			water_change_percent_entity: pick("sensor", "tds_water_change_percent") || this._config.water_change_percent_entity,
			ph_plus_entity: pick("sensor", "ph_plus_g") || this._config.ph_plus_entity,
			ph_minus_entity: pick("sensor", "ph_minus_g") || this._config.ph_minus_entity,
			chlor_dose_entity: pick("sensor", "chlor_spoons") || this._config.chlor_dose_entity,
			next_start_entity: pick("sensor", "next_start_mins") || this._config.next_start_entity,
			next_event_entity: pick("sensor", "next_event") || this._config.next_event_entity,
			next_event_end_entity: pick("sensor", "next_event_end") || this._config.next_event_end_entity,
			next_event_summary_entity: pick("sensor", "next_event_summary") || this._config.next_event_summary_entity,
		};
		this._updateConfig(cfg);
		// Refresh editor UI to show derived picks
		try { this._render(); } catch (_e) {}
	}

	async _getEntityRegistry() {
		if (!this._registry) {
			this._registry = await this._hass.callWS({ type: "config/entity_registry/list" });
		}
		return this._registry;
	}

	_updateConfig(patch, renderOnly = false) {
		this._config = { ...DEFAULTS, ...this._config, ...patch };
		if (!renderOnly) {
			this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
		}
	}
}

customElements.define(`${CARD_TYPE}-editor`, PoolControllerCardEditor);
customElements.define(`${CARD_TYPE}-card`, PoolControllerCard);

window.customCards = window.customCards || [];
window.customCards.push({
	type: CARD_TYPE,
	name: "Pool Controller",
	description: `Whirlpool/Pool Steuerung ohne iFrame. (v${VERSION})`,
});

class PoolControllerCardWrapper extends HTMLElement {
	setConfig(config) {
		this._config = config;
	}
	
	set hass(hass) {
		if (!this._card) {
			this._card = document.createElement(`${CARD_TYPE}-card`);
			this._card.setConfig(this._config);
			this.appendChild(this._card);
		}
		this._card.hass = hass;
	}
	
	static getConfigElement() {
		return document.createElement(`${CARD_TYPE}-editor`);
	}
	
	static getStubConfig() {
		return {};
	}
}

window.customElements.define(CARD_TYPE, PoolControllerCardWrapper);
