/**
 * Pool Controller dashboard custom card (no iframe).
 * Draft 1: climate-like dial + mode controls + water quality + PV + calendar.
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
		this._hass = hass;
		this._render();
	}

	connectedCallback() {
		this._render();
	}

	getCardSize() {
		return 5;
	}

	async _render() {
		if (!this._hass || !this._config) return;
		const h = this._hass;
		const c = this._config;
		const climate = h.states[c.climate_entity];
		if (!climate) {
			this._renderError(`Entity ${c.climate_entity} nicht gefunden`);
			return;
		}

		const current = this._num(climate.attributes.current_temperature);
		const target = this._num(climate.attributes.temperature) ?? this._num(climate.attributes.target_temp) ?? this._num(climate.attributes.max_temp);
		const hvac = climate.state;
		const hvacAction = climate.attributes.hvac_action;
		const status = c.status_entity ? h.states[c.status_entity]?.state : null;
		const auxOn = c.aux_entity ? this._isOn(h.states[c.aux_entity]) : (h.states[c.aux_binary]?.state === "on");

		const bathingState = this._modeState(h, c.bathing_entity, c.bathing_until, c.bathing_active_binary);
		const filterState = this._modeState(h, c.filter_entity, c.filter_until, c.next_filter_in);
		const chlorState = this._modeState(h, c.chlorine_entity, c.chlorine_until, c.chlorine_active_entity);
		const pauseState = this._modeState(h, c.pause_entity, c.pause_until, c.pause_active_entity);
		const frost = c.frost_entity ? this._isOn(h.states[c.frost_entity]) : false;
		const quiet = c.quiet_entity ? this._isOn(h.states[c.quiet_entity]) : false;
		const pvAllows = c.pv_entity ? this._isOn(h.states[c.pv_entity]) : false;
		const mainPower = c.main_power_entity ? this._num(h.states[c.main_power_entity]?.state) : null;
		const auxPower = c.aux_power_entity ? this._num(h.states[c.aux_power_entity]?.state) : null;
		const powerVal = mainPower || (c.power_entity ? this._num(h.states[c.power_entity]?.state) : null);

		const ph = c.ph_entity ? this._num(h.states[c.ph_entity]?.state) : null;
		const chlor = c.chlorine_value_entity ? this._num(h.states[c.chlorine_value_entity]?.state) : null;
		const salt = c.salt_entity ? this._num(h.states[c.salt_entity]?.state) : null;
		const tds = c.tds_entity ? this._num(h.states[c.tds_entity]?.state) : null;
		// Wartungs-Werte: Nummer extrahieren, aber Original für Anzeige behalten
		const phPlusNum = c.ph_plus_entity ? this._num(h.states[c.ph_plus_entity]?.state) : null;
		const phPlusStr = c.ph_plus_entity ? h.states[c.ph_plus_entity]?.state : null;
		const phMinusNum = c.ph_minus_entity ? this._num(h.states[c.ph_minus_entity]?.state) : null;
		const phMinusStr = c.ph_minus_entity ? h.states[c.ph_minus_entity]?.state : null;
		const chlorDoseNum = c.chlor_dose_entity ? this._num(h.states[c.chlor_dose_entity]?.state) : null;
		const chlorDoseStr = c.chlor_dose_entity ? h.states[c.chlor_dose_entity]?.state : null;

		const nextStartMins = c.next_start_entity ? this._num(h.states[c.next_start_entity]?.state) : null;
		const nextEventStart = c.next_event_entity ? h.states[c.next_event_entity]?.state : null;
		const nextEventEnd = c.next_event_end_entity ? h.states[c.next_event_end_entity]?.state : null;
		const nextEventSummary = c.next_event_summary_entity ? h.states[c.next_event_summary_entity]?.state : null;

		const dialAngle = this._calcDial(target ?? current ?? c.min_temp, c.min_temp, c.max_temp);

		// Badesession Timer
		const bathingEta = bathingState.eta;
		const bathingMaxMins = 120;
		const bathingProgress = bathingEta != null ? this._clamp(bathingEta / bathingMaxMins, 0, 1) : 0;

		// Kein Kalender-Abruf mehr, nur Event aus Sensoren

		this.shadowRoot.innerHTML = `
		<style>
			:host { display: block; }
			ha-card { padding: 16px; background: linear-gradient(180deg, #fdfbfb 0%, #f2f5f8 100%); color: var(--primary-text-color); }
			* { box-sizing: border-box; }
			.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-family: "Montserrat", "Segoe UI", sans-serif; }
			.title { font-size: 18px; font-weight: 600; letter-spacing: 0.3px; }
			.pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #f4f6f8; color: #333; }
			.pill.on { background: #d0f0d0; color: #0f6b2f; }
			.pill.warn { background: #ffe5d5; color: #b44; }
			
			.dial-container { display: grid; place-items: center; margin: 20px auto; max-width: 450px; }
			.dial { position: relative; aspect-ratio: 1 / 1; width: 100%; max-width: 350px; display: grid; place-items: center; }
			.ring { width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(from 225deg, var(--accent, #8a3b32) 0deg, var(--accent, #8a3b32) var(--angle, 0deg), #e6e9ed var(--angle, 0deg), #e6e9ed 270deg, transparent 270deg); display: grid; place-items: center; padding: 20px; position: relative; }
			.ring::after { content: ""; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 50% 50%, #fff 68%, transparent 69%); }
			
			.status-icons { position: absolute; top: 25%; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; align-items: center; z-index: 5; }
			.status-icon { width: 32px; height: 32px; border-radius: 50%; background: #f4f6f8; display: grid; place-items: center; border: 2px solid #d0d7de; opacity: 0.35; transition: all 200ms ease; }
			.status-icon.active { background: #8a3b32; color: #fff; border-color: #8a3b32; opacity: 1; box-shadow: 0 2px 8px rgba(138,59,50,0.3); }
			.status-icon ha-icon { --mdc-icon-size: 18px; }
			
			.dial-core { position: absolute; display: grid; gap: 6px; place-items: center; text-align: center; z-index: 10; }
			.temp-current { font-size: 48px; font-weight: 700; line-height: 1; }
			.divider { width: 80px; height: 2px; background: #d0d7de; margin: 4px 0; }
			.info-row { display: flex; gap: 12px; align-items: center; font-size: 13px; color: var(--secondary-text-color); }
			.info-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
			.info-label { font-size: 10px; text-transform: uppercase; opacity: 0.7; }
			.info-value { font-weight: 600; }
			
			.bath-timer { margin-top: 8px; width: 200px; }
			.timer-bar { height: 6px; background: #e6e9ed; border-radius: 999px; overflow: hidden; position: relative; }
			.timer-fill { height: 100%; background: linear-gradient(90deg, #8a3b32, #c0392b); border-radius: inherit; transition: width 300ms ease; }
			.timer-text { font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; text-align: center; }
			
			.action-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px; max-width: 300px; }
			.action-btn { padding: 12px; border-radius: 10px; border: 2px solid #d0d7de; background: #fff; cursor: pointer; transition: all 150ms ease; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
			.action-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); border-color: #8a3b32; }
			.action-btn.active { background: #8a3b32; color: #fff; border-color: #8a3b32; }
			.action-btn ha-icon { --mdc-icon-size: 20px; }
			
			.temp-controls { display: grid; grid-template-columns: repeat(2, 64px); gap: 16px; margin-top: 16px; }
			.temp-btn { height: 64px; border-radius: 50%; border: 2px solid #d0d7de; background: #fff; font-size: 28px; font-weight: 700; cursor: pointer; transition: all 150ms ease; }
			.temp-btn:hover { box-shadow: 0 6px 14px rgba(0,0,0,0.1); transform: scale(1.05); border-color: #8a3b32; }
			
			.aux-switch { margin-top: 16px; padding: 12px; border: 2px solid #d0d7de; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 150ms ease; max-width: 300px; }
			.aux-switch:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
			.aux-switch.active { background: #c0392b; color: #fff; border-color: #c0392b; }
			.aux-switch-label { font-weight: 600; display: flex; align-items: center; gap: 8px; }
			.aux-switch-label ha-icon { --mdc-icon-size: 20px; }
			.toggle { width: 44px; height: 24px; background: #d0d7de; border-radius: 999px; position: relative; transition: background 200ms ease; }
			.toggle::after { content: ""; position: absolute; width: 18px; height: 18px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: left 200ms ease; }
			.aux-switch.active .toggle { background: #fff; }
			.aux-switch.active .toggle::after { left: 23px; background: #c0392b; }
			
			.quality { border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #fff; display: grid; gap: 20px; margin-top: 20px; }
			.section-title { font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: #4a5568; margin-bottom: 8px; }
			
			.scale-container { position: relative; }
			.scale-bar { height: 50px; border-radius: 10px; position: relative; overflow: visible; }
			.ph-bar { background: linear-gradient(90deg, #d7263d 0%, #e45a2a 7%, #fbb13c 14%, #f6d32b 21%, #8bd448 35%, #27ae60 50%, #1abc9c 65%, #1c9ed8 78%, #2a7fdb 85%, #5c4ac7 100%); }
			.chlor-bar { background: linear-gradient(90deg, #d7263d 0%, #f5a524 25%, #1bbc63 50%, #1bbc63 75%, #f5a524 87%, #d7263d 100%); }
			
			.scale-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #666; font-weight: 600; }
			.scale-marker { position: absolute; bottom: 100%; margin-bottom: 8px; transform: translateX(-50%); }
			.scale-marker::after { content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #0b132b; }
			.marker-value { background: #0b132b; color: #fff; padding: 6px 10px; border-radius: 8px; font-weight: 700; font-size: 14px; white-space: nowrap; }
			
			.scale-range { display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px; color: #999; text-transform: uppercase; font-weight: 600; }
			
			.info-row-badges { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
			.info-badge { padding: 8px 12px; border-radius: 10px; background: #f4f6f8; font-size: 13px; border: 1px solid #e0e6ed; font-weight: 500; }
			.info-badge.alert { background: #ffe5d5; color: #8a3b32; border-color: #f3c2a2; font-weight: 600; }
			
			.maintenance { border: 1px solid #f3c2a2; border-radius: 12px; padding: 16px; background: #fff9f5; margin-top: 20px; }
			.maintenance .section-title { color: #c0392b; }
			.maintenance-items { display: grid; gap: 12px; margin-top: 12px; }
			.maintenance-item { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 10px; background: #fff; border: 1px solid #f3c2a2; }
			.maintenance-item ha-icon { --mdc-icon-size: 24px; color: #c0392b; }
			.maintenance-text { flex: 1; }
			.maintenance-label { font-weight: 600; color: #8a3b32; }
			.maintenance-value { font-size: 18px; font-weight: 700; color: #c0392b; margin-top: 2px; }
			
			.calendar { border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #fff; display: grid; gap: 10px; margin-top: 20px; }
			.event { padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e9f0; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
			.event-title { font-weight: 500; }
			.event-time { color: #555; font-size: 13px; }
			
			.next-start { background: #e8f5e9; border: 1px solid #b8e3b8; padding: 12px; border-radius: 10px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
			.next-start-label { font-weight: 600; color: #0f6b2f; }
			.next-start-time { color: #0f6b2f; font-size: 14px; }
		</style>
		<ha-card>
			<div class="header">
				<div class="title">${c.title || climate.attributes.friendly_name || "Pool Controller"}</div>
				<div class="pill ${status === "paused" ? "warn" : status === "frost_protection" ? "on" : ""}">${status || hvac}</div>
			</div>
			
			<div class="dial-container">
				<div class="dial" style="--angle:${dialAngle}deg; --accent:${auxOn ? "#c0392b" : "#8a3b32"}">
					<div class="ring">
						<div class="status-icons">
							<div class="status-icon ${frost ? "active" : ""}" title="Frostschutz: ${frost ? "an" : "aus"}">
								<ha-icon icon="mdi:snowflake"></ha-icon>
							</div>
							<div class="status-icon ${quiet ? "active" : ""}" title="Ruhezeit: ${quiet ? "an" : "aus"}">
								<ha-icon icon="mdi:power-sleep"></ha-icon>
							</div>						<div class="status-icon ${pvAllows ? "active" : ""}" title="PV-Überschuss: ${pvAllows ? "verfügbar" : "nicht verfügbar"}">
							<ha-icon icon="mdi:solar-power"></ha-icon>
						</div>						</div>
					</div>
					<div class="dial-core">
						<div class="temp-current">${current != null ? current.toFixed(1) : "–"}<span style="font-size:0.55em">°C</span></div>
						<div class="divider"></div>
						<div class="info-row">
							<div class="info-item">
								<div class="info-label">Soll</div>
								<div class="info-value">${target != null ? target.toFixed(1) : "–"}°</div>
							</div>
							<div class="info-item">
								<div class="info-label">Modus</div>
								<div class="info-value">${this._getStatusText(hvac, hvacAction, bathingState.active, filterState.active, chlorState.active, pauseState.active)}</div>
							</div>
							${mainPower != null && auxPower != null ? `
							<div class="info-item">
								<div class="info-label">Pumpe</div>
								<div class="info-value">${mainPower}W</div>
							</div>
							<div class="info-item">
								<div class="info-label">Heizung</div>
								<div class="info-value">${auxPower}W</div>
							</div>` : `
							<div class="info-item">
								<div class="info-label">Verbrauch</div>
								<div class="info-value">${powerVal != null ? powerVal + "W" : "–"}</div>
							</div>`}
						</div>
						${bathingState.active && bathingEta != null ? `
						<div class="bath-timer">
							<div class="timer-bar">
								<div class="timer-fill" style="width: ${bathingProgress * 100}%"></div>
							</div>
							<div class="timer-text">Badesession: noch ${bathingEta} min</div>
						</div>` : ""}
					</div>
				</div>
				<div class="temp-controls">
					<button class="temp-btn" data-action="dec">−</button>
					<button class="temp-btn" data-action="inc">+</button>
				</div>
				<div class="action-buttons">
					<button class="action-btn ${bathingState.active ? "active" : ""}" data-start="${c.bathing_start || ""}" data-stop="${c.bathing_stop || ""}" data-active="${bathingState.active ? "true" : "false"}">
						<ha-icon icon="mdi:pool"></ha-icon>
						<span>Baden</span>
					</button>
					<button class="action-btn ${filterState.active ? "active" : ""}" data-start="${c.filter_start || ""}" data-stop="${c.filter_stop || ""}" data-active="${filterState.active ? "true" : "false"}">
						<ha-icon icon="mdi:rotate-right"></ha-icon>
						<span>Filtern</span>
					</button>
					<button class="action-btn ${chlorState.active ? "active" : ""}" data-start="${c.chlorine_start || ""}" data-stop="${c.chlorine_stop || ""}" data-active="${chlorState.active ? "true" : "false"}">
						<ha-icon icon="mdi:fan"></ha-icon>
						<span>Chloren</span>
					</button>
					<button class="action-btn ${pauseState.active ? "active" : ""}" data-start="${c.pause_start || ""}" data-stop="${c.pause_stop || ""}" data-active="${pauseState.active ? "true" : "false"}">
						<ha-icon icon="mdi:pause-circle"></ha-icon>
						<span>Pause</span>
					</button>
				</div>
				<div class="aux-switch ${auxOn ? "active" : ""}" data-entity="${c.aux_entity || ""}">
					<div class="aux-switch-label">
						<ha-icon icon="mdi:fire"></ha-icon>
						<span>Zusatzheizung</span>
					</div>
					<div class="toggle"></div>
				</div>
			</div>
			
			<div class="quality">
				<div class="section-title">Wasserqualität</div>
				<div class="scale-container">
					<div style="font-weight: 600; margin-bottom: 8px;">pH-Wert</div>
					<div style="position: relative;">
						${ph != null ? `<div class="scale-marker" style="left: ${this._pct(ph, 1, 14)}%"><div class="marker-value">${ph.toFixed(2)}</div></div>` : ""}
						<div class="scale-bar ph-bar"></div>
					</div>
					<div class="scale-labels">
						${[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => `<span>${n}</span>`).join("")}
					</div>
					<div class="scale-range"><span>Sauer</span><span>Neutral</span><span>Alkalisch</span></div>
				</div>
				
				<div class="scale-container">
					<div style="font-weight: 600; margin-bottom: 8px;">Chlor</div>
					<div style="position: relative;">
						${chlor != null ? `<div class="scale-marker" style="left: ${this._pct(chlor, 0, 1200)}%"><div class="marker-value">${chlor.toFixed(0)} mV</div></div>` : ""}
						<div class="scale-bar chlor-bar"></div>
					</div>
					<div class="scale-labels">
						<span>0</span><span>300</span><span>600</span><span>900</span><span>1200</span>
					</div>
					<div class="scale-range"><span>Zu niedrig</span><span>Optimal (${c.chlor_ok_min}-${c.chlor_ok_max} mV)</span><span>Zu hoch</span></div>
				</div>
				
				${salt != null || tds != null ? `
				<div class="info-row-badges">
					${salt != null ? `<div class="info-badge">Salz: ${salt}</div>` : ""}
					${tds != null ? `<div class="info-badge">TDS: ${tds}</div>` : ""}
				</div>` : ""}
			</div>
			
			${(phPlusNum && phPlusNum > 0) || (phMinusNum && phMinusNum > 0) || (chlorDoseNum && chlorDoseNum > 0) ? `
			<div class="maintenance">
				<div class="section-title">⚠️ Wartungsarbeiten erforderlich</div>
				<div class="maintenance-items">
					${phPlusNum && phPlusNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:ph"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">pH+ hinzufügen</div>
							<div class="maintenance-value">${phPlusStr || (phPlusNum + ' g')}</div>
						</div>
					</div>` : ""}
					${phMinusNum && phMinusNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:ph"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">pH- hinzufügen</div>
							<div class="maintenance-value">${phMinusStr || (phMinusNum + ' g')}</div>
						</div>
					</div>` : ""}
					${chlorDoseNum && chlorDoseNum > 0 ? `
					<div class="maintenance-item">
						<ha-icon icon="mdi:beaker"></ha-icon>
						<div class="maintenance-text">
							<div class="maintenance-label">Chlor hinzufügen</div>
							<div class="maintenance-value">${chlorDoseStr || chlorDoseNum}</div>
						</div>
					</div>` : ""}
				</div>
			</div>` : ""}
			
			${nextStartMins != null ? `
			<div class="next-start">
				<span class="next-start-label">Nächster Start</span>
				<span class="next-start-time">in ${nextStartMins} Minuten</span>
			</div>` : ""}
			
			${nextEventStart ? `
			<div class="calendar">
				<div class="section-title">Nächster Termin</div>
				<div class="event">
					<div style="flex: 1;">
						<div class="event-title">${nextEventSummary || "Geplanter Start"}</div>
						<div class="event-time" style="margin-top: 4px;">
							${this._formatEventTime(nextEventStart, nextEventEnd)}
						</div>
					</div>
				</div>
			</div>` : ""}
		</ha-card>`;

		this._attachHandlers();
	}

	_renderError(msg) {
		this.shadowRoot.innerHTML = `<ha-card><div style="padding:16px; color:red;">${msg}</div></ha-card>`;
	}

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
				this._hass.callService("climate", "set_temperature", { entity_id: this._config.climate_entity, temperature: this._clamp(next, this._config.min_temp, this._config.max_temp) });
			});
		});

		const actionButtons = this.shadowRoot.querySelectorAll(".action-btn");
		actionButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				const { start, stop, active } = btn.dataset;
				if (active === "true" && stop) {
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
		// fallback: homeassistant.turn_on/off
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
		const startStr = start.toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
		if (!endTs) return startStr;
		const end = new Date(endTs);
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
		return Math.round(pct * 270); // 270deg arc (from 225deg to 495deg = 225deg to 135deg)
	}

	_num(v) {
		if (v == null || v === '') return null;
		// String normalisieren: deutsche Kommas, Einheiten entfernen
		let str = String(v).trim();
		// Entferne Einheiten (g, mV, W, etc.) und Text
		str = str.replace(/[a-zA-Z°%]+/g, '').trim();
		// Deutsches Komma → Punkt
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


}

class PoolControllerCardEditor extends HTMLElement {
	set hass(hass) {
		this._hass = hass;
		// Nur initial rendern, nicht bei jedem hass Update
		if (!this._initialized) {
			this._render();
			this._initialized = true;
		} else {
			// Nur den Entity Picker aktualisieren, nicht neu rendern
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
				<div class="box" id="derived"></div>
				<button id="derive">Automatisch aus Instanz übernehmen</button>
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

		const deriveBtn = this.shadowRoot.querySelector("#derive");
		if (deriveBtn) deriveBtn.addEventListener("click", () => this._deriveFromController());

		this._renderDerivedBox();
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

		// Clear and populate select
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

		// Auto-select wenn nur eine Instanz vorhanden und noch keine Config
		if (poolControllers.length === 1 && !this._config?.controller_entity) {
			const firstController = poolControllers[0].entity_id;
			select.value = firstController;
			this._updateConfig({ controller_entity: firstController, climate_entity: firstController });
			// Automatisch alle Entities übernehmen
			setTimeout(() => this._deriveFromController(), 100);
		}

		select.addEventListener("change", (ev) => {
			const val = ev.target.value;
			if (val) {
				this._updateConfig({ controller_entity: val, climate_entity: val });
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
		console.log("[Pool Controller] Found entities:", entries.map(e => ({ id: e.entity_id, unique: e.unique_id })));
		const pick = (domain, suffix) => {
			const hit = entries.find((e) => e.entity_id.startsWith(`${domain}.`) && (suffix ? e.unique_id?.endsWith(`_${suffix}`) : true));
			console.log(`[Pool Controller] pick(${domain}, ${suffix}) -> ${hit?.entity_id} (unique_id: ${hit?.unique_id})`);
			return hit?.entity_id;
		};
		const cfg = {
			controller_entity: this._config.controller_entity,
			climate_entity: pick("climate", "climate") || this._config.climate_entity,
			status_entity: this._config.status_entity, // Status-Sensor hat keine unique_id im Backend
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
			power_entity: this._config.power_entity,
			pv_entity: pick("binary_sensor", "pv_allows") || this._config.pv_entity,
			ph_entity: pick("sensor", "ph_val") || this._config.ph_entity,
			chlorine_value_entity: pick("sensor", "chlor_val") || this._config.chlorine_value_entity,
			salt_entity: this._config.salt_entity,
			tds_entity: this._config.tds_entity,
			ph_plus_entity: pick("sensor", "ph_plus_g") || this._config.ph_plus_entity,
			ph_minus_entity: pick("sensor", "ph_minus_g") || this._config.ph_minus_entity,
			chlor_dose_entity: pick("sensor", "chlor_spoons") || this._config.chlor_dose_entity,
			next_start_entity: pick("sensor", "next_start_mins") || this._config.next_start_entity,
			next_event_entity: pick("sensor", "next_event") || this._config.next_event_entity,
			next_event_end_entity: pick("sensor", "next_event_end") || this._config.next_event_end_entity,
			next_event_summary_entity: pick("sensor", "next_event_summary") || this._config.next_event_summary_entity,
		};
		this._updateConfig(cfg, true);
	}

	async _getEntityRegistry() {
		if (this._registry) return this._registry;
		this._registry = await this._hass.callWS({ type: "config/entity_registry/list" });
		return this._registry;
	}

	_renderDerivedBox() {
		const box = this.shadowRoot.querySelector("#derived");
		if (!box || !this._config) return;
		const cfg = this._config;
		const rows = [
			["climate", cfg.climate_entity],
			["status", cfg.status_entity],
			["switches", `${cfg.aux_entity || ""}, ${cfg.bathing_entity || ""}`],
			["binary", `quiet:${cfg.quiet_entity ? "✓" : "✗"} frost:${cfg.frost_entity ? "✓" : "✗"} pv:${cfg.pv_entity ? "✓" : "✗"}`],
			["bathing", `${cfg.bathing_start || ""} → ${cfg.bathing_active_binary || ""}`],
			["filter", `${cfg.filter_start || ""} → ${cfg.filter_entity || ""}`],
			["chlorine", `${cfg.chlorine_start || ""} → ${cfg.chlorine_entity || ""}`],
			["pause", `${cfg.pause_start || ""} → ${cfg.pause_entity || ""}`],
			["power", `main:${cfg.main_power_entity || ""} aux:${cfg.aux_power_entity || ""}`],
			["quality", `pH:${cfg.ph_entity || ""} Cl:${cfg.chlorine_value_entity || ""}`],
		];
		box.innerHTML = rows
			.map(([k, v]) => `<div class="badge"><strong>${k}</strong>: ${v || "–"}</div>`)
			.join("");
	}

	_updateConfig(patch, renderOnly = false) {
		this._config = { ...DEFAULTS, ...this._config, ...patch };
		this._renderDerivedBox();
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

// Main wrapper element
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