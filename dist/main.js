import {cssData} from './styles.js?v=1.4.0';
import ThermostatUI from './thermostat_card.lib.js?v=1.4.0';
console.info("%c Thermostat Card \n%c  Version  1.4.0 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

const CARD_EDITOR_LABELS = {
  zh: {
    min_value: "最低温度",
    max_value: "最高温度",
    ambient_temperature: "环境温度实体",
    step: "调节步长",
    pending: "待发送时间（秒）",
    idle_zone: "双温区最小间隔",
    chevron_size: "调节箭头大小",
    num_ticks: "刻度数量",
    tick_degrees: "刻度覆盖角度",
    diameter: "表盘直径",
    highlight_tap: "点击时高亮显示",
    no_card: "不使用卡片背景",
  },
  en: {
    min_value: "Minimum temperature",
    max_value: "Maximum temperature",
    ambient_temperature: "Ambient temperature entity",
    step: "Step",
    pending: "Pending (seconds)",
    idle_zone: "Idle zone",
    chevron_size: "Chevron size",
    num_ticks: "Number of ticks",
    tick_degrees: "Tick degrees",
    diameter: "Dial diameter",
    highlight_tap: "Highlight tap",
    no_card: "No card background",
  },
};

class ThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          selector: { entity: { domain: "climate" } },
          required: true,
        },
        {
          name: "title",
          selector: { text: {} },
        },
        {
          name: "ambient_temperature",
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "min_value",
          selector: { number: { mode: "box" } },
        },
        {
          name: "max_value",
          selector: { number: { mode: "box" } },
        },
        {
          name: "step",
          selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } },
          default: 0.5,
        },
        {
          name: "pending",
          selector: { number: { min: 1, max: 30, step: 1, mode: "box" } },
          default: 3,
        },
        {
          name: "idle_zone",
          selector: { number: { min: 0, max: 10, step: 0.5, mode: "box" } },
          default: 2,
        },
        {
          name: "chevron_size",
          selector: { number: { min: 20, max: 120, step: 5, mode: "box" } },
          default: 50,
        },
        {
          name: "num_ticks",
          selector: { number: { min: 30, max: 300, step: 10, mode: "box" } },
          default: 150,
        },
        {
          name: "tick_degrees",
          selector: { number: { min: 90, max: 360, step: 10, mode: "box" } },
          default: 300,
        },
        {
          name: "diameter",
          selector: { number: { min: 150, max: 800, step: 10, mode: "box" } },
          default: 400,
        },
        {
          name: "highlight_tap",
          selector: { boolean: {} },
          default: false,
        },
        {
          name: "no_card",
          selector: { boolean: {} },
          default: false,
        },
      ],
      computeLabel(schema, localize) {
        const name = schema.name;
        // If HA has a translation for this field, let HA provide the label.
        if (localize(`ui.panel.lovelace.editor.card.generic.${name}`)) {
          return undefined;
        }
        // Otherwise use the card's own translations (Chinese/English by default).
        const lang = /[\u4e00-\u9fff]/.test(localize("state.default.unknown"))
          ? "zh"
          : "en";
        return CARD_EDITOR_LABELS[lang][name];
      },
    };
  }
  static getStubConfig(hass, entities, entitiesFallback) {
    const candidates = (entities && entities.length ? entities : entitiesFallback) || [];
    const climate = candidates.find((entity) => entity.startsWith("climate."));
    return climate ? { entity: climate } : {};
  }
  set hass(hass) {
    const config = this._config;
    const entity = hass.states[config.entity];
    if(!entity)return;
    let min_value = entity.attributes.min_temp;
    if (config.min_value !== undefined && config.min_value !== null)
      min_value = config.min_value;
    let max_value = entity.attributes.max_temp;
    if (config.max_value !== undefined && config.max_value !== null)
      max_value = config.max_value;
    if (min_value === undefined || min_value === null || isNaN(min_value)) min_value = 7;
    if (max_value === undefined || max_value === null || isNaN(max_value)) max_value = 35;
    let ambient_temperature = entity.attributes.current_temperature || 0;
    if (config.ambient_temperature && hass.states[config.ambient_temperature]) {
      const sensor_value = parseFloat(hass.states[config.ambient_temperature].state);
      if (!isNaN(sensor_value))
        ambient_temperature = sensor_value;
    }
    let hvac_state = entity.state;
    
    const new_state = {
      entity: entity,
      min_value: min_value,
      max_value: max_value,
      ambient_temperature: ambient_temperature,
      target_temperature: entity.attributes.temperature,
      target_temperature_low: entity.attributes.target_temp_low,
      target_temperature_high: entity.attributes.target_temp_high,
      hvac_state: entity.state,
      hvac_modes:entity.attributes.hvac_modes,
      preset_mode: entity.attributes.preset_mode,
      away: (entity.attributes.away_mode == 'on' ? true : false)
    }

    if (!this._saved_state ||
      (this._saved_state.min_value != new_state.min_value ||
        this._saved_state.max_value != new_state.max_value ||
        this._saved_state.ambient_temperature != new_state.ambient_temperature ||
        this._saved_state.target_temperature != new_state.target_temperature ||
        this._saved_state.target_temperature_low != new_state.target_temperature_low ||
        this._saved_state.target_temperature_high != new_state.target_temperature_high ||
        this._saved_state.hvac_state != new_state.hvac_state ||
        this._saved_state.preset_mode != new_state.preset_mode ||
        this._saved_state.away != new_state.away)) {
      this._saved_state = new_state;
      this.thermostat.updateState(new_state,hass);
     }
    this._hass = hass;
  }
  
  openProp(entityId) {
    this.fire('hass-more-info', { entityId });
  }
  fire(type, detail, options) {
  
    options = options || {}
    detail = detail === null || detail === undefined ? {} : detail
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    })
    
    e.detail = detail
    this.dispatchEvent(e)
    return e
  }
  
  _controlSetPoints() {

    if (this.thermostat.dual) {
      if (this.thermostat.temperature.high != this._saved_state.target_temperature_high ||
        this.thermostat.temperature.low != this._saved_state.target_temperature_low)
        this._hass.callService('climate', 'set_temperature', {
          entity_id: this._config.entity,
          target_temp_high: this.thermostat.temperature.high,
          target_temp_low: this.thermostat.temperature.low,
        });
    } else {
      if (this.thermostat.temperature.target != this._saved_state.target_temperature)
        this._hass.callService('climate', 'set_temperature', {
          entity_id: this._config.entity,
          temperature: this.thermostat.temperature.target,
        });
    }
  }

  setConfig(config) {
    // Check config
    if (!config || !config.entity || config.entity.split(".")[0] !== 'climate') {
      throw new Error('Please define a valid climate entity');
    }

    // Cleanup DOM
    const root = this.shadowRoot;
    
    if (root.lastChild) root.removeChild(root.lastChild);

    // Prepare config defaults
    const cardConfig = deepClone(config);
    // cardConfig.hvac = Object.assign({}, config.hvac);
    
    if (!cardConfig.diameter) cardConfig.diameter = 400;
    if (!cardConfig.pending) cardConfig.pending = 3;
    if (!cardConfig.idle_zone) cardConfig.idle_zone = 2;
    if (!cardConfig.step) cardConfig.step = 0.5;
    if (!cardConfig.highlight_tap) cardConfig.highlight_tap = false;
    if (!cardConfig.no_card) cardConfig.no_card = false;
    if (!cardConfig.chevron_size) cardConfig.chevron_size = 50;
    if (!cardConfig.num_ticks) cardConfig.num_ticks = 150;
    if (!cardConfig.tick_degrees) cardConfig.tick_degrees = 300;

    // Extra config values generated for simplicity of updates
    cardConfig.radius = cardConfig.diameter / 2;
    cardConfig.ticks_outer_radius = cardConfig.diameter / 30;
    cardConfig.ticks_inner_radius = cardConfig.diameter / 8;
    cardConfig.offset_degrees = 180 - (360 - cardConfig.tick_degrees) / 2;
    cardConfig.control = this._controlSetPoints.bind(this);
    cardConfig.propWin = this.openProp.bind(this);
    this.thermostat = new ThermostatUI(cardConfig);
    
    if (cardConfig.no_card === true) {
      
      const card = document.createElement('ha-card');
      card.className = "no_card";
      const style = document.createElement('style');
      style.textContent = cssData();
      card.appendChild(style);
      card.appendChild(this.thermostat.container);
      root.appendChild(card);
      
    }
    else {

      const card = document.createElement('ha-card');
      const style = document.createElement('style');
      style.textContent = cssData();
      card.appendChild(style);
      card.appendChild(this.thermostat.container);
      root.appendChild(card);
    }
    this._config = cardConfig;
  }
}
customElements.define('thermostat-card', ThermostatCard);

if (!window.customCards) window.customCards = [];
if (!window.customCards.some((card) => card.type === 'thermostat-card')) {
  window.customCards.push({
    type: 'thermostat-card',
    name: 'Thermostat Card',
    description: 'A simple thermostat card for climate entities',
    preview: false,
    documentationURL: 'https://github.com/fineemb/lovelace-thermostat-card',
  });
}

function deepClone(value) {
  if (!(!!value && typeof value == 'object')) {
    return value;
  }
  if (Object.prototype.toString.call(value) == '[object Date]') {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  var result = {};
  Object.keys(value).forEach(
    function(key) { result[key] = deepClone(value[key]); });
  return result;
}
