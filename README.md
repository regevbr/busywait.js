[![Npm Version](https://img.shields.io/npm/v/busywait.svg?style=popout)](https://www.npmjs.com/package/busywait)
[![Build Status](https://travis-ci.org/regevbr/busywait.js.svg?branch=master)](https://travis-ci.org/regevbr/busywait.js)
[![Coverage Status](https://coveralls.io/repos/github/regevbr/busywait.js/badge.svg?branch=master)](https://coveralls.io/github/regevbr/busywait.js?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/58abd1713b064f4c9af7dc88d7178ebe)](https://www.codacy.com/app/regevbr/busywait.js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regevbr/busywait.js&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/busywait.js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/regevbr/busywait.js?targetFile=package.json)
[![dependencies Status](https://david-dm.org/regevbr/busywait.js/status.svg)](https://david-dm.org/regevbr/busywait.js)
[![devDependencies Status](https://david-dm.org/regevbr/busywait.js/dev-status.svg)](https://david-dm.org/regevbr/busywait.js?type=dev)

# busywait.js
Simple Async busy wait module for Node.JS

## Main features
- Simple api to busy wait for a desired outcome
- Slim library (65 lines of code, no dependencies)
- Full typescript support

## Quick example
```typescript
import { busywait } from 'busywait';
import {IBusyWaitResult} from 'busywait';

const waitUntil = Date.now() + 2500;
const checkFn = (iteration: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log('running iteration', iteration);
        if (Date.now() > waitUntil) {
            return resolve('success');
        } else {
            return reject();
        }
    });
};
busywait(checkFn, {
    sleepTime: 500,
    maxChecks: 20,
})
    .then((result: IBusyWaitResult<string>) => {
        console.log('finished after', result.iterations, 'iterations', 'with' +
            ' result', result.result);
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
finished after 6 iterations with result success
```

## Install
```bash
npm install busywait
```

### Parameters

#### checkFn

A function that takes a single optional argument, which is the current iteration number.
The function can either:
- return a non promised value (in which case, a failed check should throw an error)
- return promised value (in which case, a failed check should return a rejection)

#### options

##### mandatory

- `sleepTime` - Time in ms to wait between checks  
- `maxChecks` - The max number of checks to perform before failing 

##### optional

- `waitFirst` - Should we wait the `sleepTime` before performing the first check (default: false)  
- `failMsg` - Custom error message to reject the promise with

### Return value

Return value is a promise.
- The promise will be resolved if the `checkFn` returned a valid value (resolved promise or did not throw an error)  within a legal number of checks.
- The promise will be rejected if the `checkFn` rejected ( or threw an error) `maxChecks` times.

Promise resolved value:
- `iterations` - The number of iterations it took to finish
- `result` - The resolved value of `checkFn`

## Contributing

All contributions are happily welcomed!  
Please make all pull requests to the `master` branch from your fork and ensure tests pass locally.
