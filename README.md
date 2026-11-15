# Material Thermostat Card

A Material-style dial thermostat card for Home Assistant, inspired by the Google Home app.

- Circular dial: drag the ring, or use the − / + buttons
- Target temperature and current temperature markers
- Heat / cool / auto / dry / fan mode selector, plus preset, fan and swing selectors when the entity supports them
- Dual setpoint (low / high) for `heat_cool` entities
- Indoor, outdoor and humidity info tile
- Power button and more-info dialog
- Colours follow the HVAC mode and adapt to light and dark themes
- Visual editor support, no build step, no dependencies

![Material Thermostat Card](https://raw.githubusercontent.com/valiceemo/material-thermostat-card/main/light-mode.png)

## Installation (HACS)

1. HACS → ⋮ → **Custom repositories**
2. Add `https://github.com/Valiceemo/material-thermostat-card`, category **Dashboard** (called *Plugin* in older versions)
3. Install **Material Thermostat Card** and reload the browser

### Manual

Copy `material-thermostat-card.js` to `/config/www/` and add a dashboard resource:
`/local/material-thermostat-card.js` (type: JavaScript module).

## Usage

```yaml
type: custom:material-thermostat-card
entity: climate.hive_thermostat
name: Living Room 
outdoor_entity: sensor.outdoor_temperature
indoor_temperature_entity: sensor.hive_current_temperature
humidity_entity: sensor.living_room_humidity
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `entity` | string | required | A `climate` entity |
| `name` | string | friendly name | Card title |
| `outdoor_entity` | string | none | A temperature `sensor` or a `weather` entity |
| `indoor_temperature_entity` | string | none | Separate sensor for indoor temperature (falls back to the thermostat's own reading) |
| `humidity_entity` | string | none | Separate sensor for humidity |
| `step` | number | entity step | Override the temperature step |
| `hide_action` | boolean | `false` | Hide the heating / cooling / idle status under the number |
| `hide_humidity` | boolean | `false` | Hide humidity in the info tile |
| `hide_presets` | boolean | `false` | Hide the preset, fan and swing selectors |
