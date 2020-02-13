

class ThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  set hass(hass) {
    const config = this._config;
    const entity = hass.states[config.entity];
    let ambient_temperature = entity.attributes.current_temperature;
    if (config.ambient_temperature && hass.states[config.ambient_temperature])
      ambient_temperature = hass.states[config.ambient_temperature].state;
    let hvac_state = entity.state;
    
    const new_state = {
      entity: entity,
      min_value: entity.attributes.min_temp,
      max_value: entity.attributes.max_temp,
      ambient_temperature: ambient_temperature,
      target_temperature: entity.attributes.temperature,
      target_temperature_low: entity.attributes.target_temp_low,
      target_temperature_high: entity.attributes.target_temp_high,
      hvac_state: entity.state,
      hvac_modes:entity.attributes.hvac_modes,
      preset_mode: entity.attributes.preset_mode,
      away: (entity.attributes.away_mode == 'on' ? true : false),
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
    if (!config.entity && config.entity.split(".")[0] === 'climate') {
      throw new Error('Please define an entity');
    }

    // Cleanup DOM
    const root = this.shadowRoot;
    
    if (root.lastChild) root.removeChild(root.lastChild);

    // Prepare config defaults
    const cardConfig = Object.assign({}, config);
    cardConfig.hvac = Object.assign({}, config.hvac);
    
    if (!cardConfig.diameter) cardConfig.diameter = 400;
    if (!cardConfig.pending) cardConfig.pending = 3;
    if (!cardConfig.idle_zone) cardConfig.idle_zone = 2;
    if (!cardConfig.step) cardConfig.step = 0.5;
    if (!cardConfig.highlight_tap) cardConfig.highlight_tap = false;
    if (!cardConfig.no_card) cardConfig.no_card = false;
    if (!cardConfig.small_i) cardConfig.small_i = false;
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
      style.textContent = this.cssData();
      card.appendChild(style);
      card.appendChild(this.thermostat.container);
      root.appendChild(card);
    }
    this._config = cardConfig;
  }
  cssData() {
    var css =`
    
    ha-card {
      overflow: hidden;
      --rail_border_color: transparent;
      --auto_color: rgb(227, 99, 4, 1);
      --cool_color: rgba(0, 122, 241, 0.6);
      --cool_colorc: rgba(0, 122, 241, 1);
      --heat_color: #ff8100;
      --heat_colorc: rgb(227, 99, 4, 1);
      --manual_color: #44739e;
      --off_color: #8a8a8a;
      --fan_only_color: #D7DBDD;
      --dry_color: #efbd07;
      --idle_color: #808080;
      --unknown_color: #bac;
      --text-color: white;
    }
    ha-card.no_card{
      background-color: transparent;
      border: none;
      box-shadow: none;
    }
    ha-card.no_card .prop{
      display: none;
    }
    .auto, .heat_cool {
      --mode_color: var(--auto_color);
    }
    
    .cool {
      --mode_color: var(--cool_color);
    }
    
    .heat {
      --mode_color: var(--heat_color);
    }
    
    .manual {
      --mode_color: var(--manual_color);
    }
    
    .off {
      --mode_color: var(--off_color);
    }
    .more {
      --mode_color: var(--off_color);
    }
    .fan_only {
      --mode_color: var(--fan_only_color);
    }
    
    .eco {
      --mode_color: var(--auto_color);
    }
    
    .dry {
      --mode_color: var(--dry_color);
    }
    
    .idle {
      --mode_color: var(--idle_color);
    }
    
    .unknown-mode {
      --mode_color: var(--unknown_color);
    }
    
    .c_small_cont {
      padding: 0px;
      --title_font_size: 12px;
      --b_padding: 5% 5% 5% 5%;
      --climate_info_position_top: 82%;
      --title_position_top: 22%;
      --set_temperature_font_size: 25px;
      --set_temperature_margin_bottom: -5px;
      --dialog_size: 90%;
      --icon_size: 24px;
      --d_icon_size: 28px;
      --dot_size: 30px;
      --c_title_w: 40%;
      --c_title_l: 30%;
    }
    .c_large_cont {
      padding: 0px;
      --title_position_top: 25%;
      --title_font_size: 18px;
      --b_padding: 10% 10% 10% 10%;;
      --climate_info_position_top: 82%;
      --set_temperature_font_size: 25px;
      --set_temperature_margin_bottom: -5px;
      --dialog_size: 80%;
      --icon_size: 38px;
      --dot_size: 42px;
      --d_icon_size: 64px;
      --c_title_w: 30%;
      --c_title_l: 35%;
    }
    .c_title {
      font-size: var(--title_font_size);
      text-align: center;
      position: absolute;
      width: var(--c_title_w);
      left: var(--c_title_l);
      word-break: break-all;
      top: var(--title_position_top);
      color: var(--text-color)
    }
    .c_body {
      padding: var(--b_padding);
    }
    .c_icon{
      position: absolute;
      cursor: pointer;
      top: 0;
      right: 0;
      z-index: 25;
    }
    .climate_info {
      position: absolute;
      top: var(--climate_info_position_top);
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      --background-color: white;
    }
    .modes, .mode_color{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .modes iron-icon {
      color: var(--mode_color);
      --iron-icon-height: var(--icon_size);
      --iron-icon-width: var(--icon_size);
    }
    .modes .modeicon {
      --iron-icon-height: var(--d_icon_size);
      --iron-icon-width: var(--d_icon_size);
      margin: 8px;
    }
    .dialog{
      background-color:#0000008c;
      width: var(--dialog_size);
      height: var(--dialog_size);
      margin: 5%;
      border-radius: 50%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      align-content: center;
      top: 45%;
      left: 45%;
      backdrop-filter: blur(6px) grayscale(50%);
      box-shadow: 0px 0px 10px 0px #696969;
      border: 1px solid #ffffff;
    }
    .dialog.hide{
      display: none;
    }
    .dialog.pending{
      border: 1px solid var(--mode_color);
      box-shadow: 0px 0px 10px 0px var(--mode_color);
      animation: dialog-pending .8s infinite alternate;
    }
    
    @keyframes dialog-pending
    {
        from {box-shadow: 0px 0px 10px 0px var(--mode_color);}
        to {box-shadow: 0px 0px 0px 0px var(--mode_color);}
    }
    
    .dot_r{
      height: var(--dot_size);
      width: var(--dot_size);
      margin-top: 5px;
      background-color: white;
      border-radius: 50%;
      display: inline-block;
      opacity: 0.1;
    }
    .dot_h{
      visibility: hidden;
    }
    
    
    
    .dial {
      user-select: none;
    
      --thermostat-off-fill: #000000c2;
      --thermostat-path-color: rgba(255, 255, 255, 0.3);
      --thermostat-path-active-color: rgba(255, 255, 255, 0.8);
      --thermostat-path-active-color-large: rgba(255, 255, 255, 1);
      --thermostat-text-color: white;
    }
    
    .dial.has-thermo .dial__ico__leaf {
      visibility: hidden;
    }
    .dial .dial__shape {
      transition: fill 0.5s;
      fill: var(--thermostat-off-fill);
    }
    
    .dial__ico__thermo {
      fill: var(--thermostat-path-active-color);
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
    }
    .dial.has-thermo .dial__ico__thermo {
      display: block;
      opacity: 1;
      pointer-events: initial;
    }
    .dial__editableIndicator {
      fill: white;
      fill-rule: evenodd;
      opacity: 0;
      transition: opacity 0.5s;
    }
    .dial__temperatureControl {
      fill: white;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .dial__temperatureControl.control-visible {
      opacity: 0.2;
    }
    .dial--edit .dial__editableIndicator {
      opacity: 1;
    }
    .dial--state--off .dial__shape {
      fill: var(--thermostat-off-fill);
    }
    .dial--state--heat .dial__shape {
      fill: var(--heat_colorc);
    }
    .dial--state--cool .dial__shape {
      fill: var(--cool_colorc);
    }
    .dial--state--auto .dial__shape {
      fill: var(--auto_color);
    }
    .dial--state--fan_only .dial__shape {
      fill: var(--fan_only_color);
    }
    .dial--state--dry .dial__shape {
      fill: var(--dry_color);
    }
    .dial--state--idle .dial__shape {
      fill: var(--idle_color);
    }
    .dial__ticks path {
      fill: var(--thermostat-path-color);
    }
    .dial__ticks path.active {
      fill: var(--mode_color);
    }
    .dial__ticks path.active.large {
      fill: var(--mode_color);
    }
    .dial text, .dial text tspan {
      fill: var(--thermostat-text-color);
      text-anchor: middle;
      font-family: Helvetica, sans-serif;
      alignment-baseline: central;
      dominant-baseline: central;
    }
    .dial__lbl--target {
      font-size: 120px;
      font-weight: bold;
      visibility: hidden;
    }
    .dial__lbl--low, .dial__lbl--high {
      font-size: 90px;
      font-weight: bold;
      visibility: hidden;
    }
    .dial.in_control .dial__lbl--target {
      visibility: visible;
    }
    .dial.in_control .dial__lbl--low {
      visibility: visible;
    }
    .dial.in_control .dial__lbl--high {
      visibility: visible;
    }
    .dial__lbl--ambient {
      font-size: 120px;
      font-weight: bold;
      visibility: visible;
    }
    .dial.in_control.has_dual .dial__chevron--low,
    .dial.in_control.has_dual .dial__chevron--high {
      visibility: visible;
    }
    .dial.in_control .dial__chevron--target {
      visibility: visible;
    }
    .dial.in_control.has_dual .dial__chevron--target {
      visibility: hidden;
    }
    .dial .dial__chevron {
      visibility: hidden;
      fill: none;
      stroke: var(--thermostat-text-color);
      stroke-width: 4px;
      opacity: 0.3;
    }
    .dial .dial__chevron.pressed {
      opacity: 1;
    }
    .dial.in_control .dial__lbl--ambient {
      visibility: hidden;
    }
    .dial__lbl--super--ambient, .dial__lbl--super--target {
      font-size: 40px;
      font-weight: bold;
    }
    .dial__lbl--super--high, .dial__lbl--super--low {
      font-size: 30px;
      font-weight: bold;
    }
    .dial__lbl--ring {
      font-size: 22px;
      font-weight: bold;
    }
    
    `
    return css;
  }
}

class ThermostatUI {
  get container() {
    return this._container
  }
  set dual(val) {
    this._dual = val
  }
  get dual() {
    return this._dual;
  }
  get in_control() {
    return this._in_control;
  }
  get temperature() {
    return {
      low: this._low,
      high: this._high,
      target: this._target,
    }
  }
  get ambient() {
    return this._ambient;
  }
  set temperature(val) {
    this._ambient = val.ambient;
    this._low = val.low;
    this._high = val.high;
    this._target = val.target;
    if (this._low && this._high) this.dual = true;
  }
  constructor(config) {

    this._config = config;  // need certain options for updates
    this._ticks = [];       // need for dynamic tick updates
    this._controls = [];    // need for managing highlight and clicks
    this._dual = false;     // by default is single temperature
    this._container = document.createElement('div');
    this._main_icon = document.createElement('div');
    this._modes_dialog = document.createElement('div');
    this._container.className = config.small_i === true ? 'c_small_cont' : 'c_large_cont';
    config.title = config.title === null || config.title === undefined ? 'Title' : config.title

    this._container.appendChild(this._buildTitle(config.title));
    this._ic.addEventListener('click', () => this.openProp());
    this._container.appendChild(this._load_icon('',''));
    this.c_body = document.createElement('div');
    this.c_body.className = 'c_body';
    const root = this._buildCore(config.diameter);
    root.appendChild(this._buildDial(config.radius));
    root.appendChild(this._buildTicks(config.num_ticks));
    root.appendChild(this._buildRing(config.radius));
    root.appendChild(this._buildThermoIcon(config.radius));
    root.appendChild(this._buildDialSlot(1));
    root.appendChild(this._buildDialSlot(2));
    root.appendChild(this._buildDialSlot(3));

    root.appendChild(this._buildText(config.radius, 'ambient', 0));
    root.appendChild(this._buildText(config.radius, 'target', 0));
    root.appendChild(this._buildText(config.radius, 'low', -config.radius / 2.5));
    root.appendChild(this._buildText(config.radius, 'high', config.radius / 3));
    root.appendChild(this._buildChevrons(config.radius, 0, 'low', 0.7, -config.radius / 2.5));
    root.appendChild(this._buildChevrons(config.radius, 0, 'high', 0.7, config.radius / 3));
    root.appendChild(this._buildChevrons(config.radius, 0, 'target', 1, 0));
    root.appendChild(this._buildChevrons(config.radius, 180, 'low', 0.7, -config.radius / 2.5));
    root.appendChild(this._buildChevrons(config.radius, 180, 'high', 0.7, config.radius / 3));
    root.appendChild(this._buildChevrons(config.radius, 180, 'target', 1, 0));

    this.c_body.appendChild(root);
    this._container.appendChild(this.c_body);
    this._root = root;
    this._buildControls(config.radius);
    this._root.addEventListener('click', () => this._enableControls());
    this._container.appendChild(this._buildDialog());
    this._main_icon.addEventListener('click', () => this._openDialog());
    this._modes_dialog.addEventListener('click', () => this._hideDialog());
  }

  updateState(options,hass) {
    
    const config = this._config;
    const away = options.away || false;
    this.entity = options.entity;
    this.min_value = options.min_value;
    this.max_value = options.max_value;
    this.hvac_state = options.hvac_state;
    this.preset_mode = options.preset_mode;
    this.hvac_modes = options.hvac_modes;
    this.temperature = {
      low: options.target_temperature_low,
      high: options.target_temperature_high,
      target: options.target_temperature,
      ambient: options.ambient_temperature,
    }
    
    this._updateClass('has_dual', this.dual);
    let tick_label, from, to;
    const tick_indexes = [];
    const ambient_index = SvgUtil.restrictToRange(Math.round((this.ambient - this.min_value) / (this.max_value - this.min_value) * config.num_ticks), 0, config.num_ticks - 1);
    const target_index = SvgUtil.restrictToRange(Math.round((this._target - this.min_value) / (this.max_value - this.min_value) * config.num_ticks), 0, config.num_ticks - 1);
    const high_index = SvgUtil.restrictToRange(Math.round((this._high - this.min_value) / (this.max_value - this.min_value) * config.num_ticks), 0, config.num_ticks - 1);
    const low_index = SvgUtil.restrictToRange(Math.round((this._low - this.min_value) / (this.max_value - this.min_value) * config.num_ticks), 0, config.num_ticks - 1);
    
    if (!this.dual) {
      tick_label = [this._target, this.ambient].sort();
      this._updateTemperatureSlot(tick_label[0], -8, `temperature_slot_1`);
      this._updateTemperatureSlot(tick_label[1], 8, `temperature_slot_2`);
      
      switch (this.hvac_state) {
        case 'dry':
          this._load_icon(this.hvac_state, 'water-percent');
          break;
        case 'fan_only':
          this._load_icon(this.hvac_state, 'fan');
          break;
        case 'cool':
          this._load_icon(this.hvac_state, 'snowflake');
          
          if (target_index <= ambient_index) {
            from = target_index;
            to = ambient_index;
          }
          break;
        case 'heat':
          this._load_icon(this.hvac_state, 'fire');
          
          if (target_index >= ambient_index) {
            from = ambient_index;
            to = target_index;
          }
          break;
        case 'auto':
          this._load_icon(this.hvac_state, 'atom');
          
          if (target_index >= ambient_index) {
            from = ambient_index;
            to = target_index;
          }
          break;
        case 'off':
          this._load_icon(this.hvac_state, 'power');
          break;
        default:
          this._load_icon('more', 'dots-horizontal');
      }
    } else {
      tick_label = [this._low, this._high, this.ambient].sort();
      this._updateTemperatureSlot(null, 0, `temperature_slot_1`);
      this._updateTemperatureSlot(null, 0, `temperature_slot_2`);
      this._updateTemperatureSlot(null, 0, `temperature_slot_3`);

      switch (this.hvac_state) {
        case 'cool':
          if (high_index < ambient_index) {
            from = high_index;
            to = ambient_index;
            this._updateTemperatureSlot(this.ambient, 8, `temperature_slot_3`);
            this._updateTemperatureSlot(this._high, -8, `temperature_slot_2`);
          }
          break;
        case 'heat':
          if (low_index > ambient_index) {
            from = ambient_index;
            to = low_index;
            this._updateTemperatureSlot(this.ambient, -8, `temperature_slot_1`);
            this._updateTemperatureSlot(this._low, 8, `temperature_slot_2`);
          }
          break;
        case 'off':
          if (high_index < ambient_index) {
            from = high_index;
            to = ambient_index;
            this._updateTemperatureSlot(this.ambient, 8, `temperature_slot_3`);
            this._updateTemperatureSlot(this._high, -8, `temperature_slot_2`);
          }
          if (low_index > ambient_index) {
            from = ambient_index;
            to = low_index;
            this._updateTemperatureSlot(this.ambient, -8, `temperature_slot_1`);
            this._updateTemperatureSlot(this._low, 8, `temperature_slot_2`);
          }
          break;
        default:
      }
    }
    
    tick_label.forEach(item => tick_indexes.push(SvgUtil.restrictToRange(Math.round((item - this.min_value) / (this.max_value - this.min_value) * config.num_ticks), 0, config.num_ticks - 1)));
    this._updateTicks(from, to, tick_indexes, this.hvac_state);
    this._updateColor(this.hvac_state, this.preset_mode);
    this._updateText('ambient', this.ambient);
    this._updateEdit(false);
    this._updateDialog(this.hvac_modes,hass);
  }

  _temperatureControlClicked(index) {
    const config = this._config;
    let chevron;
    this._root.querySelectorAll('path.dial__chevron').forEach(el => SvgUtil.setClass(el, 'pressed', false));
    if (this.in_control) {
      if (this.dual) {
        switch (index) {
          case 0:
            // clicked top left 
            chevron = this._root.querySelectorAll('path.dial__chevron--low')[1];
            this._low = this._low + config.step;
            if ((this._low + config.idle_zone) >= this._high) this._low = this._high - config.idle_zone;
            break;
          case 1:
            // clicked top right
            chevron = this._root.querySelectorAll('path.dial__chevron--high')[1];
            this._high = this._high + config.step;
            if (this._high > this.max_value) this._high = this.max_value;
            break;
          case 2:
            // clicked bottom right
            chevron = this._root.querySelectorAll('path.dial__chevron--high')[0];
            this._high = this._high - config.step;
            if ((this._high - config.idle_zone) <= this._low) this._high = this._low + config.idle_zone;
            break;
          case 3:
            // clicked bottom left
            chevron = this._root.querySelectorAll('path.dial__chevron--low')[0];
            this._low = this._low - config.step;
            if (this._low < this.min_value) this._low = this.min_value;
            break;
        }
        SvgUtil.setClass(chevron, 'pressed', true);
        setTimeout(() => SvgUtil.setClass(chevron, 'pressed', false), 200);
        if (config.highlight_tap)
          SvgUtil.setClass(this._controls[index], 'control-visible', true);
      }
      else {
        if (index < 2) {
          // clicked top
          chevron = this._root.querySelectorAll('path.dial__chevron--target')[1];
          this._target = this._target + config.step;
          if (this._target > this.max_value) this._target = this.max_value;
          if (config.highlight_tap) {
            SvgUtil.setClass(this._controls[0], 'control-visible', true);
            SvgUtil.setClass(this._controls[1], 'control-visible', true);
          }
        } else {
          // clicked bottom
          chevron = this._root.querySelectorAll('path.dial__chevron--target')[0];
          this._target = this._target - config.step;
          if (this._target < this.min_value) this._target = this.min_value;
          if (config.highlight_tap) {
            SvgUtil.setClass(this._controls[2], 'control-visible', true);
            SvgUtil.setClass(this._controls[3], 'control-visible', true);
          }
        }
        SvgUtil.setClass(chevron, 'pressed', true);
        setTimeout(() => SvgUtil.setClass(chevron, 'pressed', false), 200);
      }
      if (config.highlight_tap) {
        setTimeout(() => {
          SvgUtil.setClass(this._controls[0], 'control-visible', false);
          SvgUtil.setClass(this._controls[1], 'control-visible', false);
          SvgUtil.setClass(this._controls[2], 'control-visible', false);
          SvgUtil.setClass(this._controls[3], 'control-visible', false);
        }, 200);
      }
    } else {
      this._enableControls();
    }
  }

  _updateEdit(show_edit) {
    SvgUtil.setClass(this._root, 'dial--edit', show_edit);
  }

  _enableControls() {
    const config = this._config;
    this._in_control = true;
    this._updateClass('in_control', this.in_control);
    if (this._timeoutHandler) clearTimeout(this._timeoutHandler);
    this._updateEdit(true);
    //this._updateClass('has-thermo', true);
    this._updateText('target', this.temperature.target);
    this._updateText('low', this.temperature.low);
    this._updateText('high', this.temperature.high);
    this._timeoutHandler = setTimeout(() => {
      this._updateText('ambient', this.ambient);
      this._updateEdit(false);
      //this._updateClass('has-thermo', false);
      this._in_control = false;
      this._updateClass('in_control', this.in_control);
      config.control();
    }, config.pending * 1000);
  }

  _updateClass(class_name, flag) {
    SvgUtil.setClass(this._root, class_name, flag);
  }

  _updateText(id, value) {
    const lblTarget = this._root.querySelector(`#${id}`).querySelectorAll('tspan');
    const text = Math.floor(value);
    if (value) {
      lblTarget[0].textContent = text;
      if (value % 1 != 0) {
        lblTarget[1].textContent = Math.round(value % 1 * 10);
      } else {
        lblTarget[1].textContent = '';
      }
    }
    
    if (this.in_control && id == 'target' && this.dual) {
      lblTarget[0].textContent = '·';
    }
  }

  _updateTemperatureSlot(value, offset, slot) {
    
    const config = this._config;
    const lblSlot1 = this._root.querySelector(`#${slot}`)
    lblSlot1.textContent = value != null ? SvgUtil.superscript(value) : '';
    
    const peggedValue = SvgUtil.restrictToRange(value, this.min_value, this.max_value);
    const position = [config.radius, config.ticks_outer_radius - (config.ticks_outer_radius - config.ticks_inner_radius) / 2];
    let degs = config.tick_degrees * (peggedValue - this.min_value) / (this.max_value - this.min_value) - config.offset_degrees + offset;
    const pos = SvgUtil.rotatePoint(position, degs, [config.radius, config.radius]);
    SvgUtil.attributes(lblSlot1, {
      x: pos[0],
      y: pos[1]
    });
  }

  _updateColor(state, preset_mode) {
    
    if(preset_mode === undefined)
      return;
    if(state != 'off' && preset_mode.toLowerCase() == 'idle')
      state = 'idle'
    
    this._root.classList.forEach(c => {
      if (c.indexOf('dial--state--') != -1)
        this._root.classList.remove(c);
    });
    this._root.classList.add('dial--state--' + state);
  }

  _updateTicks(from, to, large_ticks, hvac_state) {
    const config = this._config;

    const tickPoints = [
      [config.radius - 1, config.ticks_outer_radius],
      [config.radius + 1, config.ticks_outer_radius],
      [config.radius + 1, config.ticks_inner_radius],
      [config.radius - 1, config.ticks_inner_radius]
    ];
    const tickPointsLarge = [
      [config.radius - 1.5, config.ticks_outer_radius],
      [config.radius + 1.5, config.ticks_outer_radius],
      [config.radius + 1.5, config.ticks_inner_radius + 20],
      [config.radius - 1.5, config.ticks_inner_radius + 20]
    ];

    this._ticks.forEach((tick, index) => {
      let isLarge = false;
      let isActive = (index >= from && index <= to) ? 'active '+hvac_state : '';
      large_ticks.forEach(i => isLarge = isLarge || (index == i));
      if (isLarge) isActive += ' large';
      const theta = config.tick_degrees / config.num_ticks;
      SvgUtil.attributes(tick, {
        d: SvgUtil.pointsToPath(SvgUtil.rotatePoints(isLarge ? tickPointsLarge : tickPoints, index * theta - config.offset_degrees, [config.radius, config.radius])),
        class: isActive
      });
    });
  }
  _updateDialog(modes,hass){
    this._modes_dialog.innerHTML = "";
    for(var i=0;i<modes.length;i++){
      let icon;
      let mode = modes[i];
      switch (mode) {
        case 'dry':
          icon = 'water-percent';
          break;
        case 'fan_only':
          icon = 'fan';
          break;
        case 'cool':
          icon = 'snowflake';
          break;
        case 'heat':
          icon = 'fire';
          break;
        case 'auto':
          icon = 'atom';
          break;
        case 'off':
          icon = 'power';
          break;
      }
      let d = document.createElement('span');
      d.innerHTML = `<iron-icon class="modeicon ${mode}" icon="mdi:${icon}"></iron-icon>`
      d.addEventListener('click', (e) => this._setMode(e,mode,hass));
      //this._modes[i].push(d);
      this._modes_dialog.appendChild(d)
    }
  }
  _buildCore(diameter) {
    return SvgUtil.createSVGElement('svg', {
      width: '100%',
      height: '100%',
      viewBox: '0 0 ' + diameter + ' ' + diameter,
      class: 'dial'
    })
  }

  openProp() {
    this._config.propWin(this.entity.entity_id)
  }
  _openDialog(){
    this._modes_dialog.className = "dialog modes";
  }
  _hideDialog(){
    this._modes_dialog.className = "dialog modes hide";
  }
  _setMode(e, mode,hass){
    console.log(mode);
    let config = this._config;
    if (this._timeoutHandlerMode) clearTimeout(this._timeoutHandlerMode);
    hass.callService('climate', 'set_hvac_mode', {
      entity_id: this._config.entity,
      hvac_mode: mode,
    });
    this._modes_dialog.className = "dialog modes "+mode+" pending";
    this._timeoutHandlerMode = setTimeout(() => {
      this._modes_dialog.className = "dialog modes hide";
    }, config.pending * 1000);
    e.stopPropagation();
  }

  _buildTitle(title) {
    this._ic = document.createElement('div');
    this._ic.className = "prop";
    this._ic.innerHTML = `
      <paper-icon-button icon="hass:dots-vertical" class="c_icon" role="button" tabindex="0" aria-disabled="false"></paper-icon-button>
    `;
    this._container.innerHTML = `
      <div class="c_title">
        <div>${title}</div>
      </div>
    `;
    return this._ic;
  }
  _load_icon(state, ic_name){
    
    let ic_dot = 'dot_r'
    if(ic_name == ''){
      ic_dot = 'dot_h'
    }
    
    this._main_icon.innerHTML = `
      <div class="climate_info">
        <div class="mode_color"><span class="${ic_dot}"></span></div>
        <div class="modes"><iron-icon class="${state}" icon="mdi:${ic_name}"></iron-icon></div>
      </div>
    `;
    return this._main_icon;
  }
  _buildDialog(){
    this._modes_dialog.className = "dialog modes hide";
    return this._modes_dialog;
  }
  // build black dial
  _buildDial(radius) {
    return SvgUtil.createSVGElement('circle', {
      cx: radius,
      cy: radius,
      r: radius,
      class: 'dial__shape'
    })
  }
  // build circle around
  _buildRing(radius) {
    return SvgUtil.createSVGElement('path', {
      d: SvgUtil.donutPath(radius, radius, radius - 4, radius - 8),
      class: 'dial__editableIndicator',
    })
  }

  _buildTicks(num_ticks) {
    const tick_element = SvgUtil.createSVGElement('g', {
      class: 'dial__ticks'
    });
    for (let i = 0; i < num_ticks; i++) {
      const tick = SvgUtil.createSVGElement('path', {})
      this._ticks.push(tick);
      tick_element.appendChild(tick);
    }
    return tick_element;
  }
  
  _buildChevrons(radius, rotation, id, scale, offset) {
    const config = this._config;
    const translation = rotation > 0 ? -1 : 1;
    const width = config.chevron_size;
    const chevron_def = ["M", 0, 0, "L", width / 2, width * 0.3, "L", width, 0].map((x) => isNaN(x) ? x : x * scale).join(' ');
    const translate = [radius - width / 2 * scale * translation + offset, radius + 70 * scale * 1.1 * translation];
    const chevron = SvgUtil.createSVGElement('path', {
      class: `dial__chevron dial__chevron--${id}`,
      d: chevron_def,
      transform: `translate(${translate[0]},${translate[1]}) rotate(${rotation})`
    });
    return chevron;
  }

  _buildThermoIcon(radius) {
    const thermoScale = radius / 3 / 100;
    const thermoDef = 'M 37.999 38.261 V 7 c 0 -3.859 -3.141 -7 -7 -7 s -7 3.141 -7 7 v 31.261 c -3.545 2.547 -5.421 6.769 -4.919 11.151 c 0.629 5.482 5.066 9.903 10.551 10.512 c 0.447 0.05 0.895 0.074 1.339 0.074 c 2.956 0 5.824 -1.08 8.03 -3.055 c 2.542 -2.275 3.999 -5.535 3.999 -8.943 C 42.999 44.118 41.14 40.518 37.999 38.261 Z M 37.666 55.453 c -2.146 1.921 -4.929 2.8 -7.814 2.482 c -4.566 -0.506 -8.261 -4.187 -8.785 -8.752 c -0.436 -3.808 1.28 -7.471 4.479 -9.56 l 0.453 -0.296 V 38 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 h -1 v -3 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 h -1 v -3 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 h -1 v -3 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 h -1 v -3 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 h -1 v -3 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 h -1 V 8 h 1 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 H 26.1 c 0.465 -2.279 2.484 -4 4.899 -4 c 2.757 0 5 2.243 5 5 v 1 h -1 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 1 v 3 h -1 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 1 v 3 h -1 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 1 v 3 h -1 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 1 v 3 h -1 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 1 v 3 h -1 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 1 v 4.329 l 0.453 0.296 c 2.848 1.857 4.547 4.988 4.547 8.375 C 40.999 50.841 39.784 53.557 37.666 55.453 Z'.split(' ').map((x) => isNaN(x) ? x : x * thermoScale).join(' ');
    const translate = [radius - (thermoScale * 100 * 0.3), radius * 1.65]
    return SvgUtil.createSVGElement('path', {
      class: 'dial__ico__thermo',
      d: thermoDef,
      transform: 'translate(' + translate[0] + ',' + translate[1] + ')'
    });
  }

  _buildDialSlot(index) {
    return SvgUtil.createSVGElement('text', {
      class: 'dial__lbl dial__lbl--ring',
      id: `temperature_slot_${index}`
    })
  }

  _buildText(radius, name, offset) {
    const target = SvgUtil.createSVGElement('text', {
      x: radius + offset,
      y: radius,
      class: `dial__lbl dial__lbl--${name}`,
      id: name
    });
    const text = SvgUtil.createSVGElement('tspan', {
    });
    // hack
    if (name == 'target' || name == 'ambient') offset += 20;
    const superscript = SvgUtil.createSVGElement('tspan', {
      x: radius + radius / 3.1 + offset,
      y: radius - radius / 6,
      class: `dial__lbl--super--${name}`
    });
    target.appendChild(text);
    target.appendChild(superscript);
    return target;
  }

  _buildControls(radius) {
    let startAngle = 270;
    let loop = 4;
    for (let index = 0; index < loop; index++) {
      const angle = 360 / loop;
      const sector = SvgUtil.anglesToSectors(radius, startAngle, angle);
      const controlsDef = 'M' + sector.L + ',' + sector.L + ' L' + sector.L + ',0 A' + sector.L + ',' + sector.L + ' 1 0,1 ' + sector.X + ', ' + sector.Y + ' z';
      const path = SvgUtil.createSVGElement('path', {
        class: 'dial__temperatureControl',
        fill: 'blue',
        d: controlsDef,
        transform: 'rotate(' + sector.R + ', ' + sector.L + ', ' + sector.L + ')'
      });
      this._controls.push(path);
      path.addEventListener('click', () => this._temperatureControlClicked(index));
      this._root.appendChild(path);
      startAngle = startAngle + angle;
    }
  }

}

class SvgUtil {
  static createSVGElement(tag, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    this.attributes(element, attributes)
    return element;
  }
  static attributes(element, attrs) {
    for (let i in attrs) {
      element.setAttribute(i, attrs[i]);
    }
  }
  // Rotate a cartesian point about given origin by X degrees
  static rotatePoint(point, angle, origin) {
    const radians = angle * Math.PI / 180;
    const x = point[0] - origin[0];
    const y = point[1] - origin[1];
    const x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
    const y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
    return [x1, y1];
  }
  // Rotate an array of cartesian points about a given origin by X degrees
  static rotatePoints(points, angle, origin) {
    return points.map((point) => this.rotatePoint(point, angle, origin));
  }
  // Given an array of points, return an SVG path string representing the shape they define
  static pointsToPath(points) {
    return points.map((point, iPoint) => (iPoint > 0 ? 'L' : 'M') + point[0] + ' ' + point[1]).join(' ') + 'Z';
  }
  static circleToPath(cx, cy, r) {
    return [
      "M", cx, ",", cy,
      "m", 0 - r, ",", 0,
      "a", r, ",", r, 0, 1, ",", 0, r * 2, ",", 0,
      "a", r, ",", r, 0, 1, ",", 0, 0 - r * 2, ",", 0,
      "z"
    ].join(' ').replace(/\s,\s/g, ",");
  }
  static donutPath(cx, cy, rOuter, rInner) {
    return this.circleToPath(cx, cy, rOuter) + " " + this.circleToPath(cx, cy, rInner);
  }

  static superscript(n) {
   
    if ((n - Math.floor(n)) !== 0)
      n  = Number(n).toFixed(1);;
    const x = `${n}${n == 0 ? '' : ''}`;
    return x;
  }

  // Restrict a number to a min + max range
  static restrictToRange(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }
  static setClass(el, className, state) {
    
    
    el.classList[state ? 'add' : 'remove'](className);
  }

  static anglesToSectors(radius, startAngle, angle) {
    let aRad = 0 // Angle in Rad
    let z = 0 // Size z
    let x = 0 // Side x
    let X = 0 // SVG X coordinate
    let Y = 0 // SVG Y coordinate
    const aCalc = (angle > 180) ? 360 - angle : angle;
    aRad = aCalc * Math.PI / 180;
    z = Math.sqrt(2 * radius * radius - (2 * radius * radius * Math.cos(aRad)));
    if (aCalc <= 90) {
      x = radius * Math.sin(aRad);
    }
    else {
      x = radius * Math.sin((180 - aCalc) * Math.PI / 180);
    }
    Y = Math.sqrt(z * z - x * x);
    if (angle <= 180) {
      X = radius + x;
    }
    else {
      X = radius - x;
    }
    return {
      L: radius,
      X: X,
      Y: Y,
      R: startAngle
    }
  }
}

customElements.define('thermostat-card', ThermostatCard);