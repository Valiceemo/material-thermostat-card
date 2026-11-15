/*!
 * Material Thermostat Card
 * A Material-style dial thermostat card for Home Assistant, inspired by the
 * Google Home app. Vanilla web component: no build step, no dependencies.
 */
const CARD_VERSION = "1.2.0";

// Dial geometry (SVG viewBox 400x400). Angles are degrees clockwise from top.
const START = 207; // ring start (bottom-left)
const SWEEP = 306; // ring sweep; the remaining 54deg is the gap at the bottom
const C = 200;
const R_BG = 190;
const R_RING = 171;

const rad = (d) => (d * Math.PI) / 180;
const polar = (a, r) => [C + r * Math.sin(rad(a)), C - r * Math.cos(rad(a))];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (v) => (Number.isInteger(v) ? String(v) : Number(v).toFixed(1));
const pretty = (s) => String(s).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

const MODES = {
  heat: { icon: "mdi:heat-wave", l: ["#8A2D00", "#FFDBCF", "#FFB59E"], d: ["#FFB59A", "#4A1F0F", "#7A3A22"] },
  cool: { icon: "mdi:snowflake", l: ["#00468C", "#D6E3FF", "#A9C7FF"], d: ["#A9C7FF", "#1B3558", "#2F5A94"] },
  heat_cool: { icon: "mdi:sun-snowflake-variant", l: ["#006B5B", "#BDEFE3", "#8FD7C7"], d: ["#7FD8C3", "#0B3F37", "#1F6B5E"] },
  auto: { icon: "mdi:thermostat-auto", l: ["#6D5E00", "#F5E6A0", "#DBC66E"], d: ["#DBC66E", "#473F00", "#6D5E00"] },
  dry: { icon: "mdi:water-percent", l: ["#8A5100", "#FFDDB8", "#FFB95C"], d: ["#FFB95C", "#4A2A00", "#7A4A00"] },
  fan_only: { icon: "mdi:fan", l: ["#00677F", "#B9EAFF", "#5FD4F4"], d: ["#5FD4F4", "#003A4A", "#00677F"] },
  off: { icon: "mdi:power", l: ["#5E5E62", "#E3E2E6", "#C7C6CA"], d: ["#C7C6CA", "#3B3B3F", "#5E5E62"] },
};

const EXTRA_TILES = [
  ["preset_mode", "preset_modes", "mdi:tune-variant", "set_preset_mode"],
  ["fan_mode", "fan_modes", "mdi:fan", "set_fan_mode"],
  ["swing_mode", "swing_modes", "mdi:arrow-oscillating", "set_swing_mode"],
];

const STYLE = `
:host { display: block; }
* { box-sizing: border-box; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
ha-card {
  --bg: var(--ha-card-background, var(--card-background-color, #fff));
  --on: var(--primary-text-color, #1b1b1f);
  --muted: var(--secondary-text-color, #5e5e62);
  padding: 8px 16px 20px;
  overflow: hidden;
}
.header { display: flex; align-items: center; gap: 8px; padding: 4px 0 8px; }
.name { flex: 1; font-size: 1.15rem; font-weight: 500; color: var(--on); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-btn { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: var(--on); }
.icon-btn.power.on { background: color-mix(in srgb, #2e9e4f 28%, var(--bg)); color: color-mix(in srgb, #0b5a24 70%, var(--on)); }

.dial { position: relative; width: 100%; max-width: 520px; margin: 0 auto; aspect-ratio: 1; container-type: inline-size; }
.dial svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.bg { fill: var(--container); }
.track { fill: none; stroke: var(--ring); stroke-width: 8; stroke-linecap: round; }
.dot { fill: var(--accent); stroke: var(--container); stroke-width: 3; transition: r .15s; }
.cur-dot { fill: var(--on); }
.cur-label { fill: var(--on); font-size: 17px; text-anchor: middle; dominant-baseline: middle; }
.hicon { position: absolute; transform: translate(-50%, -50%); color: var(--accent); --mdc-icon-size: 5.6cqw; display: flex; pointer-events: none; }
.center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.value { font-size: 18cqw; font-weight: 500; line-height: 1; color: var(--accent); letter-spacing: -0.02em; }
.value.dual { font-size: 11cqw; display: flex; gap: 2cqw; align-items: baseline; }
.value .num { opacity: .45; pointer-events: auto; cursor: pointer; }
.value .num.act { opacity: 1; }
.sub { margin-top: 2cqw; font-size: 4cqw; color: var(--accent); opacity: .85; min-height: 1em; }
.steppers { position: absolute; left: 0; right: 0; bottom: 8%; display: flex; justify-content: center; gap: 5cqw; }
.step { width: max(44px, 13cqw); height: max(44px, 11cqw); border-radius: 999px; display: grid; place-items: center; color: var(--accent); --mdc-icon-size: 7cqw; }
.step:active { background: var(--ring); }
.unavail .dial { opacity: .5; pointer-events: none; }

.tiles { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.tile { border-radius: 28px; background: var(--container); color: var(--accent); overflow: hidden; }
.tile-head { width: 100%; display: flex; align-items: center; gap: 16px; padding: 16px 20px; text-align: left; }
.tile-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tile-title { font-weight: 500; }
.tile-sub { font-size: .9rem; }
.chev { transition: transform .2s; }
.tile.open .chev { transform: rotate(180deg); }
.chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 16px; }
.chip { border: 1px solid var(--ring); border-radius: 999px; padding: 8px 14px; color: var(--accent); }
.chip.sel { background: var(--ring); font-weight: 500; }
.info { border-radius: 28px; background: var(--surface); padding: 12px 0; margin-top: 8px; }
.row { display: flex; justify-content: space-between; padding: 8px 24px; color: var(--muted); }
.row b { color: var(--on); font-weight: 500; }
.error { padding: 16px; color: var(--error-color, #b3261e); }
@media (prefers-reduced-motion: reduce) { .chev, .dot { transition: none; } }
`;

class MaterialThermostatCard extends HTMLElement {
  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find((e) => e.startsWith("climate."));
    return { entity: entity || "climate.example" };
  }

  static getConfigForm() {
    const labels = {
      entity: "Climate entity",
      name: "Name (optional)",
      indoor_temperature_entity: "Indoor temperature sensor (optional, overrides the thermostat's reading)",
      humidity_entity: "Humidity sensor (optional)",
      outdoor_entity: "Outdoor temperature entity (sensor or weather)",
      step: "Step override",
      hide_action: "Hide heating / cooling status",
      hide_humidity: "Hide humidity",
      hide_presets: "Hide preset, fan and swing selectors",
    };
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
        { name: "name", selector: { text: {} } },
        { name: "indoor_temperature_entity", selector: { entity: { domain: ["sensor", "input_number", "weather"] } } },
        { name: "humidity_entity", selector: { entity: { domain: ["sensor", "input_number", "weather"] } } },
        { name: "outdoor_entity", selector: { entity: { domain: ["sensor", "weather"] } } },
        { name: "step", selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } } },
        { name: "hide_action", selector: { boolean: {} } },
        { name: "hide_humidity", selector: { boolean: {} } },
        { name: "hide_presets", selector: { boolean: {} } },
      ],
      computeLabel: (s) => labels[s.name] || s.name,
    };
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("Please define a climate entity");
    // Options are "hide_*" so the editor's default (off) matches the card's default (shown).
    // Legacy "show_*: false" is still honoured.
    const shown = (hide, legacy) => !(config[hide] === true || config[legacy] === false);
    this._config = {
      ...config,
      show_action: shown("hide_action", "show_action"),
      show_humidity: shown("hide_humidity", "show_humidity"),
      show_presets: shown("hide_presets", "show_presets"),
    };
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this._build();
    }
    this._sig = "";
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && this.shadowRoot) this._render();
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  // ---------- DOM ----------
  _build() {
    const track = (() => {
      const [x1, y1] = polar(START, R_RING);
      const [x2, y2] = polar(START + SWEEP, R_RING);
      return `M ${x1} ${y1} A ${R_RING} ${R_RING} 0 1 1 ${x2} ${y2}`;
    })();
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card>
        <div class="error" hidden></div>
        <div class="header">
          <div class="name"></div>
          <button class="icon-btn power" aria-label="Power"><ha-icon icon="mdi:power"></ha-icon></button>
          <button class="icon-btn more" aria-label="More info"><ha-icon icon="mdi:dots-vertical"></ha-icon></button>
        </div>
        <div class="dial">
          <svg viewBox="0 0 400 400">
            <circle class="bg" cx="${C}" cy="${C}" r="${R_BG}"></circle>
            <path class="track" d="${track}"></path>
            <circle class="cur-dot" r="6"></circle>
            <text class="cur-label"></text>
            <circle class="dot dot-a" r="9"></circle>
            <circle class="dot dot-b" r="9"></circle>
          </svg>
          <div class="hicon icon-a"><ha-icon></ha-icon></div>
          <div class="hicon icon-b"><ha-icon></ha-icon></div>
          <div class="center"><div class="value"></div><div class="sub"></div></div>
          <div class="steppers">
            <button class="step minus" aria-label="Decrease"><ha-icon icon="mdi:minus"></ha-icon></button>
            <button class="step plus" aria-label="Increase"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="tiles"></div>
        <div class="info" hidden></div>
      </ha-card>`;

    const $ = (s) => this.shadowRoot.querySelector(s);
    this._svg = $("svg");
    $(".power").addEventListener("click", () => this._togglePower());
    $(".more").addEventListener("click", () =>
      this.dispatchEvent(
        new CustomEvent("hass-more-info", { detail: { entityId: this._config.entity }, bubbles: true, composed: true })
      )
    );
    $(".minus").addEventListener("click", () => this._nudge(-1));
    $(".plus").addEventListener("click", () => this._nudge(1));
    $(".value").addEventListener("click", (e) => {
      const k = e.target?.dataset?.k;
      if (k) {
        this._active = k;
        this._render();
      }
    });
    $(".tiles").addEventListener("click", (e) => this._onTileClick(e));

    // Drag interaction on the ring
    const svg = this._svg;
    svg.addEventListener("pointerdown", (e) => this._onDown(e));
    svg.addEventListener("pointermove", (e) => this._onMove(e));
    svg.addEventListener("pointerup", (e) => this._onUp(e));
    svg.addEventListener("pointercancel", (e) => this._onUp(e));
    // Only block page scrolling when the touch starts on the ring itself
    svg.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        if (t && this._onRing(t)) e.preventDefault();
      },
      { passive: false }
    );
  }

  // ---------- state helpers ----------
  get _stateObj() {
    return this._hass?.states?.[this._config.entity];
  }

  _attrVals(st) {
    const a = st.attributes;
    if (a.temperature == null && a.target_temp_low != null && a.target_temp_high != null) {
      return { dual: true, lo: a.target_temp_low, hi: a.target_temp_high };
    }
    return { dual: false, t: a.temperature };
  }

  _vals(st) {
    return this._pending || this._attrVals(st);
  }

  // Numeric value from a separate sensor/weather entity, falling back to the climate attribute
  _extVal(entityId, fallback, weatherAttr) {
    if (entityId) {
      const e = this._hass.states[entityId];
      if (e) {
        const v = entityId.startsWith("weather.") ? e.attributes[weatherAttr] : e.state;
        if (v != null && v !== "" && !isNaN(Number(v))) return Number(v);
      }
    }
    return fallback == null ? null : Number(fallback);
  }

  _curTemp(st) {
    return this._extVal(this._config.indoor_temperature_entity, st.attributes.current_temperature, "temperature");
  }

  _label(st, key, val) {
    try {
      if (key === "hvac_mode") return this._hass.formatEntityState(st, val);
      return this._hass.formatEntityAttributeValue(st, key, val);
    } catch (e) {
      return pretty(val);
    }
  }

  // ---------- render ----------
  _render() {
    const root = this.shadowRoot;
    const $ = (s) => root.querySelector(s);
    const st = this._stateObj;
    const err = $(".error");
    if (!st) {
      err.hidden = false;
      err.textContent = `Entity not found: ${this._config.entity}`;
      return;
    }
    err.hidden = true;

    const a = st.attributes;
    const cfg = this._config;
    const dark = !!this._hass.themes?.darkMode;
    const unavailable = st.state === "unavailable" || st.state === "unknown";
    const mode = MODES[st.state] || MODES.off;
    const card = $("ha-card");
    const [acc, cont, ring] = dark ? mode.d : mode.l;
    card.style.setProperty("--accent", acc);
    card.style.setProperty("--container", cont);
    card.style.setProperty("--ring", ring);
    card.style.setProperty(
      "--surface",
      dark ? "color-mix(in srgb, #fff 8%, var(--bg))" : "color-mix(in srgb, #fff 55%, var(--bg))"
    );
    card.classList.toggle("unavail", unavailable);

    $(".name").textContent = cfg.name || a.friendly_name || cfg.entity;
    $(".power").classList.toggle("on", st.state !== "off" && !unavailable);

    // range / step
    const unitF = this._hass.config?.unit_system?.temperature === "°F";
    this._min = a.min_temp ?? (unitF ? 45 : 7);
    this._max = a.max_temp ?? (unitF ? 95 : 35);
    this._step = Number(cfg.step ?? a.target_temp_step ?? (unitF ? 1 : 0.5));
    const pos = (v) => START + Math.min(1, Math.max(0, (v - this._min) / (this._max - this._min))) * SWEEP;

    // handles
    const vals = this._vals(st);
    const handles = vals.dual
      ? [
          { k: "lo", v: vals.lo, icon: "mdi:fire" },
          { k: "hi", v: vals.hi, icon: "mdi:snowflake" },
        ]
      : vals.t != null
      ? [{ k: "t", v: vals.t, icon: mode.icon }]
      : [];
    if (!this._active || (vals.dual && this._active === "t")) this._active = vals.dual ? "lo" : "t";

    ["a", "b"].forEach((slot, i) => {
      const h = handles[i];
      const dot = $(`.dot-${slot}`);
      const icon = $(`.icon-${slot}`);
      dot.style.display = icon.style.display = h ? "" : "none";
      if (!h) return;
      const [x, y] = polar(pos(h.v), R_RING);
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", vals.dual && h.k === this._active ? 11 : 9);
      const near = !vals.dual && this._curTemp(st) != null ? pos(h.v) - pos(this._curTemp(st)) : 99;
      const nudge = Math.abs(near) < 16 ? (near >= 0 ? 6 : -6) : 0;
      const [ix, iy] = polar(pos(h.v) + nudge, R_RING - 30);
      icon.style.left = `${(ix / 400) * 100}%`;
      icon.style.top = `${(iy / 400) * 100}%`;
      icon.firstElementChild.setAttribute("icon", h.icon);
    });

    // current temperature marker
    const cur = this._curTemp(st);
    const cd = $(".cur-dot");
    const cl = $(".cur-label");
    cd.style.display = cl.style.display = cur == null ? "none" : "";
    if (cur != null) {
      const [x, y] = polar(pos(cur), R_RING);
      cd.setAttribute("cx", x);
      cd.setAttribute("cy", y);
      let lAng = pos(cur);
      if (!vals.dual && vals.t != null && Math.abs(pos(vals.t) - lAng) < 16) lAng -= pos(vals.t) >= lAng ? 10 : -10;
      const [lx, ly] = polar(lAng, R_RING - 26);
      cl.setAttribute("x", lx);
      cl.setAttribute("y", ly);
      cl.textContent = fmt(Math.round(cur * 10) / 10);
    }

    // centre value
    const value = $(".value");
    value.classList.toggle("dual", !!vals.dual);
    if (vals.dual) {
      value.innerHTML = `<span class="num ${this._active === "lo" ? "act" : ""}" data-k="lo">${fmt(vals.lo)}</span><span>–</span><span class="num ${this._active === "hi" ? "act" : ""}" data-k="hi">${fmt(vals.hi)}</span>`;
    } else {
      value.textContent = vals.t != null ? fmt(vals.t) : "–";
    }
    let sub = "";
    if (unavailable) sub = this._label(st, "state", st.state) || pretty(st.state);
    else if (cfg.show_action && a.hvac_action) sub = this._label(st, "hvac_action", a.hvac_action);
    $(".sub").textContent = sub;

    this._renderTiles(st, mode, dark, unavailable);
  }

  _renderTiles(st, mode, dark, unavailable) {
    const a = st.attributes;
    const cfg = this._config;
    const tr = (k, fallback) => {
      try {
        return this._hass.formatEntityAttributeName(st, k) || fallback;
      } catch (e) {
        return fallback;
      }
    };

    const tiles = [];
    if (a.hvac_modes?.length > 1) {
      tiles.push({ key: "hvac_mode", title: "Mode", icon: mode.icon, options: a.hvac_modes, cur: st.state, svc: "set_hvac_mode" });
    }
    if (cfg.show_presets) {
      EXTRA_TILES.forEach(([key, list, icon, svc]) => {
        if (a[list]?.length) tiles.push({ key, title: tr(key, pretty(key)), icon, options: a[list], cur: a[key], svc });
      });
    }

    const unit = this._hass.config?.unit_system?.temperature || "°C";
    const rows = [];
    const indoor = this._curTemp(st);
    if (indoor != null) rows.push(["Indoor temperature", `${fmt(Math.round(indoor * 10) / 10)}°`]);
    if (cfg.outdoor_entity) {
      const o = this._hass.states[cfg.outdoor_entity];
      if (o) {
        const v = o.entity_id.startsWith("weather.") ? o.attributes.temperature : o.state;
        if (v != null && !isNaN(Number(v))) rows.push(["Outdoor temperature", `${fmt(Math.round(Number(v) * 10) / 10)}°`]);
      }
    }
    const hum = this._extVal(cfg.humidity_entity, a.current_humidity, "humidity");
    if (cfg.show_humidity && hum != null) rows.push(["Humidity", `${fmt(Math.round(hum * 10) / 10)}%`]);

    const sig = JSON.stringify([tiles.map((t) => [t.key, t.cur, t.options]), rows, this._open, unit]);
    if (sig === this._sig) return;
    this._sig = sig;

    this.shadowRoot.querySelector(".tiles").innerHTML = tiles
      .map((t) => {
        const open = this._open === t.key;
        const chips = open
          ? `<div class="chips">${t.options
              .map(
                (o) =>
                  `<button class="chip ${o === t.cur ? "sel" : ""}" data-key="${esc(t.key)}" data-val="${esc(o)}">${esc(
                    this._label(st, t.key, o)
                  )}</button>`
              )
              .join("")}</div>`
          : "";
        return `<div class="tile ${open ? "open" : ""}">
          <button class="tile-head" data-toggle="${esc(t.key)}">
            <ha-icon icon="${t.icon}"></ha-icon>
            <span class="tile-text"><span class="tile-title">${esc(t.title)}</span><span class="tile-sub">${esc(
          t.cur != null ? this._label(st, t.key, t.cur) : "–"
        )}</span></span>
            <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
          </button>${chips}</div>`;
      })
      .join("");
    this._tiles = tiles;

    const info = this.shadowRoot.querySelector(".info");
    info.hidden = rows.length === 0;
    info.innerHTML = rows.map(([l, v]) => `<div class="row"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("");
  }

  // ---------- interaction ----------
  _onTileClick(e) {
    const chip = e.target.closest(".chip");
    if (chip) {
      const tile = (this._tiles || []).find((t) => t.key === chip.dataset.key);
      if (tile) {
        this._hass.callService("climate", tile.svc, { entity_id: this._config.entity, [tile.key]: chip.dataset.val });
      }
      this._open = null;
      this._sig = "";
      this._render();
      return;
    }
    const head = e.target.closest(".tile-head");
    if (head) {
      this._open = this._open === head.dataset.toggle ? null : head.dataset.toggle;
      this._sig = "";
      this._render();
    }
  }

  _togglePower() {
    const st = this._stateObj;
    if (!st) return;
    this._hass.callService("climate", st.state === "off" ? "turn_on" : "turn_off", { entity_id: this._config.entity });
  }

  _ensurePending(st) {
    if (!this._pending) this._pending = { ...this._attrVals(st) };
  }

  _setVal(key, v) {
    clearTimeout(this._clearT);
    const p = this._pending;
    const step = this._step || 0.5;
    v = Math.round(v / step) * step;
    v = Number(Math.min(this._max, Math.max(this._min, v)).toFixed(2));
    if (p.dual) {
      if (key === "lo") v = Math.min(v, Math.max(this._min, p.hi - step));
      if (key === "hi") v = Math.max(v, Math.min(this._max, p.lo + step));
    }
    p[key] = v;
    this._render();
  }

  _nudge(dir) {
    const st = this._stateObj;
    if (!st) return;
    this._ensurePending(st);
    const key = this._pending.dual ? this._active || "lo" : "t";
    const base = this._pending[key] ?? this._min ?? 18;
    this._setVal(key, base + dir * (this._step || 0.5));
    clearTimeout(this._commitT);
    this._commitT = setTimeout(() => this._commit(), 800);
  }

  _commit() {
    const p = this._pending;
    if (!p) return;
    clearTimeout(this._commitT);
    const data = { entity_id: this._config.entity };
    if (p.dual) {
      data.target_temp_low = p.lo;
      data.target_temp_high = p.hi;
    } else {
      data.temperature = p.t;
    }
    this._hass.callService("climate", "set_temperature", data);
    clearTimeout(this._clearT);
    this._clearT = setTimeout(() => {
      this._pending = null;
      this._render();
    }, 3000);
  }

  _xy(e) {
    const r = this._svg.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 400 - C,
      y: ((e.clientY - r.top) / r.height) * 400 - C,
    };
  }

  _onRing(e) {
    const { x, y } = this._xy(e);
    const d = Math.hypot(x, y);
    return d > R_RING - 34 && d < R_BG + 4;
  }

  _valFromEvent(e) {
    const { x, y } = this._xy(e);
    let ang = (Math.atan2(x, -y) * 180) / Math.PI;
    if (ang < 0) ang += 360;
    let rel = (ang - START + 360) % 360;
    if (rel > SWEEP) rel = rel < SWEEP + (360 - SWEEP) / 2 ? SWEEP : 0;
    return this._min + (rel / SWEEP) * (this._max - this._min);
  }

  _onDown(e) {
    const st = this._stateObj;
    if (!st || !this._onRing(e)) return;
    this._ensurePending(st);
    this._dragging = true;
    clearTimeout(this._commitT);
    try {
      this._svg.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
    const v = this._valFromEvent(e);
    const p = this._pending;
    if (p.dual) this._active = Math.abs(v - p.lo) < Math.abs(v - p.hi) ? "lo" : "hi";
    this._setVal(p.dual ? this._active : "t", v);
    e.preventDefault();
  }

  _onMove(e) {
    if (!this._dragging) return;
    const p = this._pending;
    this._setVal(p.dual ? this._active : "t", this._valFromEvent(e));
  }

  _onUp() {
    if (!this._dragging) return;
    this._dragging = false;
    this._commit();
  }
}

if (!customElements.get("material-thermostat-card")) {
  customElements.define("material-thermostat-card", MaterialThermostatCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "material-thermostat-card",
  name: "Material Thermostat Card",
  description: "Material-style dial thermostat card inspired by the Google Home app.",
  preview: true,
  documentationURL: "https://github.com/Valiceemo/material-thermostat-card",
});

console.info(
  `%c MATERIAL-THERMOSTAT-CARD %c v${CARD_VERSION} `,
  "color:#fff;background:#8a2d00;font-weight:700;",
  "color:#8a2d00;background:#ffdacd;"
);
