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
