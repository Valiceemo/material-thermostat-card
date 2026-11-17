# Material Thermostat Card by [@Valiceemo](https://github.com/Valiceemo/material-thermostat-card)

[![Stable][releases-shield]][releases] [![HACS Badge][hacs-badge]][hacs-link] [![License][license-shield]](https://github.com/Valiceemo/material-thermostat-card/blob/main/LICENSE) [![Commits][commits-shield]][commits] [![Maintenance][maintenance-shield]][maintenance] [![Community Forum][forum-shield]][forum]

[releases-shield]: https://img.shields.io/github/v/release/Valiceemo/material-thermostat-card?style=flat-square
[releases]: https://github.com/Valiceemo/material-thermostat-card/releases/latest
[hacs-badge]: https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square
[hacs-link]: https://github.com/hacs/integration
[license-shield]: https://img.shields.io/github/license/Valiceemo/material-thermostat-card?style=flat-square
[commits-shield]: https://img.shields.io/github/last-commit/Valiceemo/material-thermostat-card?style=flat-square
[commits]: https://github.com/Valiceemo/material-thermostat-card/commits/main
[maintenance-shield]: https://img.shields.io/maintenance/yes/2026?style=flat-square
[maintenance]: https://github.com/Valiceemo/material-thermostat-card/graphs/commit-activity
[forum]: https://community.home-assistant.io/t/material-expressive-climate-card-a-google-home-style-dial-thermostat-card/1034776
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=flat-square

<p align="center">
  <img src="https://raw.githubusercontent.com/Valiceemo/material-thermostat-card/main/images/light-mode.png" width="300" alt="Light theme">
  <img src="https://raw.githubusercontent.com/Valiceemo/material-thermostat-card/main/images/dark-mode.png" width="300" alt="Dark theme">
</p>

A Material-style dial thermostat card for Home Assistant, inspired by the Google Home app.

## Features

- **Dial control:** drag the ring or use the − / + buttons
- **At a glance:** target and current temperature markers, plus heating / cooling status
- **Modes:** heat, cool, auto, dry and fan selector, with preset, fan and swing selectors when the entity supports them
- **Dual setpoint:** low / high handles for `heat_cool` entities
- **Info tile:** indoor, outdoor and humidity, optionally from separate sensors
- **Themes:** colours follow the HVAC mode and adapt to light and dark themes
- **Easy setup:** visual editor, no build step, no dependencies

## Installation

### HACS (recommended)

1. Open HACS and search for **Material Thermostat Card**
2. Click **Download**, then reload the browser

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Valiceemo&repository=material-thermostat-card&category=plugin)

If it doesn't appear in search, add it as a custom repository: HACS → ⋮ → **Custom repositories** → `https://github.com/Valiceemo/material-thermostat-card` → category **Dashboard**.

### Manual

1. Copy `material-thermostat-card.js` to `/config/www/`
2. Add a dashboard resource: `/local/material-thermostat-card.js` (type: **JavaScript module**)

## Usage

Minimal:

```yaml
type: custom:material-thermostat-card
entity: climate.living_room
```

With all options:

```yaml
type: custom:material-thermostat-card
entity: climate.living_room
name: Living Room
outdoor_entity: sensor.outdoor_temperature
indoor_temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
```

## Options

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

## Notes

- Modes, status and preset names use Home Assistant's own translations. The info-tile labels are currently English only.
- The card only shows what your entity supports. For example, humidity needs either a `humidity_entity` or a `current_humidity` attribute.

## Issues and feedback

Found a bug or want a feature? Please [open an issue](https://github.com/Valiceemo/material-thermostat-card/issues).

## Useful links

[Home Assistant Community Forum Thread](https://community.home-assistant.io/t/material-expressive-climate-card-a-google-home-style-dial-thermostat-card/1034776)

## License

MIT
