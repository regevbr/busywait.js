import {busywait} from '../dist'

const waitUntil = Date.now() + 2500;

const checkFn = async (iteration: number): Promise<string> => {
    console.log('running iteration', iteration);
    if (Date.now() > waitUntil) {
        return 'success';
    }
    throw new Error('custom error');
};

(async () => {
    const result = await busywait(checkFn, {
        backoff: {
            type: 'EXPONENT',
            initialSleepTime: 100,
        },
        maxChecks: 20,
    })
    console.log(`finished after ${result.backoff.time}ms (${result.backoff.iterations} iterations) with result ${result.result}`);
})();
