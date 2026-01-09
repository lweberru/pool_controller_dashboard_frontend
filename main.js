/**
 * Pool Controller dashboard custom card (no iframe).
 * v1.5.34 - UI: maintenance mode warning banner
 */

const VERSION = "1.5.34";
try {
	// Helps confirm in HA DevTools that the latest bundle is actually loaded.
	console.info(`[pool_controller_dashboard_frontend] loaded v${VERSION}`);
} catch (_e) {
	// ignore
}

const CARD_TYPE = "pc-pool-controller";
const DEFAULTS = {
	min_temp: 10,
	max_temp: 40,
	step: 0.5,
	chlor_ok_min: 650,
	chlor_ok_max: 850,
	pv_on: 1000,
	pv_off: 500,
	bathing_max_mins: 120,
	filter_max_mins: 120,
	chlor_max_mins: 60,
	pause_max_mins: 120,
};

// ========================================
// i18n (keep dependency-free / single-file)
// ========================================
const SUPPORTED_LANGS = ["de", "en", "es", "fr"];

const I18N = {
	de: {
		errors: {
			required_climate: "climate_entity ist erforderlich",
			entity_not_found: "Entity {entity} nicht gefunden",
		},
		ui: {
			frost: "Frostschutz",
			quiet: "Ruhezeit",
			pv: "PV-Überschuss",
			additional_heater: "Zusatzheizung",
			next_event: "Nächster Termin",
			next_filter_cycle: "Nächster Filter-Zyklus",
			in_minutes: "in {mins} Minuten",
			scheduled_start: "Geplanter Start",
			water_quality: "Wasserqualität",
			maintenance: "⚠️ Wartungsarbeiten",
			maintenance_mode_title: "Wartung aktiv",
			maintenance_mode_text: "Automatik, Filter, PV und Frostschutz sind deaktiviert.",
			ph: "pH-Wert",
			chlorine: "Chlor",
			salt: "Salzgehalt",
			tds: "TDS",
			add_ph_plus: "pH+ hinzufügen",
			add_ph_minus: "pH- hinzufügen",
			add_chlorine: "Chlor hinzufügen",
			change_water: "Wasser wechseln",
			minutes_short: "min",
		},
		actions: { bathing: "Baden", filter: "Filtern", chlorine: "Chloren", pause: "Pause" },
		status: { maintenance: "Wartung", pause: "Pause", bathing: "Baden", chlorine: "Chloren", filter: "Filtern", heating: "Heizt", off: "Aus" },
		dial: {
			bathing_left: "Baden: noch {mins} min",
			filter_left: "Filtern: noch {mins} min",
			chlorine_left: "Chloren: noch {mins} min",
			chlorine_active: "Chloren aktiv",
			pause_left: "Pause: noch {mins} min",
		},
		editor: {
			select_controller: "Pool Controller auswählen",
			please_choose: "Bitte wählen...",
			temp_min: "Temperatur-Minimum",
			temp_max: "Temperatur-Maximum",
			step: "Schrittweite",
		},
	},
	en: {
		errors: {
			required_climate: "climate_entity is required",
			entity_not_found: "Entity {entity} not found",
		},
		ui: {
			frost: "Frost protection",
			quiet: "Quiet hours",
			pv: "PV surplus",
			additional_heater: "Additional heater",
			next_event: "Next event",
			next_filter_cycle: "Next filter cycle",
			in_minutes: "in {mins} minutes",
			scheduled_start: "Scheduled start",
			water_quality: "Water quality",
			maintenance: "⚠️ Maintenance",
			maintenance_mode_title: "Maintenance active",
			maintenance_mode_text: "Automation, filter, PV and frost protection are disabled.",
			ph: "pH",
			chlorine: "Chlorine",
			salt: "Salt",
			tds: "TDS",
			add_ph_plus: "Add pH+",
			add_ph_minus: "Add pH-",
			add_chlorine: "Add chlorine",
			change_water: "Change water",
			minutes_short: "min",
		},
		actions: { bathing: "Bathing", filter: "Filter", chlorine: "Chlorine", pause: "Pause" },
		status: { maintenance: "Maintenance", pause: "Pause", bathing: "Bathing", chlorine: "Chlorine", filter: "Filtering", heating: "Heating", off: "Off" },
		dial: {
			bathing_left: "Bathing: {mins} min left",
			filter_left: "Filtering: {mins} min left",
			chlorine_left: "Chlorine: {mins} min left",
			chlorine_active: "Chlorine active",
			pause_left: "Pause: {mins} min left",
		},
		editor: {
			select_controller: "Select Pool Controller",
			please_choose: "Please choose...",
			temp_min: "Temperature minimum",
			temp_max: "Temperature maximum",
			step: "Step",
		},
	},
	es: {
		errors: {
			required_climate: "climate_entity es obligatorio",
			entity_not_found: "Entidad {entity} no encontrada",
		},
		ui: {
			frost: "Protección contra heladas",
			quiet: "Horas silenciosas",
			pv: "Excedente FV",
			additional_heater: "Calentador auxiliar",
			next_event: "Próximo evento",
			next_filter_cycle: "Próximo ciclo de filtración",
			in_minutes: "en {mins} minutos",
			scheduled_start: "Inicio programado",
			water_quality: "Calidad del agua",
			maintenance: "⚠️ Mantenimiento",
			maintenance_mode_title: "Mantenimiento activo",
			maintenance_mode_text: "La automatización, filtrado, FV y protección contra heladas están desactivados.",
			ph: "pH",
			chlorine: "Cloro",
			salt: "Sal",
			tds: "TDS",
			add_ph_plus: "Añadir pH+",
			add_ph_minus: "Añadir pH-",
			add_chlorine: "Añadir cloro",
			change_water: "Cambiar agua",
			minutes_short: "min",
		},
		actions: { bathing: "Baño", filter: "Filtrar", chlorine: "Cloro", pause: "Pausa" },
		status: { maintenance: "Mantenimiento", pause: "Pausa", bathing: "Baño", chlorine: "Cloro", filter: "Filtrar", heating: "Calentando", off: "Apagado" },
		dial: {
			bathing_left: "Baño: quedan {mins} min",
			filter_left: "Filtrar: quedan {mins} min",
			chlorine_left: "Cloro: quedan {mins} min",
			chlorine_active: "Cloro activo",
			pause_left: "Pausa: quedan {mins} min",
		},
		editor: {
			select_controller: "Seleccionar Pool Controller",
			please_choose: "Por favor elige...",
			temp_min: "Temperatura mínima",
			temp_max: "Temperatura máxima",
			step: "Paso",
		},
	},
	fr: {
		errors: {
			required_climate: "climate_entity est requis",
			entity_not_found: "Entité {entity} introuvable",
		},
		ui: {
			frost: "Protection antigel",
			quiet: "Heures calmes",
			pv: "Surplus PV",
			additional_heater: "Chauffage auxiliaire",
			next_event: "Prochain événement",
			next_filter_cycle: "Prochain cycle de filtration",
			in_minutes: "dans {mins} minutes",
			scheduled_start: "Démarrage planifié",
			water_quality: "Qualité de l'eau",
			maintenance: "⚠️ Entretien",
			maintenance_mode_title: "Maintenance active",
			maintenance_mode_text: "L'automatisation, la filtration, le PV et la protection antigel sont désactivés.",
			ph: "pH",
			chlorine: "Chlore",
			salt: "Sel",
			tds: "TDS",
			add_ph_plus: "Ajouter pH+",
			add_ph_minus: "Ajouter pH-",
			add_chlorine: "Ajouter du chlore",
			change_water: "Changer l'eau",
			minutes_short: "min",
		},
		actions: { bathing: "Bain", filter: "Filtrer", chlorine: "Chlore", pause: "Pause" },
		status: { maintenance: "Maintenance", pause: "Pause", bathing: "Bain", chlorine: "Chlore", filter: "Filtrer", heating: "Chauffe", off: "Arrêt" },
		dial: {
			bathing_left: "Bain : {mins} min restantes",
			filter_left: "Filtrer : {mins} min restantes",
			chlorine_left: "Chlore : {mins} min restantes",
			chlorine_active: "Chlore actif",
			pause_left: "Pause : {mins} min restantes",
		},
		editor: {
			select_controller: "Sélectionner Pool Controller",
			please_choose: "Veuillez choisir...",
			temp_min: "Température minimum",
			temp_max: "Température maximum",
			step: "Pas",
		},
	},
};

function _normalizeLang(lang) {
	const raw = String(lang || "").trim();
	if (!raw) return "de";
	const base = raw.toLowerCase().split("-")[0];
	return SUPPORTED_LANGS.includes(base) ? base : "de";
}

function _langFromHass(hass) {
	return _normalizeLang(hass?.language || hass?.locale?.language);
}

function _t(lang, key, vars = {}) {
	const dict = I18N[lang] || I18N.de;
	const parts = String(key).split(".");
	let cur = dict;
	for (const p of parts) {
		cur = cur?.[p];
	}
	let str = (typeof cur === "string") ? cur : key;
	for (const [k, v] of Object.entries(vars || {})) {
		str = str.replaceAll(`{${k}}`, String(v));
	}
	return str;
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

		// Komplettes Rendering
		this.shadowRoot.innerHTML = `
		${this._getStyles()}
		<ha-card>
			<div class="header">
				<div class="title">${c.title || climate.attributes.friendly_name || "Pool Controller"}</div>
			</div>
			${data.maintenanceActive ? `
			<div class="maintenance-mode" ${data.maintenanceEntityId ? `data-more-info="${data.maintenanceEntityId}"` : ""}>
				<div class="maintenance-mode-title">${_t(lang, "ui.maintenance_mode_title")}</div>
				<div class="maintenance-mode-text">${_t(lang, "ui.maintenance_mode_text")}</div>
			</div>` : ""}
			
			<div class="content-grid">
				${this._renderLeftColumn(data, effectiveConfig)}
				${this._renderRightColumn(data, effectiveConfig)}
			</div>
		</ha-card>`;

		this._attachHandlers();
	}

	// ========================================
	// MODULAR: Daten-Vorbereitung
	// ========================================
	_prepareData(h, c, climate) {
		const current = this._num(climate.attributes.current_temperature);
		const target = this._num(climate.attributes.temperature) ?? this._num(climate.attributes.target_temp) ?? this._num(climate.attributes.max_temp);
		const hvac = climate.state;
		const hvacAction = climate.attributes.hvac_action;
		const climateOff = hvac === "off" || hvac === "unavailable" || hvac === "unknown";
		const auxOn = c.aux_entity ? this._isOn(h.states[c.aux_entity]) : (h.states[c.aux_binary]?.state === "on");

		const maintenanceEntityId = c.maintenance_entity || this._derivedEntities?.maintenance_entity || null;
		const maintenanceActive = maintenanceEntityId ? this._isOn(h.states[maintenanceEntityId]) : false;

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
		if (hasNewTimerSensors) {
			bathingState = this._manualTimerState(h, manualTimerEntity, "bathing");
			chlorState = this._manualTimerState(h, manualTimerEntity, "chlorine");
			const manualFilterState = this._manualTimerState(h, manualTimerEntity, "filter");
			const autoFilterState = this._simpleTimerState(h, autoFilterTimerEntity);
			filterState = (manualFilterState.active ? manualFilterState : autoFilterState);
			pauseState = this._simpleTimerState(h, pauseTimerEntity);
		} else {
			bathingState = this._modeState(h, c.bathing_entity, c.bathing_until, c.bathing_active_binary);
			filterState = this._modeState(h, c.filter_entity, c.filter_until, c.next_filter_in);
			chlorState = this._modeState(h, c.chlorine_entity, c.chlorine_until, c.chlorine_active_entity);
			pauseState = this._modeState(h, c.pause_entity, c.pause_until, c.pause_active_entity);
		}
		
		const frost = c.frost_entity ? this._isOn(h.states[c.frost_entity]) : false;
		const quiet = c.quiet_entity ? this._isOn(h.states[c.quiet_entity]) : false;
		const pvAllows = c.pv_entity ? this._isOn(h.states[c.pv_entity]) : false;
		const pvPowerEntityId = c.pv_power_entity || null;
		
		const mainPower = c.main_power_entity ? this._num(h.states[c.main_power_entity]?.state) : null;
		const auxPower = c.aux_power_entity ? this._num(h.states[c.aux_power_entity]?.state) : null;
		const powerVal = mainPower ?? (c.power_entity ? this._num(h.states[c.power_entity]?.state) : null);

		const ph = c.ph_entity ? this._num(h.states[c.ph_entity]?.state) : null;
		const chlor = c.chlorine_value_entity ? this._num(h.states[c.chlorine_value_entity]?.state) : null;
		const saltEntityId = c.salt_entity || this._derivedEntities?.salt_entity;
		const tdsEntityId = c.tds_entity || this._derivedEntities?.tds_entity;
		const salt = saltEntityId ? this._num(h.states[saltEntityId]?.state) : null;
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

		const dialAngle = this._calcDial(current ?? c.min_temp, c.min_temp, c.max_temp);
		const targetAngle = this._calcDial(target ?? current ?? c.min_temp, c.min_temp, c.max_temp);

		const bathingEta = bathingState.eta;
		const filterEta = filterState.eta;
		const chlorEta = chlorState.eta;
		const pauseEta = pauseState.eta;
		
		// Dauer: bevorzugt vom Timer-Sensor (duration_minutes), sonst ggf. alte Duration-Entities, sonst DEFAULTS.
		const bathingMaxMins = this._num(bathingState.duration_minutes) ?? (c.bathing_duration_entity ? this._num(h.states[c.bathing_duration_entity]?.state) : null);
		const filterMaxMins = this._num(filterState.duration_minutes) ?? (c.filter_duration_entity ? this._num(h.states[c.filter_duration_entity]?.state) : null);
		const chlorMaxMins = this._num(chlorState.duration_minutes) ?? (c.chlorine_duration_entity ? this._num(h.states[c.chlorine_duration_entity]?.state) : null);
		const pauseMaxMins = this._num(pauseState.duration_minutes) ?? (c.pause_duration_entity ? this._num(h.states[c.pause_duration_entity]?.state) : null);
		
		// Progress = verbleibender Anteil
		const bathingProgress = bathingEta != null ? this._clamp(bathingEta / (bathingMaxMins || bathingEta || c.bathing_max_mins), 0, 1) : 0;
		const filterProgress = filterEta != null ? this._clamp(filterEta / (filterMaxMins || filterEta || c.filter_max_mins), 0, 1) : 0;
		const chlorProgress = chlorEta != null ? this._clamp(chlorEta / (chlorMaxMins || chlorEta || c.chlor_max_mins), 0, 1) : 0;
		const pauseProgress = pauseEta != null ? this._clamp(pauseEta / (pauseMaxMins || pauseEta || c.pause_max_mins), 0, 1) : 0;

		const pillClass = maintenanceActive ? "active" : (bathingState.active || filterState.active || chlorState.active) ? "active" : pauseState.active ? "warn" : frost ? "on" : "";
		const statusText = this._getStatusText(hvac, hvacAction, maintenanceActive, bathingState.active, filterState.active, chlorState.active, pauseState.active);

		return {
			// Entity IDs (for HA more-info popups)
			climateEntityId: c.climate_entity,
			maintenanceEntityId: maintenanceEntityId,
			phEntityId: c.ph_entity || null,
			chlorEntityId: c.chlorine_value_entity || null,
			saltEntityId: saltEntityId || null,
			tdsEntityId: tdsEntityId || null,
			frostEntityId: c.frost_entity || null,
			quietEntityId: c.quiet_entity || null,
			pvAllowsEntityId: c.pv_entity || null,
			pvPowerEntityId: pvPowerEntityId,
			mainPowerEntityId: c.main_power_entity || null,
			powerEntityId: c.power_entity || null,

			maintenanceActive,
			current, target, hvac, hvacAction, climateOff, auxOn,
			bathingState, filterState, chlorState, pauseState,
			frost, quiet, pvAllows,
			mainPower, auxPower, powerVal,
			ph, chlor, salt, tds,
			tdsAssessment, waterChangePercent, waterChangeLiters,
			phPlusNum, phPlusUnit, phMinusNum, phMinusUnit, chlorDoseNum, chlorDoseUnit,
			nextStartMins, nextFilterMins, nextEventStart, nextEventEnd, nextEventSummary,
			dialAngle, targetAngle,
			bathingEta, filterEta, chlorEta, pauseEta,
			bathingMaxMins, filterMaxMins, chlorMaxMins, pauseMaxMins,
			bathingProgress, filterProgress, chlorProgress, pauseProgress,
			pillClass, statusText
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
				.right-column { max-width: 520px; justify-self: end; }
			}
			
			.dial-container { display: grid; place-items: center; }
			.dial { position: relative; aspect-ratio: 1 / 1; width: 100%; max-width: 280px; display: grid; place-items: center; }
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
			
			.status-icons { position: absolute; top: 22%; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; align-items: center; z-index: 1; }
			.status-icon { width: 32px; height: 32px; border-radius: 50%; background: #f4f6f8; display: grid; place-items: center; border: 2px solid #d0d7de; opacity: 0.35; transition: all 200ms ease; }
			.status-icon.active { background: #8a3b32; color: #fff; border-color: #8a3b32; opacity: 1; box-shadow: 0 2px 8px rgba(138,59,50,0.3); }
			.status-icon.frost.active { background: #2a7fdb; border-color: #2a7fdb; box-shadow: 0 2px 8px rgba(42,127,219,0.3); }
			.status-icon ha-icon { --mdc-icon-size: 18px; }
			
			.dial-core { position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%); display: grid; gap: 6px; place-items: center; text-align: center; z-index: 1; }
			.temp-current { font-size: 48px; font-weight: 700; line-height: 1; }
			.divider { width: 80px; height: 2px; background: #d0d7de; margin: 4px 0; }
			.temp-target-row { display: grid; grid-template-columns: 1fr auto 1fr; column-gap: 10px; align-items: center; width: 160px; font-size: 16px; color: var(--secondary-text-color); }
			.temp-target-left { justify-self: start; }
			.temp-target-mid { justify-self: center; display: grid; place-items: center; opacity: 0.9; }
			.temp-target-right { justify-self: end; }
			.temp-target-left, .temp-target-right { font-weight: 600; white-space: nowrap; }
			.temp-target-row ha-icon { --mdc-icon-size: 18px; }
			
			.dial-timer { position: absolute; left: 50%; bottom: 16%; transform: translateX(-50%); width: 44%; max-width: 120px; z-index: 1; }
			.timer-bar { height: 4px; background: #e6e9ed; border-radius: 999px; overflow: hidden; position: relative; }
			.timer-fill { height: 100%; border-radius: inherit; transition: width 300ms ease; }
			.timer-text { font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; text-align: center; }

			.right-column { width: 100%; }
			
			.action-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px; max-width: 300px; }
			.action-btn { padding: 12px; border-radius: 10px; border: 2px solid #d0d7de; background: #fff; cursor: pointer; transition: all 150ms ease; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
			.action-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); border-color: #8a3b32; }
			.action-btn.active { background: #8a3b32; color: #fff; border-color: #8a3b32; }
			.action-btn.filter.active { background: #2a7fdb; border-color: #2a7fdb; }
			.action-btn.chlorine.active { background: #27ae60; border-color: #27ae60; }
			.action-btn ha-icon { --mdc-icon-size: 20px; }
			
			.temp-controls { display: grid; grid-template-columns: repeat(2, 64px); gap: 16px; margin-top: 16px; }
			.temp-btn { height: 64px; border-radius: 50%; border: 2px solid #d0d7de; background: #fff; font-size: 28px; font-weight: 700; cursor: pointer; transition: all 150ms ease; }
			.temp-btn:hover { box-shadow: 0 6px 14px rgba(0,0,0,0.1); transform: scale(1.05); border-color: #8a3b32; }
			
			.aux-switch { margin-top: 16px; padding: 12px 16px; border: 2px solid #d0d7de; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: space-between; gap: 20px; cursor: pointer; transition: all 150ms ease; max-width: 300px; }
			.aux-switch:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
			.aux-switch.active { background: #c0392b; color: #fff; border-color: #c0392b; }
			.aux-switch-label { font-weight: 600; display: flex; align-items: center; gap: 8px; }
			.aux-switch-label ha-icon { --mdc-icon-size: 20px; }
			.toggle { width: 44px; height: 24px; background: #d0d7de; border-radius: 999px; position: relative; transition: background 200ms ease; }
			.toggle::after { content: ""; position: absolute; width: 18px; height: 18px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: left 200ms ease; }
			.aux-switch.active .toggle { background: #fff; }
			.aux-switch.active .toggle::after { left: 23px; background: #c0392b; }
			
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
			/* Marker sollen im Balken sitzen (nicht über der Überschrift). */
			.scale-marker { position: absolute; top: 8px; transform: translateX(-50%); z-index: 1; }
			.marker-value { background: #0b132b; color: #fff; padding: 6px 10px; border-radius: 8px; font-weight: 700; font-size: 13px; white-space: nowrap; position: relative; }
			.marker-value::after { content: ""; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 10px solid #0b132b; }
			@container (max-width: 520px) {
				/* Schmal: Dial-UI leicht kompakter, Marker weiterhin im Balken. */
				.temp-current { font-size: 42px; }
				.status-icons { top: 18%; gap: 10px; }
				.status-icon { width: 28px; height: 28px; }
				.status-icon ha-icon { --mdc-icon-size: 16px; }
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
		</style>`;
	}

	// ========================================
	// MODULAR: Linke Spalte (Dial + Controls)
	// ========================================
	_renderLeftColumn(d, c) {
		const lang = _langFromHass(this._hass);
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
		return `<div class="left-column">
			<div class="dial-container">
				<div class="dial" style="--accent:${accent}; --target-accent:${targetAccent}" data-dial>
					<div class="ring">
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
							<div class="status-icon frost ${d.frost ? "active" : ""}" title="${_t(lang, "ui.frost")}" ${d.frostEntityId ? `data-more-info="${d.frostEntityId}"` : ''}>
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
							<span class="temp-target-right" ${(d.mainPowerEntityId || d.powerEntityId) ? `data-more-info="${d.mainPowerEntityId || d.powerEntityId}"` : ''}>${d.mainPower !== null ? `${d.mainPower}W` : d.powerVal !== null ? `${d.powerVal}W` : ''}</span>
						</div>
					</div>
					${this._renderDialTimer(d)}
				</div>
				<div class="temp-controls">
					<button class="temp-btn" data-action="dec">−</button>
					<button class="temp-btn" data-action="inc">+</button>
				</div>
				<div class="action-buttons">
					<button class="action-btn ${d.bathingState.active ? "active" : ""}" data-mode="bathing" data-duration="60" data-start="${c.bathing_start || ""}" data-stop="${c.bathing_stop || ""}" data-active="${d.bathingState.active}">
						<ha-icon icon="mdi:pool"></ha-icon><span>${_t(lang, "actions.bathing")}</span>
					</button>
					<button class="action-btn filter ${d.filterState.active ? "active" : ""}" data-mode="filter" data-duration="30" data-start="${c.filter_start || ""}" data-stop="${c.filter_stop || ""}" data-active="${d.filterState.active}">
						<ha-icon icon="mdi:rotate-right"></ha-icon><span>${_t(lang, "actions.filter")}</span>
					</button>
					<button class="action-btn chlorine ${d.chlorState.active ? "active" : ""}" data-mode="chlorine" data-duration="5" data-start="${c.chlorine_start || ""}" data-stop="${c.chlorine_stop || ""}" data-active="${d.chlorState.active}">
						<ha-icon icon="mdi:fan"></ha-icon><span>${_t(lang, "actions.chlorine")}</span>
					</button>
					<button class="action-btn ${d.pauseState.active ? "active" : ""}" data-mode="pause" data-duration="60" data-start="${c.pause_start || ""}" data-stop="${c.pause_stop || ""}" data-active="${d.pauseState.active}">
						<ha-icon icon="mdi:pause-circle"></ha-icon><span>${_t(lang, "actions.pause")}</span>
					</button>
				</div>
				<div class="aux-switch ${d.auxOn ? "active" : ""}" data-entity="${c.aux_entity || ""}">
					<div class="aux-switch-label">
						<ha-icon icon="mdi:fire"></ha-icon><span>${_t(lang, "ui.additional_heater")}</span>
					</div>
					<div class="toggle"></div>
				</div>
				${(d.nextEventStart || d.nextStartMins != null || d.nextFilterMins != null) ? `
				<div class="calendar" style="margin-top:12px;">
					<div style="display:flex; justify-content:space-between; align-items:center;">
						<div style="font-weight:700;">${_t(lang, "ui.next_event")}</div>
						<div class="next-start-time" style="color:var(--secondary-text-color); font-weight:600;">${d.nextStartMins != null ? _t(lang, "ui.in_minutes", { mins: d.nextStartMins }) : ''}</div>
					</div>
					${d.nextFilterMins != null ? `
					<div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
						<div style="font-weight:600;">${_t(lang, "ui.next_filter_cycle")}</div>
						<div class="next-start-time" style="color:var(--secondary-text-color); font-weight:600;">${_t(lang, "ui.in_minutes", { mins: d.nextFilterMins })}</div>
					</div>` : ''}
					${d.nextEventStart ? `
					<div class="event" style="margin-top:10px;">
						<div style="flex: 1;">
							<div class="event-title">${d.nextEventSummary || _t(lang, "ui.scheduled_start")}</div>
							<div class="event-time" style="margin-top: 4px;">
								${this._formatEventTime(d.nextEventStart, d.nextEventEnd)}
							</div>
						</div>
					</div>` : ''}
				</div>` : ''}
				</div>
		</div>`;
	}

	// ========================================
	// MODULAR: Rechte Spalte (Qualität + Wartung)
	// ========================================
	_renderRightColumn(d, c) {
		const lang = _langFromHass(this._hass);
		return `<div class="right-column">
			<div class="quality">
				<div class="section-title">${_t(lang, "ui.water_quality")}</div>
				<div class="scale-container" ${d.phEntityId ? `data-more-info="${d.phEntityId}"` : ''}>
					<div style="font-weight: 600; margin-bottom: 8px;">${_t(lang, "ui.ph")}</div>
					<div style="position: relative;">
						${d.ph != null ? `<div class="scale-marker" style="left: ${this._pct(d.ph, 0, 14)}%"><div class="marker-value">${d.ph.toFixed(2)}</div></div>` : ""}
						<div class="scale-bar ph-bar">
							${Array.from({length: 15}, (_, i) => `<div class="scale-tick major" style="left: ${(i / 14) * 100}%"></div>`).join("")}
							${Array.from({length: 14}, (_, i) => `<div class="scale-tick minor" style="left: ${((i + 0.5) / 14) * 100}%"></div>`).join("")}
						</div>
					</div>
					<div class="scale-labels">
						${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => `<span>${n}</span>`).join("")}
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
			</div>
			
			${(d.phPlusNum && d.phPlusNum > 0) || (d.phMinusNum && d.phMinusNum > 0) || (d.chlorDoseNum && d.chlorDoseNum > 0) || (d.waterChangePercent && d.waterChangePercent > 0) || (d.waterChangeLiters && d.waterChangeLiters > 0) ? `
			<div class="maintenance">
				<div class="section-title">${_t(lang, "ui.maintenance")}</div>
				<div class="maintenance-items">
					${d.phPlusNum && d.phPlusNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:ph"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">${_t(lang, "ui.add_ph_plus")}</div>
							<div class="maintenance-value">${d.phPlusNum} ${d.phPlusUnit}</div>
						</div>
					</div>` : ""}
					${d.waterChangePercent && d.waterChangePercent > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:water"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">${_t(lang, "ui.change_water")}</div>
							<div class="maintenance-value">${d.waterChangePercent}%${d.waterChangeLiters ? ` — ${d.waterChangeLiters} L` : ''}</div>
						</div>
					</div>` : ""}
					${d.phMinusNum && d.phMinusNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:ph"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">${_t(lang, "ui.add_ph_minus")}</div>
							<div class="maintenance-value">${d.phMinusNum} ${d.phMinusUnit}</div>
						</div>
					</div>` : ""}
					${d.chlorDoseNum && d.chlorDoseNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:beaker"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">${_t(lang, "ui.add_chlorine")}</div>
							<div class="maintenance-value">${d.chlorDoseNum} ${d.chlorDoseUnit}</div>
						</div>
					</div>` : ""}
				</div>
			</div>` : ""}
			

		</div>`;
	}

	// ========================================
	// Event Handlers
	// ========================================
	_attachHandlers() {
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

		const tempButtons = this.shadowRoot.querySelectorAll(".temp-btn");
		tempButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				const action = btn.dataset.action;
				if (!this._hass) return;
				const step = Number(this._config.step || 0.5);
				const climate = this._hass.states[this._config.climate_entity];
				const currentTarget = this._num(climate?.attributes?.temperature) ?? this._num(climate?.attributes?.target_temp) ?? this._config.min_temp;
				const next = action === "inc" ? currentTarget + step : currentTarget - step;
				const newTemp = this._clamp(next, this._config.min_temp, this._config.max_temp);
				
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
					return;
				}

				if (active && stop) {
					this._triggerEntity(stop, false);
				} else if (!active && start) {
					this._triggerEntity(start, true);
				} else if (active && mode && this._hasService("pool_controller", `stop_${mode}`)) {
					this._hass.callService("pool_controller", `stop_${mode}`, { climate_entity: this._config?.climate_entity });
				}
			});
		});

		const auxSwitch = this.shadowRoot.querySelector(".aux-switch");
		if (auxSwitch) {
			auxSwitch.addEventListener("click", () => {
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

	_renderStatusMidIcon(d) {
		const title = d.statusText || "";
		if (d.pauseState?.active) return `<ha-icon icon="mdi:pause-circle" title="${title}" style="color:#e67e22"></ha-icon>`;
		if (d.bathingState?.active) return `<ha-icon icon="mdi:pool" title="${title}" style="color:#8a3b32"></ha-icon>`;
		if (d.chlorState?.active) return `<ha-icon icon="mdi:fan" title="${title}" style="color:#27ae60"></ha-icon>`;
		if (d.filterState?.active) return `<ha-icon icon="mdi:rotate-right" title="${title}" style="color:#2a7fdb"></ha-icon>`;
		if (d.hvacAction === "heating" || d.hvacAction === "heat") return `<ha-icon icon="mdi:radiator" title="${title}" style="color:#c0392b"></ha-icon>`;
		if (d.hvac === "off") return `<ha-icon icon="mdi:power" title="${title}" style="color:var(--secondary-text-color)"></ha-icon>`;
		return `<ha-icon icon="mdi:thermometer" title="${title}" style="color:var(--secondary-text-color)"></ha-icon>`;
	}

	_renderDialTimer(d) {
		const lang = _langFromHass(this._hass);
		if (d.bathingState?.active && d.bathingEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.bathingProgress * 100}%; background: linear-gradient(90deg, #8a3b32, #c0392b);"></div></div>
				<div class="timer-text">${_t(lang, "dial.bathing_left", { mins: d.bathingEta })}</div>
			</div>`;
		}
		if (d.filterState?.active && d.filterEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.filterProgress * 100}%; background: linear-gradient(90deg, #2a7fdb, #3498db);"></div></div>
				<div class="timer-text">${_t(lang, "dial.filter_left", { mins: d.filterEta })}</div>
			</div>`;
		}
		if (d.chlorState?.active && d.chlorEta != null) {
			return `<div class="dial-timer">
				<div class="timer-bar"><div class="timer-fill" style="width: ${d.chlorProgress * 100}%; background: linear-gradient(90deg, #27ae60, #2ecc71);"></div></div>
				<div class="timer-text">${_t(lang, "dial.chlorine_left", { mins: d.chlorEta })}</div>
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
				<div class="timer-text">${_t(lang, "dial.pause_left", { mins: d.pauseEta })}</div>
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
			this._config.maintenance_entity,
			this._config.aux_entity,
			this._config.manual_timer_entity,
			this._config.auto_filter_timer_entity,
			this._config.pause_timer_entity,
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
			this._config.main_power_entity,
			this._config.aux_power_entity,
			this._config.power_entity,
			this._config.ph_entity,
			this._config.chlorine_value_entity,
			this._config.salt_entity,
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
		}
		return JSON.stringify(sig);
	}

	_updateDialPreviewFromPointer(ev) {
		if (!this._hass || !this._config) return;
		const dial = this.shadowRoot?.querySelector("[data-dial]");
		if (!dial) return;
		const rect = dial.getBoundingClientRect();
		const c = this._config;
		const step = Number(c.step || 0.5);
		const progress = this._dialProgressFromClientXY(ev.clientX, ev.clientY, rect);
		if (progress == null) return;
		const temp = this._tempFromDialProgress(progress, c.min_temp, c.max_temp, step);
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
		const c = this._config;
		const min = Number(c.min_temp);
		const max = Number(c.max_temp);
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
			maintenance_entity: prefer('maintenance_entity'),
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
			salt_entity: prefer('salt_entity'),
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
			// Maintenance (hard lockout)
			maintenance_entity: this._pickEntity(entries, "binary_sensor", ["maintenance_active"]) || null,

			// New v2 timers (minutes sensor)
			manual_timer_entity: this._pickEntity(entries, "sensor", ["manual_timer_mins"]) || null,
			auto_filter_timer_entity: this._pickEntity(entries, "sensor", ["auto_filter_timer_mins"]) || null,
			pause_timer_entity: this._pickEntity(entries, "sensor", ["pause_timer_mins"]) || null,

			// Core / controls
			climate_entity: this._pickEntity(entries, "climate", ["climate"]) || null,
			aux_entity: this._pickEntity(entries, "switch", ["aux"]) || null,
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
			tds_entity: this._pickEntity(entries, "sensor", ["tds_val", "tds", "tds_ppm"]) || null,
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
	}

	get value() {
		return this._config;
	}

	_render() {
		if (!this.shadowRoot) this.attachShadow({ mode: "open" });
		const c = this._config || DEFAULTS;
		const lang = this._lang || _langFromHass(this._hass);
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
			<div class="row">
				<label>${_t(lang, "editor.select_controller")}</label>
				<select id="controller-select" style="padding:8px; border:1px solid #d0d7de; border-radius:8px; background:#fff;">
					<option value="">${_t(lang, "editor.please_choose")}</option>
				</select>
			</div>
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
			</div>
		</div>`;

		this._populateControllerSelect();

		this.shadowRoot.querySelectorAll("input").forEach((inp) => {
			inp.addEventListener("change", () => {
				const id = inp.id;
				const num = Number(inp.value);
				this._updateConfig({ [id]: Number.isFinite(num) ? num : inp.value });
			});
		});
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

		select.addEventListener("change", async (ev) => {
			const val = ev.target.value;
			if (val) {
				this._updateConfig({ controller_entity: val, climate_entity: val });
				// Automatisch alle Entities vom ausgewählten Controller ableiten
				setTimeout(() => this._deriveFromController(), 100);
			}
		});
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
			maintenance_entity: pick("binary_sensor", "maintenance_active") || this._config.maintenance_entity,
			// New v2 timers (minutes sensor)
			manual_timer_entity: pick("sensor", "manual_timer_mins") || this._config.manual_timer_entity,
			auto_filter_timer_entity: pick("sensor", "auto_filter_timer_mins") || this._config.auto_filter_timer_entity,
			pause_timer_entity: pick("sensor", "pause_timer_mins") || this._config.pause_timer_entity,
			aux_entity: pick("switch", "aux") || this._config.aux_entity,
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
			tds_entity: pick("sensor", "tds_val") || this._config.tds_entity,
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
