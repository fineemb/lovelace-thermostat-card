<!--
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-02-03 12:52:45
 * @LastEditors   : fineemb
 * @LastEditTime  : 2026-08-12
 -->

# Lovelace Thermostat Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

A simple thermostat implemented in CSS and SVG based on <a href="https://codepen.io/dalhundal/pen/KpabZB/">Thermostat Control</a> by Dal Hundal
 (<a href="https://codepen.io/dalhundal">@dalhundal</a>) on <a href="https://codepen.io">CodePen</a>

+  Supports [HACS](https://github.com/custom-components/hacs) installation
+  Extra ambient temperature
+  Allow changing of operation mode
+  Optional no-card background mode
+  Fully configurable from the Lovelace UI editor
+  Themeable via `--thermostat-*` CSS variables

## Preview
![](https://bbs.hassbian.com/data/attachment/forum/202003/14/172544q3ajp7742cbo757h.gif)

## Update
### v1.4.0
+ Add UI editor support (`getConfigForm`) with a schema-based form
+ Register the card in the Lovelace card picker (**Custom cards** section)
+ Auto-select the first available `climate.*` entity when the card is added (`getStubConfig`)
+ Editor labels use Home Assistant's translations when available; card-specific fields fall back to built-in Chinese/English
+ `--thermostat-*` CSS variables can now be overridden by the HA theme, with the built-in values kept as fallbacks
+ Fix `setConfig` entity validation and add NaN guards for temperature values
### v1.3.0
+ fix icon
+ Fix the problem that the title blocks the arrow button [#16](https://github.com/fineemb/lovelace-thermostat-card/issues/16#issue-622934186)
+ Remove the small_i parameter and have done adaptive scaling
## HACS Installation
Search for Thermostat Card

## UI Editor
The card is registered in the Lovelace card picker, so you can add it from the **Custom cards** section without writing YAML:

+ Picking the card pre-fills the first available `climate.*` entity.
+ The editor form exposes all options listed below; the `entity` selector is restricted to climate entities.
+ Field labels use Home Assistant's own translations when available. For card-specific fields that Home Assistant does not translate, the card falls back to its built-in Chinese (`zh`) and English (`en`) labels based on the HA UI language.

> Note: the schema-based form requires Home Assistant 2022.5 or newer. On older versions the card can only be configured through the YAML editor.

## Manual Installation
1. Download `main.js` `thermostat_card.lib.js` `styles.js`
1. Copy to `www\community\lovelace-thermostat-card`
1. Add the following to your Lovelace resources
    ``` yaml
    resources:
      - url: /hacsfiles/lovelace-thermostat-card/main.js
        type: module
    ```
    When upgrading, append a version query to the resource URL (e.g. `main.js?v=1.4.0`) to bypass the browser cache.
1. Add the following to your Lovelace config `views.cards` key
    ```yaml
    - type: custom:thermostat-card
      entity: climate.gong_zuo_jian_kong_diao
      title: 工作间
    ```
    Replace `climate.gong_zuo_jian_kong_diao` with your climate's entity_id and `工作间` with any name you'd like to name your climate with

## Options

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:thermostat-card`
| entity | string | **Required** | The entity id of climate entity. Example: `climate.hvac`
| title | string | optional | Card title
| no_card | boolean | false | Set to true to avoid the card background and use the custom element in picture-elements.
| step | number | 0.5 | The step to use when increasing or decreasing temperature
| highlight_tap | boolean | false | Show the tap area highlight when changing temperature settings
| chevron_size | number | 50 | Size of chevrons for temperature adjustment
| pending | number | 3 | Seconds to wait in control mode until state changes are sent back to the server
| idle_zone | number | 2 | Degrees of minimum difference between set points when thermostat supports both heating and cooling
| ambient_temperature | string | optional | An entity id of a sensor to use as `ambient_temperature` instead of the one provided by the thermostat
| min_value | number | optional | Overrule the minimum temperature from the climate entity
| max_value | number | optional | Overrule the maximum temperature from the climate entity
| diameter | number | 400 | Diameter of the dial in the SVG viewBox
| num_ticks | number | 150 | Number of tick marks on the dial
| tick_degrees | number | 300 | Degrees of the dial covered by the tick marks

## Theming
The dial uses the following CSS variables. If your HA theme defines them (for example via the theme's `variables:` section), the theme values win; otherwise the built-in defaults are used:

| Variable | Default | Used for
| ---- | ---- | ----
| `--thermostat-off-fill` | `#000000c2` | Dial background (off state)
| `--thermostat-path-color` | `rgba(255, 255, 255, 0.3)` | Tick marks
| `--thermostat-path-active-color` | `rgba(255, 255, 255, 0.8)` | Thermostat icon
| `--thermostat-text-color` | `white` | Text and temperature adjustment chevrons

## Credits
<a href="https://codepen.io/dalhundal">@dalhundal</a>
