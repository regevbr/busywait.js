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
-  Simple api to busy wait for a desired outcome 
-  Exponential backoff (with optional full jitter) support 
-  Slim library (single file, 85 lines of code, no dependencies)
-  Full typescript support

## Quick example
```typescript
import { busywait } from 'busywait';

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number, delay: number): Promise<string> => {
    console.log(`Running iteration ${iteration} after delay of ${delay}ms`);
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
Running iteration 1 after delay of 0ms
Running iteration 2 after delay of 500ms
Running iteration 3 after delay of 500ms
Running iteration 4 after delay of 500ms
Running iteration 5 after delay of 500ms
Running iteration 6 after delay of 500ms
Finished after 2511ms (6 iterations) with result success
```

### Exponential backoff

```typescript
import { busywait } from 'busywait';

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number, delay: number): Promise<string> => {
    console.log(`Running iteration ${iteration} after delay of ${delay}ms`);
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
Running iteration 1 after delay of 0ms
Running iteration 2 after delay of 100ms
Running iteration 3 after delay of 200ms
Running iteration 4 after delay of 400ms
Running iteration 5 after delay of 800ms
Running iteration 6 after delay of 1600ms
Finished after 3111ms (6 iterations) with result success
```

### Exponential backoff with full jitter

```typescript
import { busywait } from 'busywait';

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number, delay: number): Promise<string> => {
    console.log(`Running iteration ${iteration} after delay of ${delay}ms`);
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
Running iteration 1 after delay of 78ms
Running iteration 2 after delay of 154ms
Running iteration 3 after delay of 228ms
Running iteration 4 after delay of 605ms
Running iteration 5 after delay of 136ms
Running iteration 6 after delay of 1652ms
Finished after 2863ms (6 iterations) with result success
```

## Install
```bash
npm install busywait
```

### Parameters

#### checkFn

A function that takes a single optional argument, which is the current iteration number.
The function can either:
-  return a non promised value (in which case, a failed check should throw an error)
-  return promised value (in which case, a failed check should return a rejected promise)

#### options

##### mandatory

-  `sleepTime` - Time in ms to wait between checks. In the exponential mode, will be the base sleep time.

##### optional

-  `multiplier` - The exponential multiplier. Set to 2 or higher to achieve exponential backoff (default: 1 - i.e. linear backoff)
-  `maxDelay` - The max delay value between checks in ms (default: infinity)
-  `maxChecks` - The max number of checks to perform before failing (default: infinity)
-  `waitFirst` - Should we wait the `sleepTime` before performing the first check (default: false)  
-  `jitter` - ('none' | 'full') The [jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) mode to use (default: none)
-  `failMsg` - Custom error message to reject the promise with

### Return value

Return value is a promise.
-  The promise will be resolved if the `checkFn` was resolved within a legal number of checks.
-  The promise will be rejected if the `checkFn` rejected (or threw an error) `maxChecks` times.

Promise resolved value:
-  `backoff.iterations` - The number of iterations it took to finish
-  `backoff.time` - The number of time it took to finish
-  `result` - The resolved value of `checkFn`

## Contributing

All contributions are happily welcomed!  
Please make all pull requests to the `master` branch from your fork and ensure tests pass locally.
