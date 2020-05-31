export function cssData(user) {
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
  .c_body {
    padding: 5% 5% 5% 5%;
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
    top: 82%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14%;
    height: 14%;
    --background-color: white;
  }
  .modes, .mode_color{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
  }
  .modes ha-icon {
    color: var(--mode_color);
    --mdc-icon-size: 100%;
  }
  .dialog{
    background-color:#0000008c;
    width: 90%;
    height: 90%;
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
  .dialog span {
    width:33%;
    margin: 3% 0;
  }
  .dialog ha-icon {
    color: var(--mode_color);
    --mdc-icon-size: 70%;
    margin: 15%;
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
    height: 100%;
    width: 100%;
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
  .dial__lbl--title {
    font-size: 24px;
  }
  `
  return css;
  }
  