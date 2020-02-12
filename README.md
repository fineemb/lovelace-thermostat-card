<!--
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-02-03 12:52:45
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-02-12 18:30:09
 -->

# Lovelace Thermostat Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

A simple thermostat implemented in CSS and SVG based on <a href="https://codepen.io/dalhundal/pen/KpabZB/">Thermostat Control</a> by Dal Hundal
 (<a href="https://codepen.io/dalhundal">@dalhundal</a>) on <a href="https://codepen.io">CodePen</a>

+  Supports [HACS](https://github.com/custom-components/hacs) installation
+  Extra ambient temperature
+  Allow changing of Opration mode
+  Allow avoid the card background

## Preview
![](https://bbs.hassbian.com/data/attachment/forum/202002/03/124511gshba79arwahahsi.gif)

## HACS Installation
Search for Thermostat Card
## Manual Installation
1. Download `main.js` `thermostat_card.lib.js` `styles.js`
1. Copy to `www\community\lovelace-thermostat-card`
1. Add the following to your Lovelace resources
    ``` yaml
    resources:
      - url: /www/community/lovelace-thermostat-card/main.js
        type: module
    ```
1. Add the following to your Lovelace config `views.cards` key
    ```yaml
    - type: custom:thermostat-card
      entity: climate.gong_zuo_jian_kong_diao
      small_i: true
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
| small_i | boolean | false | Set to true if you have 2 climate in one card. Default 1 big card. (Must clear browser cache after chageing this value)
| step | number | 0.5 | The step to use when increasing or decreasing temperature
| highlight_tap | boolean | false | Show the tap area highlight when changing temperature settings
| chevron_size | number | 50 | Size of chevrons for temperature adjutment
| pending | number | 3 | Seconds to wait in control mode until state changes are sent back to the server
| idle_zone | number | 2 | Degrees of minimum difference between set points when thermostat supports both heating and cooling
| ambient_temperature | string | optional | An entity id of a sensor to use as `ambient_temperature` instead of the one provided by the thermostat

## Credits
<a href="https://codepen.io/dalhundal">@dalhundal</a>