# [3.1.0](https://github.com/eaprelsky/nocturna-wheel/compare/v3.0.3...v3.1.0) (2025-11-16)


### Features

* **planets:** Add retrograde planet display and update asset management documentation ([ce6470d](https://github.com/eaprelsky/nocturna-wheel/commit/ce6470df80b3e747ff0e9a091d8449a92a71f23e))

## [3.0.3](https://github.com/eaprelsky/nocturna-wheel/compare/v3.0.2...v3.0.3) (2025-11-16)


### Bug Fixes

* **planets:** Correctly display retrograde planet indicator and resolve Rollup build issues ([0afccbc](https://github.com/eaprelsky/nocturna-wheel/commit/0afccbc45fb2e987b8c108c6b3d7aabb25eda1e1))

## [3.0.2](https://github.com/eaprelsky/nocturna-wheel/compare/v3.0.1...v3.0.2) (2025-11-14)


### Bug Fixes

* **renderer:** add explicit fill and stroke attributes to SVG elements ([f482871](https://github.com/eaprelsky/nocturna-wheel/commit/f4828710068109d42e604f120bf0051e9c260903))

## [3.0.1](https://github.com/eaprelsky/nocturna-wheel/compare/v3.0.0...v3.0.1) (2025-11-14)


### Bug Fixes

* **icons:** resolve inline icons not loading after npm install ([104b619](https://github.com/eaprelsky/nocturna-wheel/commit/104b619b5183314f8c362131fc4012420f5ac76c))

# [3.0.0](https://github.com/eaprelsky/nocturna-wheel/compare/v2.0.0...v3.0.0) (2025-11-13)


* feat(assets)!: implement hybrid inline/external icons approach ([e0f0b04](https://github.com/eaprelsky/nocturna-wheel/commit/e0f0b049638f4f067295de193a883eac7451c206))


### BREAKING CHANGES

* IconProvider constructor now accepts an options object
instead of a simple string. Legacy string argument still supported for
backwards compatibility with automatic conversion to { basePath: string, useInline: false }.
Users with custom icon paths should update their configuration as documented
in docs/MIGRATION_GUIDE.md.

# [2.0.0](https://github.com/eaprelsky/nocturna-wheel/compare/v1.1.0...v2.0.0) (2025-11-08)


### Features

* implement dual chart support with independent circles and three aspect systems ([c46ca3e](https://github.com/eaprelsky/nocturna-wheel/commit/c46ca3e162d2f9bd1eefcf4b8696d13dc6ab0688))


### BREAKING CHANGES

* Aspect rendering system has been refactored. The legacy toggleAspects() method is deprecated. Use togglePrimaryAspects(), toggleSecondaryAspects(), or toggleSynastryAspects() instead.

Features:
- Add support for independent secondary planets (inner circle)
- Implement three separate aspect systems:
  * Primary aspects (outer circle to outer circle)
  * Secondary aspects (inner circle to inner circle)
  * Synastry aspects (outer to inner with projection dots)
- Add hollow projection dots showing outer planet positions on inner circle
- Export HouseCalculator in UMD bundle
- Add toggle methods for each aspect type independently

Bug Fixes:
- Fix cross-aspect coordinate mapping (prevented overwriting of planet coordinates)
- Remove legacy aspect rendering to prevent duplicate lines

Documentation:
- Update README.md with dual chart examples and new API methods
- Update index.html demo with synastry examples
- Add comprehensive examples for all three aspect systems

This release enables full synastry, transit, and progression chart support with elegant projection-based visualization.

# [1.1.0](https://github.com/eaprelsky/nocturna-wheel/compare/v1.0.1...v1.1.0) (2025-11-08)


### Features

* Add planetary projections and refactor aspect rendering system ([f0ad669](https://github.com/eaprelsky/nocturna-wheel/commit/f0ad669a15dc8c5ec593ef86f3bc2b46f7dea0c6))

## [1.0.1](https://github.com/eaprelsky/nocturna-wheel/compare/v1.0.0...v1.0.1) (2025-05-18)


### Bug Fixes

* Fix semantic-release in package.json ([63d7228](https://github.com/eaprelsky/nocturna-wheel/commit/63d722810f9d8d5a592b2a2c352f4b3a87ea6810))

# 1.0.0 (2025-05-18)


### Features

* test changelog entry ([6b90bb4](https://github.com/eaprelsky/nocturna-wheel/commit/6b90bb475fa2a11758856427fa794de071385579))
