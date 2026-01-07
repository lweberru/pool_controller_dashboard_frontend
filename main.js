/**
 * Pool Controller dashboard custom card (no iframe).
 * v1.5.3 - Ring mit rotate(225), Dots 225+dialAngle
 */

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

class PoolControllerCard extends HTMLElement {
	setConfig(config) {
		if (!config || !config.climate_entity) {
			throw new Error("climate_entity ist erforderlich");
		}
		this._config = { ...DEFAULTS, ...config };
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
		}
		this._render();
	}

	set hass(hass) {
		const oldHass = this._hass;
		this._hass = hass;
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
		const climate = h.states[c.climate_entity];
		if (!climate) {
			this._renderError(`Entity ${c.climate_entity} nicht gefunden`);
			return;
		}

		// Daten vorbereiten
		const data = this._prepareData(h, c, climate);

		// Komplettes Rendering
		this.shadowRoot.innerHTML = `
		${this._getStyles()}
		<ha-card>
			<div class="header">
				<div class="title">${c.title || climate.attributes.friendly_name || "Pool Controller"}</div>
				<div class="pill ${data.pillClass}">${data.statusText}</div>
			</div>
			
			<div class="content-grid">
				${this._renderLeftColumn(data, c)}
				${this._renderRightColumn(data, c)}
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
		const auxOn = c.aux_entity ? this._isOn(h.states[c.aux_entity]) : (h.states[c.aux_binary]?.state === "on");
		
		const bathingState = this._modeState(h, c.bathing_entity, c.bathing_until, c.bathing_active_binary);
		const filterState = this._modeState(h, c.filter_entity, c.filter_until, c.next_filter_in);
		const chlorState = this._modeState(h, c.chlorine_entity, c.chlorine_until, c.chlorine_active_entity); // quick_chlorine_until Sensor verwenden!
		const pauseState = this._modeState(h, c.pause_entity, c.pause_until, c.pause_active_entity);
		
		// Debug Chloren
		if (chlorState.active || chlorState.eta) {
			console.log('Chloren Debug:', {
				chlorine_entity: c.chlorine_entity,
				chlorine_until: c.chlorine_until,
				chlorine_until_state: c.chlorine_until ? h.states[c.chlorine_until]?.state : 'fehlt',
				chlorine_active_entity: c.chlorine_active_entity,
				chlorine_active_state: c.chlorine_active_entity ? h.states[c.chlorine_active_entity]?.state : 'fehlt',
				chlorState,
				note: 'Verwende sensor.pool_quick_chlorine_until für Timer'
			});
		}
		
		const frost = c.frost_entity ? this._isOn(h.states[c.frost_entity]) : false;
		const quiet = c.quiet_entity ? this._isOn(h.states[c.quiet_entity]) : false;
		const pvAllows = c.pv_entity ? this._isOn(h.states[c.pv_entity]) : false;
		
		const mainPower = c.main_power_entity ? this._num(h.states[c.main_power_entity]?.state) : null;
		const auxPower = c.aux_power_entity ? this._num(h.states[c.aux_power_entity]?.state) : null;
		const powerVal = mainPower ?? (c.power_entity ? this._num(h.states[c.power_entity]?.state) : null);

		const ph = c.ph_entity ? this._num(h.states[c.ph_entity]?.state) : null;
		const chlor = c.chlorine_value_entity ? this._num(h.states[c.chlorine_value_entity]?.state) : null;
		const salt = c.salt_entity ? this._num(h.states[c.salt_entity]?.state) : null;
		const tds = c.tds_entity ? this._num(h.states[c.tds_entity]?.state) : null;
		
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
		const nextEventStart = c.next_event_entity ? h.states[c.next_event_entity]?.state : null;
		const nextEventEnd = c.next_event_end_entity ? h.states[c.next_event_end_entity]?.state : null;
		const nextEventSummary = c.next_event_summary_entity ? h.states[c.next_event_summary_entity]?.state : null;

		const dialAngle = this._calcDial(current ?? c.min_temp, c.min_temp, c.max_temp);
		const targetAngle = this._calcDial(target ?? current ?? c.min_temp, c.min_temp, c.max_temp);

		const bathingEta = bathingState.eta;
		const filterEta = filterState.eta;
		const chlorEta = chlorState.eta;
		const pauseEta = pauseState.eta;
		
		const bathingMaxMins = c.bathing_duration_entity ? this._num(h.states[c.bathing_duration_entity]?.state) : null;
		const filterMaxMins = c.filter_duration_entity ? this._num(h.states[c.filter_duration_entity]?.state) : null;
		const chlorMaxMins = c.chlorine_duration_entity ? this._num(h.states[c.chlorine_duration_entity]?.state) : null;
		const pauseMaxMins = c.pause_duration_entity ? this._num(h.states[c.pause_duration_entity]?.state) : null;
		
		// Fallback: Verwende ETA als Max wenn keine Duration-Entity vorhanden (Timer gerade gestartet)
		const bathingProgress = bathingEta != null ? this._clamp(bathingEta / (bathingMaxMins || bathingEta || c.bathing_max_mins), 0, 1) : 0;
		const filterProgress = filterEta != null ? this._clamp(filterEta / (filterMaxMins || filterEta || c.filter_max_mins), 0, 1) : 0;
		const chlorProgress = chlorEta != null ? this._clamp(chlorEta / (chlorMaxMins || chlorEta || c.chlor_max_mins), 0, 1) : 0;
		const pauseProgress = pauseEta != null ? this._clamp(pauseEta / (pauseMaxMins || pauseEta || c.pause_max_mins), 0, 1) : 0;

		const pillClass = bathingState.active || filterState.active || chlorState.active ? "active" : pauseState.active ? "warn" : frost ? "on" : "";
		const statusText = this._getStatusText(hvac, hvacAction, bathingState.active, filterState.active, chlorState.active, pauseState.active);

		return {
			current, target, hvac, hvacAction, auxOn,
			bathingState, filterState, chlorState, pauseState,
			frost, quiet, pvAllows,
			mainPower, auxPower, powerVal,
			ph, chlor, salt, tds,
			phPlusNum, phPlusUnit, phMinusNum, phMinusUnit, chlorDoseNum, chlorDoseUnit,
			nextStartMins, nextEventStart, nextEventEnd, nextEventSummary,
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
			ha-card { padding: 16px; background: linear-gradient(180deg, #fdfbfb 0%, #f2f5f8 100%); color: var(--primary-text-color); }
			* { box-sizing: border-box; }
			.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-family: "Montserrat", "Segoe UI", sans-serif; }
			.title { font-size: 18px; font-weight: 600; letter-spacing: 0.3px; }
			.pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #f4f6f8; color: #333; }
			.pill.on { background: #d0f0d0; color: #0f6b2f; }
			.pill.warn { background: #ffe5d5; color: #b44; }
			.pill.active { background: #8a3b32; color: #fff; }
			
			.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
			@media (max-width: 500px) { .content-grid { grid-template-columns: 1fr; } }
			
			.dial-container { display: grid; place-items: center; }
			.dial { position: relative; aspect-ratio: 1 / 1; width: 100%; max-width: 280px; display: grid; place-items: center; }
			.ring { width: 100%; height: 100%; border-radius: 50%; position: relative; display: grid; place-items: center; padding: 20px; }
			
			/* SVG Ring */
			.ring-svg { position: absolute; width: 100%; height: 100%; }
			.ring-track { fill: none; stroke: #e6e9ed; stroke-width: 8; }
			.ring-progress { fill: none; stroke: var(--accent, #8a3b32); stroke-width: 8; stroke-linecap: round; transition: stroke-dasharray 0.3s ease; }
			.ring-target { fill: none; stroke: var(--target-accent, rgba(138,59,50,0.3)); stroke-width: 8; stroke-linecap: round; }
			.ring-highlight { fill: none; stroke: var(--accent, #8a3b32); stroke-width: 10; stroke-linecap: round; opacity: 0.4; }
			.ring-dot-current { fill: var(--accent, #8a3b32); }
			.ring-dot-target { fill: #fff; stroke: #d0d7de; stroke-width: 2; }
			
			.ring::after { content: ""; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 50% 50%, #fff 68%, transparent 69%); }
			
			.status-icons { position: absolute; top: 18%; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; align-items: center; z-index: 5; }
			.status-icon { width: 32px; height: 32px; border-radius: 50%; background: #f4f6f8; display: grid; place-items: center; border: 2px solid #d0d7de; opacity: 0.35; transition: all 200ms ease; }
			.status-icon.active { background: #8a3b32; color: #fff; border-color: #8a3b32; opacity: 1; box-shadow: 0 2px 8px rgba(138,59,50,0.3); }
			.status-icon.frost.active { background: #2a7fdb; border-color: #2a7fdb; box-shadow: 0 2px 8px rgba(42,127,219,0.3); }
			.status-icon ha-icon { --mdc-icon-size: 18px; }
			
			.dial-core { position: absolute; display: grid; gap: 6px; place-items: center; text-align: center; z-index: 10; }
			.temp-current { font-size: 48px; font-weight: 700; line-height: 1; }
			.divider { width: 80px; height: 2px; background: #d0d7de; margin: 4px 0; }
			.temp-target-row { display: flex; gap: 10px; align-items: center; font-size: 14px; color: var(--secondary-text-color); }
			.temp-target-row ha-icon { --mdc-icon-size: 18px; }
			
			.bath-timer { margin-top: 8px; width: 100%; max-width: 180px; }
			.timer-bar { height: 6px; background: #e6e9ed; border-radius: 999px; overflow: hidden; position: relative; }
			.timer-fill { height: 100%; border-radius: inherit; transition: width 300ms ease; }
			.timer-text { font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; text-align: center; }
			
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
			.scale-tick { position: absolute; bottom: 0; width: 2px; background: rgba(255,255,255,0.4); height: 50%; pointer-events: none; }
			.scale-tick.major { height: 70%; background: rgba(255,255,255,0.6); width: 3px; }
			.scale-tick.minor { height: 30%; background: rgba(255,255,255,0.3); width: 1px; }
			
			.scale-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #666; font-weight: 600; }
			.scale-marker { position: absolute; top: -56px; transform: translateX(-50%); z-index: 10; }
			.marker-value { background: #0b132b; color: #fff; padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 14px; white-space: nowrap; position: relative; }
			.marker-value::after { content: ""; position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 36px solid #0b132b; }
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
		return `<div class="left-column">
			<div class="dial-container">
				<div class="dial" style="--accent:${d.auxOn ? "#c0392b" : "#8a3b32"}; --target-accent:${d.auxOn ? "rgba(192,57,43,0.3)" : "rgba(138,59,50,0.3)"}">
					<div class="ring">
						<!-- SVG Ring mit 270° Arc (Öffnung bei 6 Uhr) -->
						<svg class="ring-svg" viewBox="0 0 100 100">
							<!-- Track: 270° Arc von 225° bis 135° -->
							<circle class="ring-track" cx="50" cy="50" r="40" 
								stroke-dasharray="188.4 251.2" 
								stroke-dashoffset="-62.8" 
								transform="rotate(225 50 50)" />
							<!-- Target Range (nur wenn Target > Current) -->
							${d.targetAngle > d.dialAngle ? `<circle class="ring-target" cx="50" cy="50" r="40" 
								stroke-dasharray="${(d.targetAngle - d.dialAngle) * 188.4 / 270} 251.2" 
								stroke-dashoffset="${-62.8 - d.dialAngle * 188.4 / 270}" 
								transform="rotate(225 50 50)" />` : ''}
						<!-- Current Progress -->
						<circle class="ring-progress" cx="50" cy="50" r="40" 
							stroke-dasharray="${d.dialAngle * 188.4 / 270} 251.2" 
							stroke-dashoffset="-62.8" 
							transform="rotate(225 50 50)" />
						<!-- Highlight zwischen IST und SOLL -->
						${d.targetAngle > d.dialAngle ? `<circle class="ring-highlight" cx="50" cy="50" r="40" 
							stroke-dasharray="${(d.targetAngle - d.dialAngle) * 188.4 / 270} 251.2" 
							stroke-dashoffset="${-62.8 - d.dialAngle * 188.4 / 270}" 
							transform="rotate(225 50 50)" />` : ''}
							<!-- Dot am IST-Wert (kleiner) -->
					<circle class="ring-dot-current" cx="${50 + 40 * Math.cos((225 + d.dialAngle) * Math.PI / 180)}" 
						cy="${50 + 40 * Math.sin((225 + d.dialAngle) * Math.PI / 180)}" r="1.5" />
					<!-- Dot am SOLL-Wert (größer, weiß) -->
					<circle class="ring-dot-target" cx="${50 + 40 * Math.cos((225 + d.targetAngle) * Math.PI / 180)}" 
						cy="${50 + 40 * Math.sin((225 + d.targetAngle) * Math.PI / 180)}" r="2.5" />
						</svg>
						<div class="status-icons">
							<div class="status-icon frost ${d.frost ? "active" : ""}" title="Frostschutz">
								<ha-icon icon="mdi:snowflake"></ha-icon>
							</div>
							<div class="status-icon ${d.quiet ? "active" : ""}" title="Ruhezeit">
								<ha-icon icon="mdi:power-sleep"></ha-icon>
							</div>
							<div class="status-icon ${d.pvAllows ? "active" : ""}" title="PV-Überschuss">
								<ha-icon icon="mdi:solar-power"></ha-icon>
							</div>
						</div>
					</div>
					<div class="dial-core">
						<div class="temp-current">${d.current != null ? d.current.toFixed(1) : "–"}<span style="font-size:0.55em">°C</span></div>
						<div class="divider"></div>
						<div class="temp-target-row">
							<span>${d.target != null ? d.target.toFixed(1) : "–"}°C</span>
							${d.hvacAction === "heating" || d.hvacAction === "heat" ? '<ha-icon icon="mdi:radiator" style="color:#c0392b"></ha-icon>' : ''}
							${d.mainPower !== null ? `<span>${d.mainPower}W</span>` : d.powerVal !== null ? `<span>${d.powerVal}W</span>` : ''}
						</div>
						${d.bathingState.active && d.bathingEta != null ? `
						<div class="bath-timer">
							<div class="timer-bar">
								<div class="timer-fill" style="width: ${d.bathingProgress * 100}%; background: linear-gradient(90deg, #8a3b32, #c0392b);"></div>
							</div>
							<div class="timer-text">Baden: noch ${d.bathingEta} min</div>
						</div>` : ""}
						${d.filterState.active && d.filterEta != null ? `
						<div class="bath-timer">
							<div class="timer-bar">
								<div class="timer-fill" style="width: ${d.filterProgress * 100}%; background: linear-gradient(90deg, #2a7fdb, #3498db);"></div>
							</div>
							<div class="timer-text">Filtern: noch ${d.filterEta} min</div>
						</div>` : ""}
						${d.chlorState.active && d.chlorEta != null ? `
						<div class="bath-timer">
							<div class="timer-bar">
								<div class="timer-fill" style="width: ${d.chlorProgress * 100}%; background: linear-gradient(90deg, #27ae60, #2ecc71);"></div>
							</div>
							<div class="timer-text">Chloren: noch ${d.chlorEta} min</div>
						</div>` : d.chlorState.active ? `
						<div class="bath-timer">
							<div class="timer-text" style="margin-top: 4px; font-weight: 600; color: #27ae60;">Chloren aktiv</div>
						</div>` : ""}
						${d.pauseState.active && d.pauseEta != null ? `
						<div class="bath-timer">
							<div class="timer-bar">
								<div class="timer-fill" style="width: ${d.pauseProgress * 100}%; background: linear-gradient(90deg, #e67e22, #f39c12);"></div>
							</div>
							<div class="timer-text">Pause: noch ${d.pauseEta} min</div>
						</div>` : ""}
					</div>
				</div>
				<div class="temp-controls">
					<button class="temp-btn" data-action="dec">−</button>
					<button class="temp-btn" data-action="inc">+</button>
				</div>
				<div class="action-buttons">
					<button class="action-btn ${d.bathingState.active ? "active" : ""}" data-start="${c.bathing_start || ""}" data-stop="${c.bathing_stop || ""}" data-active="${d.bathingState.active}">
						<ha-icon icon="mdi:pool"></ha-icon><span>Baden</span>
					</button>
					<button class="action-btn filter ${d.filterState.active ? "active" : ""}" data-start="${c.filter_start || ""}" data-stop="${c.filter_stop || ""}" data-active="${d.filterState.active}">
						<ha-icon icon="mdi:rotate-right"></ha-icon><span>Filtern</span>
					</button>
					<button class="action-btn chlorine ${d.chlorState.active ? "active" : ""}" data-start="${c.chlorine_start || ""}" data-stop="${c.chlorine_stop || ""}" data-active="${d.chlorState.active}">
						<ha-icon icon="mdi:fan"></ha-icon><span>Chloren</span>
					</button>
					<button class="action-btn ${d.pauseState.active ? "active" : ""}" data-start="${c.pause_start || ""}" data-stop="${c.pause_stop || ""}" data-active="${d.pauseState.active}">
						<ha-icon icon="mdi:pause-circle"></ha-icon><span>Pause</span>
					</button>
				</div>
				<div class="aux-switch ${d.auxOn ? "active" : ""}" data-entity="${c.aux_entity || ""}">
					<div class="aux-switch-label">
						<ha-icon icon="mdi:fire"></ha-icon><span>Zusatzheizung</span>
					</div>
					<div class="toggle"></div>
				</div>
			</div>
		</div>`;
	}

	// ========================================
	// MODULAR: Rechte Spalte (Qualität + Wartung)
	// ========================================
	_renderRightColumn(d, c) {
		return `<div class="right-column">
			<div class="quality">
				<div class="section-title">Wasserqualität</div>
				<div class="scale-container">
					<div style="font-weight: 600; margin-bottom: 8px;">pH-Wert</div>
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
				
				<div class="scale-container">
					<div style="font-weight: 600; margin-bottom: 8px;">Chlor</div>
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
				
				${d.salt != null || d.tds != null ? `
				<div class="info-row-badges">
					${d.salt != null ? `<div class="info-badge">Salz: ${d.salt}</div>` : ""}
					${d.tds != null ? `<div class="info-badge">TDS: ${d.tds}</div>` : ""}
				</div>` : ""}
			</div>
			
			${(d.phPlusNum && d.phPlusNum > 0) || (d.phMinusNum && d.phMinusNum > 0) || (d.chlorDoseNum && d.chlorDoseNum > 0) ? `
			<div class="maintenance">
				<div class="section-title">⚠️ Wartungsarbeiten erforderlich</div>
				<div class="maintenance-items">
					${d.phPlusNum && d.phPlusNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:ph"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">pH+ hinzufügen</div>
							<div class="maintenance-value">${d.phPlusNum} ${d.phPlusUnit}</div>
						</div>
					</div>` : ""}
					${d.phMinusNum && d.phMinusNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:ph"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">pH- hinzufügen</div>
							<div class="maintenance-value">${d.phMinusNum} ${d.phMinusUnit}</div>
						</div>
					</div>` : ""}
					${d.chlorDoseNum && d.chlorDoseNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:beaker"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">Chlor hinzufügen</div>
							<div class="maintenance-value">${d.chlorDoseNum} ${d.chlorDoseUnit}</div>
						</div>
					</div>` : ""}
				</div>
			</div>` : ""}
			
			${d.nextStartMins != null ? `
			<div class="next-start">
				<span class="next-start-label">Nächster Start</span>
				<span class="next-start-time">in ${d.nextStartMins} Minuten</span>
			</div>` : ""}
			
			${d.nextEventStart ? `
			<div class="calendar">
				<div class="section-title">Nächster Termin</div>
				<div class="event">
					<div style="flex: 1;">
						<div class="event-title">${d.nextEventSummary || "Geplanter Start"}</div>
						<div class="event-time" style="margin-top: 4px;">
							${this._formatEventTime(d.nextEventStart, d.nextEventEnd)}
						</div>
					</div>
				</div>
			</div>` : ""}
		</div>`;
	}

	// ========================================
	// Event Handlers
	// ========================================
	_attachHandlers() {
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

		const actionButtons = this.shadowRoot.querySelectorAll(".action-btn");
		actionButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				const start = btn.dataset.start;
				const stop = btn.dataset.stop;
				const active = btn.dataset.active === "true";
				if (active && stop) {
					this._triggerEntity(stop, false);
				} else if (start) {
					this._triggerEntity(start, true);
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

	_getStatusText(hvac, hvacAction, bathing, filtering, chlorinating, paused) {
		if (paused) return "Pause";
		if (bathing) return "Baden";
		if (chlorinating) return "Chloren";
		if (filtering) return "Filtern";
		if (hvacAction === "heating" || hvacAction === "heat") return "Heizt";
		if (hvac === "off") return "Aus";
		return hvac || "–";
	}

	_formatEventTime(startTs, endTs) {
		if (!startTs) return "";
		const start = new Date(startTs);
		if (isNaN(start.getTime())) {
			return endTs && endTs !== startTs ? `${startTs} - ${endTs}` : startTs;
		}
		const startStr = start.toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
		if (!endTs) return startStr;
		const end = new Date(endTs);
		if (isNaN(end.getTime())) return `${startStr} - ${endTs}`;
		const endStr = end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
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

	_calcDial(val, min, max) {
		const pct = this._clamp((val - min) / (max - min), 0, 1);
		return Math.round(pct * 270);
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
			this._config.aux_entity,
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
			this._config.main_power_entity,
			this._config.aux_power_entity,
			this._config.power_entity,
			this._config.ph_entity,
			this._config.chlorine_value_entity,
			this._config.salt_entity,
			this._config.tds_entity,
			this._config.ph_plus_entity,
			this._config.ph_minus_entity,
			this._config.chlor_dose_entity,
			this._config.next_start_entity,
			this._config.next_event_entity,
			this._config.next_event_end_entity,
			this._config.next_event_summary_entity,
		].filter(Boolean);
		
		return relevantEntities.some(entityId => {
			const oldState = oldHass.states[entityId];
			const newState = newHass.states[entityId];
			if (!oldState || !newState) return true;
			return oldState.state !== newState.state || 
			       JSON.stringify(oldState.attributes) !== JSON.stringify(newState.attributes);
		});
	}

	_renderError(msg) {
		this.shadowRoot.innerHTML = `<ha-card><div style="padding:16px;color:var(--error-color)">${msg}</div></ha-card>`;
	}
}

class PoolControllerCardEditor extends HTMLElement {
	set hass(hass) {
		this._hass = hass;
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
				<label>Pool Controller auswählen</label>
				<select id="controller-select" style="padding:8px; border:1px solid #d0d7de; border-radius:8px; background:#fff;">
					<option value="">Bitte wählen...</option>
				</select>
			</div>
			<div class="grid2">
				<div class="row">
					<label>Temperatur-Minimum</label>
					<input id="min_temp" type="number" step="0.5" value="${c.min_temp}">
				</div>
				<div class="row">
					<label>Temperatur-Maximum</label>
					<input id="max_temp" type="number" step="0.5" value="${c.max_temp}">
				</div>
				<div class="row">
					<label>Schrittweite</label>
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

		const reg = await this._getEntityRegistry();
		const poolControllers = reg.filter((r) => 
			r.platform === "pool_controller" && 
			r.entity_id.startsWith("climate.")
		);

		select.innerHTML = '<option value="">Bitte wählen...</option>';
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
			aux_entity: pick("switch", "aux") || this._config.aux_entity,
			bathing_entity: pick("switch", "bathing") || this._config.bathing_entity,
			bathing_start: pick("button", "bath_60") || pick("button", "bath_30") || this._config.bathing_start,
			bathing_stop: pick("button", "bath_stop") || this._config.bathing_stop,
			bathing_until: pick("sensor", "bathing_until") || this._config.bathing_until,
			bathing_active_binary: pick("binary_sensor", "is_bathing") || this._config.bathing_active_binary,
			filter_entity: pick("binary_sensor", "filter_active") || this._config.filter_entity,
			filter_start: pick("button", "filter_60") || pick("button", "filter_30") || this._config.filter_start,
			filter_stop: pick("button", "filter_stop") || this._config.filter_stop,
			filter_until: pick("sensor", "filter_until") || this._config.filter_until,
			next_filter_in: pick("sensor", "next_filter_mins") || this._config.next_filter_in,
			chlorine_entity: pick("binary_sensor", "is_quick_chlor") || this._config.chlorine_entity,
			chlorine_start: pick("button", "quick_chlor") || this._config.chlorine_start,
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
			ph_entity: pick("sensor", "ph_val") || this._config.ph_entity,
			chlorine_value_entity: pick("sensor", "chlor_val") || this._config.chlorine_value_entity,
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
	description: "Whirlpool/Pool Steuerung ohne iFrame.",
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
