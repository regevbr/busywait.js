[![Build Status](https://travis-ci.org/regevbr/busywait.js.svg?branch=master)](https://travis-ci.org/regevbr/busywait.js)
[![Coverage Status](https://coveralls.io/repos/github/regevbr/busywait.js/badge.svg)](https://coveralls.io/github/regevbr/busywait.js)
[![dependencies Status](https://david-dm.org/regevbr/busywait.js/status.svg)](https://david-dm.org/regevbr/busywait.js)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/busywait.js/badge.svg)](https://snyk.io/test/github/regevbr/busywait.js)


# busywait.js
Simple Async busy wait module for Node.JS

## Installation

This module is installed via npm:

```
npm install --save busywait
```

## Usage

Running:
```js
const busywait = require('busywait').sync;

const waitUntil = Date.now() + 2500;

function syncCheck(iteration) {
    console.log('running iteration', iteration);
    return Date.now() > waitUntil;
}

busywait(syncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (iterations) {
        console.log('finished after', iterations, 'iterations');
    });
```
or:
```js
const busywait = require('busywait').async;
const Promise = require('bluebird');

const waitUntil = Date.now() + 2500;

function asyncCheck(iteration) {
    return new Promise(function (resolve, reject) {
        console.log('running iteration', iteration);
        if (Date.now() > waitUntil) {
            return resolve();
        } else {
            return reject();
        }
    });
}

busywait(asyncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (iterations) {
        console.log('finished after', iterations, 'iterations');
    });
```
Will result in:
```
running iteration 1
running iteration 2
running iteration 3
running iteration 4
running iteration 5
running iteration 6
finished after 6 iterations
```

## Methods

### sync(syncCheckFn, options): Promise

The `syncCheckFn` first argument is the function to run on each iteration.
`syncCheckFn` must be a function with a boolean return value.
The current iteration number will be passed as first argument to every call of `syncCheckFn`. 

The mandatory options are:
- `sleepTime` - Time in ms to wait between checks  
- `maxChecks` - The max number of checks to perform before failing 

Return value is a promise.
The promise will be resolved with the number of iterations passed if the `syncCheckFn` returned true within a legal number of checks.
The promise will be rejected if the `syncCheckFn` rejected `maxChecks` times.

### async(asyncCheckFn, options): Promise

The `asyncCheckFn` first argument is the function to run on each iteration.
`syncCheckFn` must be a function with a promise return value.
The current iteration number will be passed as first argument to every call of `asyncCheckFn`. 

The mandatory options are:
- `sleepTime` - Time in ms to wait between checks  
- `maxChecks` - The max number of checks to perform before failing 

Return value is a promise.
The promise will be resolved with the number of iterations passed if the `asyncCheckFn` was resolved within a legal number of checks.
The promise will be rejected if the `asyncCheckFn` rejected `maxChecks` times.
