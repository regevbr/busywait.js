[![Npm Version](https://img.shields.io/npm/v/busywait.svg?style=popout)](https://www.npmjs.com/package/busywait)
[![node](https://img.shields.io/node/v-lts/busywait)](https://www.npmjs.com/package/busywait)
[![Build status](https://github.com/regevbr/busywait.js/actions/workflows/ci.yml/badge.svg?branch=master)](https://www.npmjs.com/package/busywait)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5cc9e9fe4871a315f2aa/test_coverage)](https://codeclimate.com/github/regevbr/busywait.js/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/5cc9e9fe4871a315f2aa/maintainability)](https://codeclimate.com/github/regevbr/busywait.js/maintainability)
[![Npm Version](https://img.shields.io/npm/v/busywait.svg?style=popout)](https://www.npmjs.com/package/busywait)
[![node](https://img.shields.io/node/v-lts/busywait)](https://www.npmjs.com/package/busywait)
[![Build status](https://github.com/regevbr/busywait.js/actions/workflows/ci.yml/badge.svg?branch=master)](https://www.npmjs.com/package/busywait)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5cc9e9fe4871a315f2aa/test_coverage)](https://codeclimate.com/github/regevbr/busywait.js/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/5cc9e9fe4871a315f2aa/maintainability)](https://codeclimate.com/github/regevbr/busywait.js/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/busywait.js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/regevbr/busywait.js?targetFile=package.json)

# busywait.js

Simple Async busy wait module for Node.JS

## Main features

- Simple api to busy wait for a desired outcome
- Exponential backoff (with optional full jitter) support
- Slim library (single file, 100 lines of code, no dependencies)
- Full typescript support

## Quick example

```typescript
import {busywait} from 'busywait';

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number, delay: number, totalDelay: number): Promise<string> => {
    console.log(`Running iteration ${iteration} after delay of ${delay}ms and total delay of ${totalDelay}`);
    if (Date.now() > waitUntil) {
        return `success`;
    }
    throw new Error('custom error');
};

(async () => {
    const result = await busywait(checkFn, {
        sleepTime: 500,
        maxChecks: 20,
    })
    console.log(`Finished after ${result.backoff.time}ms (${result.backoff.iterations} iterations) with result ${result.result}`);
})();
```

Will result in:

``` bash
Running iteration 1 after delay of 0ms and total delay of 1
Running iteration 2 after delay of 500ms and total delay of 504
Running iteration 3 after delay of 500ms and total delay of 1007
Running iteration 4 after delay of 500ms and total delay of 1508
Running iteration 5 after delay of 500ms and total delay of 2010
Running iteration 6 after delay of 500ms and total delay of 2511
Finished after 2511ms (6 iterations) with result success
```

### Exponential backoff

```typescript
import {busywait} from 'busywait';

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number, delay: number, totalDelay: number): Promise<string> => {
    console.log(`Running iteration ${iteration} after delay of ${delay}ms and total delay of ${totalDelay}`);
    if (Date.now() > waitUntil) {
        return `success`;
    }
    throw new Error('custom error');
};

(async () => {
    const result = await busywait(checkFn, {
        sleepTime: 100,
        jitter: 'none',
        multiplier: 2,
    })
    console.log(`Finished after ${result.backoff.time}ms (${result.backoff.iterations} iterations) with result ${result.result}`);
})();
```

Will result in:

``` bash
Running iteration 1 after delay of 0ms and total delay of 1
Running iteration 2 after delay of 100ms and total delay of 104
Running iteration 3 after delay of 200ms and total delay of 306
Running iteration 4 after delay of 400ms and total delay of 707
Running iteration 5 after delay of 800ms and total delay of 1509
Running iteration 6 after delay of 1600ms and total delay of 3110
Finished after 3110ms (6 iterations) with result success
```

### Exponential backoff with full jitter

```typescript
import {busywait} from 'busywait';

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number, delay: number, totalDelay: number): Promise<string> => {
    console.log(`Running iteration ${iteration} after delay of ${delay}ms and total delay of ${totalDelay}`);
    if (Date.now() > waitUntil) {
        return `success`;
    }
    throw new Error('custom error');
};

(async () => {
    const result = await busywait(checkFn, {
        sleepTime: 100,
        jitter: 'full',
        multiplier: 2,
        waitFirst: true,
    })
    console.log(`Finished after ${result.backoff.time}ms (${result.backoff.iterations} iterations) with result ${result.result}`);
})();
```

Will result in:

``` bash
Running iteration 1 after delay of 31ms and total delay of 31
Running iteration 2 after delay of 165ms and total delay of 199
Running iteration 3 after delay of 217ms and total delay of 417
Running iteration 4 after delay of 378ms and total delay of 796
Running iteration 5 after delay of 1397ms and total delay of 2195
Running iteration 6 after delay of 1656ms and total delay of 3853
Finished after 3853ms (6 iterations) with result success
```

## Install

```bash
npm install busywait
```

### Parameters

#### checkFn

A function that takes a single optional argument, which is the current iteration number.

##### Args

- `iteration` - The current iteration number (starting from 1)
- `delay` - The last delay (in ms) that was applied
- `totalDelay` - The total delay (in ms) applied so far

##### Return

Either:

- a non promised value (in which case, a failed check should throw an error)
- a promised value (in which case, a failed check should return a rejected promise)

#### options

##### mandatory

- `sleepTime` - Time in ms to wait between checks. In the exponential mode, will be the base sleep time.

##### optional

- `multiplier` - The exponential multiplier. Set to 2 or higher to achieve exponential backoff (default: 1 - i.e. linear
  backoff)
- `maxDelay` - The max delay value between checks in ms (default: infinity)
- `maxChecks` - The max number of checks to perform before failing (default: infinity)
- `waitFirst` - Should we wait the `sleepTime` before performing the first check (default: false)
- `jitter` - ('none' | 'full') The [jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
  mode to use (default: none)
- `failMsg` - Custom error message to reject the promise with

### Return value

Return value is a promise.

- The promise will be resolved if the `checkFn` was resolved within a legal number of checks.
- The promise will be rejected if the `checkFn` rejected (or threw an error) `maxChecks` times.

Promise resolved value:

- `backoff.iterations` - The number of iterations it took to finish
- `backoff.time` - The number of time it took to finish
- `result` - The resolved value of `checkFn`

## Contributing

All contributions are happily welcomed!  
Please make all pull requests to the `master` branch from your fork and ensure tests pass locally.
