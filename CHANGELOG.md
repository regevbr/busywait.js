# busywait.js Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## Development
-  nothing yet

## [v3.0.0](https://github.com/regevbr/busywait.js/compare/v2.0.0...v3.0.0)
### Breaking changes
-  Errors are now an instance of `Error` and not plain strings
-  Options type was modified
-  Return type was modified
### Added
-  Exponential backoff (with optional full jitter) support
-  Added to the result, the time it took to finish
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
