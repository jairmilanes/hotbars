# Changelog

## [1.4.1](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.0...hotbars-v1.4.1) (2022-11-04)


### Bug Fixes

* added url to the runtime handlebars compilation context ([aad915f](https://github.com/jairmilanes/hotbars/commit/aad915f0d8130617388076def48caff58162bdf2))
* better sass compiler feedback in the console logs ([864f4c9](https://github.com/jairmilanes/hotbars/commit/864f4c915df3096ffddc4aae8d510bd7f88b5e72))
* by passed scss updates in socket connector to only update once css has recompiled ([799e29e](https://github.com/jairmilanes/hotbars/commit/799e29e2d68a5044d9e1b39b168a55fc28ec0654))
* extended router re-configuration when files are added or excluded from views ([c88b4dc](https://github.com/jairmilanes/hotbars/commit/c88b4dc9015ad342dad4024e2851b542bbfcd382))
* fixed prettier parser for pre-compiled templates ([ca755b7](https://github.com/jairmilanes/hotbars/commit/ca755b76fe74f011e1cebc5ac020111fac9babc4))
* improved watcher events handling ([864f4c9](https://github.com/jairmilanes/hotbars/commit/864f4c915df3096ffddc4aae8d510bd7f88b5e72))

## [1.4.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.3.1...hotbars-v1.4.0) (2022-10-31)

### Features

- added json-server support for local development ([95016a7](https://github.com/jairmilanes/hotbars/commit/95016a7074ffdfc65ad14e1a989ff8afd0975f72))

### Bug Fixes

- fixed client connector not reloading proper files ([394f027](https://github.com/jairmilanes/hotbars/commit/394f027cb553b021f47d3ed39dc0878a484b7daf))
- improved error handling and recovery ([fcb8ad7](https://github.com/jairmilanes/hotbars/commit/fcb8ad71abf3b481643d50f2db5731402b709d41))

## [1.3.1](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.3.0...hotbars-v1.3.1) (2022-10-29)

### Bug Fixes

- **cli:** added more command options ([e7804b9](https://github.com/jairmilanes/hotbars/commit/e7804b952a5bafcaa0ace807a26366d99cabd537))
- **cli:** fixed int parser on cli definition ([e7804b9](https://github.com/jairmilanes/hotbars/commit/e7804b952a5bafcaa0ace807a26366d99cabd537))
- fixed invalid path for extra files in release please config ([8392b66](https://github.com/jairmilanes/hotbars/commit/8392b664ce34dc2b6a3b98886a6f7eda87e34bf9))
- improved log messages ([e7804b9](https://github.com/jairmilanes/hotbars/commit/e7804b952a5bafcaa0ace807a26366d99cabd537))

## [1.3.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.2.0...hotbars-v1.3.0) (2022-10-29)

### Features

- adds support to form data processing ([19099bf](https://github.com/jairmilanes/hotbars/commit/19099bfff4368426483a2e9b029ae41d0255a19b))
- **uploads:** Implemented Multer for upload processing ([19099bf](https://github.com/jairmilanes/hotbars/commit/19099bfff4368426483a2e9b029ae41d0255a19b))

### Bug Fixes

- added build step to release workflow ([8410416](https://github.com/jairmilanes/hotbars/commit/84104168e57dc0dfccb403d2dd5e7feb49b6a674))
- configured github access token for release please ([aafe8bc](https://github.com/jairmilanes/hotbars/commit/aafe8bca458e86595158cf2fd9aa7985092baf14))
- created a npm manual publish action workflow ([8b2155f](https://github.com/jairmilanes/hotbars/commit/8b2155f385c969f3b14e0f86e4eed2e5d20ad0e8))
- fixed npm publishing as public for scoped package ([92c48d4](https://github.com/jairmilanes/hotbars/commit/92c48d4b5ef61ae0f2fc34157ca74a4cc1eec53c))
- fixed type on release please config file ([36f0235](https://github.com/jairmilanes/hotbars/commit/36f0235501c7bbd805d090eda787d11efdeddac1))
- reseting deployment version to 1.0.0 ([13c1c74](https://github.com/jairmilanes/hotbars/commit/13c1c742dacdc581ef02d8642cc4b811d1944ba3))

## [1.2.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.1.0...hotbars-v1.2.0) (2022-10-28)

### Features

- fized missing id from workflows configuration for NPM publishing ([759e6f9](https://github.com/jairmilanes/hotbars/commit/759e6f98bdfa4a07d6816ab5c270a330fafc1953))

### Bug Fixes

- added build step to release workflow ([8410416](https://github.com/jairmilanes/hotbars/commit/84104168e57dc0dfccb403d2dd5e7feb49b6a674))
- configured github access token for release please ([aafe8bc](https://github.com/jairmilanes/hotbars/commit/aafe8bca458e86595158cf2fd9aa7985092baf14))
- created a npm manual publish action workflow ([8b2155f](https://github.com/jairmilanes/hotbars/commit/8b2155f385c969f3b14e0f86e4eed2e5d20ad0e8))
- fixed npm publishing as public for scoped package ([92c48d4](https://github.com/jairmilanes/hotbars/commit/92c48d4b5ef61ae0f2fc34157ca74a4cc1eec53c))
- fixed type on release please config file ([36f0235](https://github.com/jairmilanes/hotbars/commit/36f0235501c7bbd805d090eda787d11efdeddac1))
- reseting deployment version to 1.0.0 ([13c1c74](https://github.com/jairmilanes/hotbars/commit/13c1c742dacdc581ef02d8642cc4b811d1944ba3))

## [1.1.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.0.0...hotbars-v1.1.0) (2022-10-28)

### Features

- configured release please action for automated releases and npm publishing ([eebf6ac](https://github.com/jairmilanes/hotbars/commit/eebf6ac805bb3a03dde4e85b6d9e48e330426d77))
- first commit ([87d3e35](https://github.com/jairmilanes/hotbars/commit/87d3e355f52821a4f53d9131c888ee6bd742b6a5))
- fixed github workflows dir name ([55f5217](https://github.com/jairmilanes/hotbars/commit/55f5217c2c917deeb61f4e102ec5aea2be14eeb0))
- fized missing id from workflows configuration for NPM publishing ([759e6f9](https://github.com/jairmilanes/hotbars/commit/759e6f98bdfa4a07d6816ab5c270a330fafc1953))

### Bug Fixes

- added build step to release workflow ([8410416](https://github.com/jairmilanes/hotbars/commit/84104168e57dc0dfccb403d2dd5e7feb49b6a674))
- fixed type on release please config file ([36f0235](https://github.com/jairmilanes/hotbars/commit/36f0235501c7bbd805d090eda787d11efdeddac1))
- reseting deployment version to 1.0.0 ([13c1c74](https://github.com/jairmilanes/hotbars/commit/13c1c742dacdc581ef02d8642cc4b811d1944ba3))
