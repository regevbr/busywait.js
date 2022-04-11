# busywait.js Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## Development
-  nothing yet

## [v3.1.2](https://github.com/regevbr/busywait.js/compare/v3.1.1...v3.1.2)
### Fixed
-  Support for node 17

## [v3.1.1](https://github.com/regevbr/busywait.js/compare/v3.1.0...v3.1.1)
### Fixed
-  Support for node 16

## [v3.1.0](https://github.com/regevbr/busywait.js/compare/v3.0.0...v3.1.0)
### Added
-  Added total delay information to the checked function call
### Fixed
-  Stopped messing the global stop with the `__awaiter` helper function
-  Fixed checkFn doc in readme

## [v3.0.0](https://github.com/regevbr/busywait.js/compare/v2.0.0...v3.0.0)
### Breaking changes
-  Errors are now an instance of `Error` and not plain strings
-  Options type was modified
-  Return type was modified
### Added
-  Exponential backoff (with optional full jitter) support
-  Added to the result, the time it took to finish
-  Added delay information to the checked function call 
### Fixed
-  Better type inference
-  Updated readme
-  Updated all dependencies to the latest versions

## [v2.0.0](https://github.com/regevbr/busywait.js/compare/v1.1.0...v2.0.0)
### Breaking changes
-  Removed redundant export methods
-  Sync check functions will be considered as failed only if they throw error
### Added
-  Full typescript support [#9](https://github.com/regevbr/busywait.js/issues/9)
-  Added test coverage
### Fixed
-  Updated readme
-  Updated all dependencies to the latest versions 
