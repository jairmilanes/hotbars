# Changelog

## [1.7.3](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.7.2...hotbars-v1.7.3) (2022-12-03)


### Bug Fixes

* update browserify dep location on package json ([457a357](https://github.com/jairmilanes/hotbars/commit/457a357e3826954121738113c77d6047943febc1))

## [1.7.2](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.7.1...hotbars-v1.7.2) (2022-12-03)


### Bug Fixes

* general improvements app wide ([aad0f2a](https://github.com/jairmilanes/hotbars/commit/aad0f2a071bff74af98767dffc342079060003ed))

## [1.7.1](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.7.0...hotbars-v1.7.1) (2022-11-28)


### Bug Fixes

* error when passing params to json server ([d5a8103](https://github.com/jairmilanes/hotbars/commit/d5a810324851fe8f574e4915632ed527e0b52f5e))
* errors on dashboard preventing it from initializing ([d5a8103](https://github.com/jairmilanes/hotbars/commit/d5a810324851fe8f574e4915632ed527e0b52f5e))
* removed date helper from runtime bundle to lower size and avoid bundling moment js ([d5a8103](https://github.com/jairmilanes/hotbars/commit/d5a810324851fe8f574e4915632ed527e0b52f5e))

## [1.7.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.6.4...hotbars-v1.7.0) (2022-11-27)

### Features

- added fake smtp server for email sending testing ([4ddb68a](https://github.com/jairmilanes/hotbars/commit/4ddb68a10e16a1b775bc4c9eafdeb21625d98caa))

### Bug Fixes

- added more tests to fake generator ([4ddb68a](https://github.com/jairmilanes/hotbars/commit/4ddb68a10e16a1b775bc4c9eafdeb21625d98caa))
- added more tests to server data manager, config, bootstrap and pages mapper ([4ddb68a](https://github.com/jairmilanes/hotbars/commit/4ddb68a10e16a1b775bc4c9eafdeb21625d98caa))
- broken router into smaller logic parts ([4ddb68a](https://github.com/jairmilanes/hotbars/commit/4ddb68a10e16a1b775bc4c9eafdeb21625d98caa))
- extended logger and improved cli log messages ([4ddb68a](https://github.com/jairmilanes/hotbars/commit/4ddb68a10e16a1b775bc4c9eafdeb21625d98caa))
- moved logger to a more accessable location ([4ddb68a](https://github.com/jairmilanes/hotbars/commit/4ddb68a10e16a1b775bc4c9eafdeb21625d98caa))

## [1.6.4](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.6.3...hotbars-v1.6.4) (2022-11-18)

### Bug Fixes

- typo under index export for auth strategy ([77f5c2c](https://github.com/jairmilanes/hotbars/commit/77f5c2c908be8da30e1134ec1df78495afd4debb))

## [1.6.3](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.6.2...hotbars-v1.6.3) (2022-11-18)

### Bug Fixes

- improved documentation under auth and data ([7176f11](https://github.com/jairmilanes/hotbars/commit/7176f11680de3de302502ead8f7ed1c1c4b8351b))
- rework of the fake command undergoing ([7176f11](https://github.com/jairmilanes/hotbars/commit/7176f11680de3de302502ead8f7ed1c1c4b8351b))
- typos under auth strategies ([7176f11](https://github.com/jairmilanes/hotbars/commit/7176f11680de3de302502ead8f7ed1c1c4b8351b))

## [1.6.2](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.6.1...hotbars-v1.6.2) (2022-11-18)

### Bug Fixes

- **data:** fixed QueryBuilder insert and update methods not saving data to local file ([6c09f0f](https://github.com/jairmilanes/hotbars/commit/6c09f0f064f6239fd8491047e105bf61d2b980c7))
- lodash-id augmentation typings with proper return values ([6c09f0f](https://github.com/jairmilanes/hotbars/commit/6c09f0f064f6239fd8491047e105bf61d2b980c7))
- **test:** configured jest and added first few tests ([6c09f0f](https://github.com/jairmilanes/hotbars/commit/6c09f0f064f6239fd8491047e105bf61d2b980c7))

## [1.6.1](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.6.0...hotbars-v1.6.1) (2022-11-17)

### Bug Fixes

- fixed missing types during github action build ([881b7da](https://github.com/jairmilanes/hotbars/commit/881b7da5ffd02bbba4a555a37fe3ac6ebec8c0a5))

## [1.6.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.5.1...hotbars-v1.6.0) (2022-11-17)

### Features

- **fake:** added support for post generation actions afterEach and afterAll ([c489412](https://github.com/jairmilanes/hotbars/commit/c4894124f5bcd7f9de58ef5dcdb6ad5ab8909814))

### Bug Fixes

- **auth:** added configuration for greater auth logic customization ([cb4c0f0](https://github.com/jairmilanes/hotbars/commit/cb4c0f0231bb3e4557eec8e0921280dd15d4d195))
- **auth:** fixed bugs on local authentication strategy ([67af68c](https://github.com/jairmilanes/hotbars/commit/67af68cbeb988f32c44a076cf07b86911a3f0a5f))
- **auth:** fixed promise error when extending AbstractStrategy ([67af68c](https://github.com/jairmilanes/hotbars/commit/67af68cbeb988f32c44a076cf07b86911a3f0a5f))
- **fake:** added afterAll post generation logic for fake data ([67af68c](https://github.com/jairmilanes/hotbars/commit/67af68cbeb988f32c44a076cf07b86911a3f0a5f))
- **fake:** fixed relations not being properly mapped ([c489412](https://github.com/jairmilanes/hotbars/commit/c4894124f5bcd7f9de58ef5dcdb6ad5ab8909814))
- **fake:** simplified configuration for rendom relations ([c489412](https://github.com/jairmilanes/hotbars/commit/c4894124f5bcd7f9de58ef5dcdb6ad5ab8909814))
- **website:** general fixes to web configurations ([23026bc](https://github.com/jairmilanes/hotbars/commit/23026bc23387c390de89f8378179f1062cad7fe3))

## [1.5.1](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.5.0...hotbars-v1.5.1) (2022-11-16)

### Bug Fixes

- authentication methods and added bcryptjs for password hashing ([c3c0bdc](https://github.com/jairmilanes/hotbars/commit/c3c0bdc8650f3aa39681a3cbd4b92e5f4eff147b))
- improved access to data from user files ([c3c0bdc](https://github.com/jairmilanes/hotbars/commit/c3c0bdc8650f3aa39681a3cbd4b92e5f4eff147b))
- improved fake data generation logic ([c3c0bdc](https://github.com/jairmilanes/hotbars/commit/c3c0bdc8650f3aa39681a3cbd4b92e5f4eff147b))
- improved registration of new authentication strategies from user files ([c3c0bdc](https://github.com/jairmilanes/hotbars/commit/c3c0bdc8650f3aa39681a3cbd4b92e5f4eff147b))
- new authentication strategy logic ([a2314ec](https://github.com/jairmilanes/hotbars/commit/a2314ec0e34b8d2b9be65314618d783e7f17bc2d))

## [1.5.0](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.6...hotbars-v1.5.0) (2022-11-13)

### Features

- added fake database generation with faker.js ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- added full support for helpers on pre-compiled templates ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- added support for client/server shared partials ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- server wide updates and new features ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))

### Bug Fixes

- improved folder structure ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- improved multipart configration to effect every route ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- improved pre-compilation logic ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- improved router reload on file changes ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- page routes not supporting methods other than git ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- renamed example to web for website use ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- splitted pre-rendering logic from main renderer ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))
- urlencoded parser warning on server start up ([d895458](https://github.com/jairmilanes/hotbars/commit/d89545838607575a521c53be47f5d6474c2a7ad6))

## [1.4.6](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.5...hotbars-v1.4.6) (2022-11-04)

### Bug Fixes

- attempting for copyFiles in github actions ([01246e9](https://github.com/jairmilanes/hotbars/commit/01246e9007b639821beaa1c343a2163401a25fd8))

## [1.4.5](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.4...hotbars-v1.4.5) (2022-11-04)

### Bug Fixes

- added verbose flag to copy files command ([49b01a2](https://github.com/jairmilanes/hotbars/commit/49b01a2f3eff31eb7f36436b91bc9ed275dee166))

## [1.4.4](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.3...hotbars-v1.4.4) (2022-11-04)

### Bug Fixes

- fixed copy command to copy whole ./client directory ([db4e3d3](https://github.com/jairmilanes/hotbars/commit/db4e3d3909fc916f6a1f59bbf33b4f51ade790bd))

## [1.4.3](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.2...hotbars-v1.4.3) (2022-11-04)

### Bug Fixes

- removed file logger temporarily for improvements ([63df840](https://github.com/jairmilanes/hotbars/commit/63df8407c728f6fb36da1fca38fe4df0502a4db0))

## [1.4.2](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.1...hotbars-v1.4.2) (2022-11-04)

### Bug Fixes

- moved json-server from dev dependencies to dependencies ([cae81a8](https://github.com/jairmilanes/hotbars/commit/cae81a83bddb578b3fafcf7cc574d7c31b591a89))

## [1.4.1](https://github.com/jairmilanes/hotbars/compare/hotbars-v1.4.0...hotbars-v1.4.1) (2022-11-04)

### Bug Fixes

- added url to the runtime handlebars compilation context ([aad915f](https://github.com/jairmilanes/hotbars/commit/aad915f0d8130617388076def48caff58162bdf2))
- better sass compiler feedback in the console logs ([864f4c9](https://github.com/jairmilanes/hotbars/commit/864f4c915df3096ffddc4aae8d510bd7f88b5e72))
- by passed scss updates in socket connector to only update once css has recompiled ([799e29e](https://github.com/jairmilanes/hotbars/commit/799e29e2d68a5044d9e1b39b168a55fc28ec0654))
- extended router re-configuration when files are added or excluded from views ([c88b4dc](https://github.com/jairmilanes/hotbars/commit/c88b4dc9015ad342dad4024e2851b542bbfcd382))
- fixed prettier parser for pre-compiled templates ([ca755b7](https://github.com/jairmilanes/hotbars/commit/ca755b76fe74f011e1cebc5ac020111fac9babc4))
- improved watcher events handling ([864f4c9](https://github.com/jairmilanes/hotbars/commit/864f4c915df3096ffddc4aae8d510bd7f88b5e72))

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
