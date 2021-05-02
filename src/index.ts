export type SyncCheckFn<T> = T extends Promise<any> ? never : (iteration: number) => T;
export type ASyncCheckFn<T> = (iteration: number) => Promise<T>;
export type CheckFn<T> = ASyncCheckFn<T> | SyncCheckFn<T>;

export type Jitter = 'none' | 'full';

export interface IBusyWaitExponentialBackoffOptions {
    initialSleepTime: number;
    multiplier?: number;
    maxDelay?: number;
    jitter?: Jitter;
    type: 'EXPONENT';
}

export interface IBusyWaitLinearBackoffOptions {
    sleepTime: number;
    type: 'LINEAR';
}

export type IBusyWaitBackoffOptions = IBusyWaitLinearBackoffOptions | IBusyWaitExponentialBackoffOptions;

export interface IBusyWaitOptions {
    failMsg?: string;
    waitFirst?: boolean;
    maxChecks?: number;
    backoff: IBusyWaitBackoffOptions;
}

export interface IBusyWaitResult<T> {
    backoff: {
        iterations: number;
        time: number;
    }
    result: T;
}

const isLinearBackoffOptions = (x: IBusyWaitBackoffOptions): x is IBusyWaitLinearBackoffOptions => {
    return x.type === 'LINEAR';
}

const isFunction = (value: any): value is () => any => toString.call(value) === '[object Function]';
const isNumber = (value: any): value is number => typeof value === 'number';

const getOptions = <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): IBusyWaitOptions => {
    const options = Object.assign({}, _options);
    if (isNumber(options.maxChecks) && (isNaN(options.maxChecks) || options.maxChecks < 1)) {
        throw new Error('maxChecks must be a valid integer greater than 0');
    }
    if (isLinearBackoffOptions(options.backoff)) {
        if (isNaN(options.backoff.sleepTime) || options.backoff.sleepTime < 1) {
            throw new Error('sleepTime must be a valid integer greater than 0');
        }
    } else {
        if (isNaN(options.backoff.initialSleepTime) || options.backoff.initialSleepTime < 1) {
            throw new Error('initialSleepTime must be a valid integer greater than 0');
        }
        if (isNumber(options.backoff.multiplier) &&
            (isNaN(options.backoff.multiplier) || options.backoff.multiplier < 1)) {
            throw new Error('multiplier must be a valid integer greater than 0');
        }
        if (isNumber(options.backoff.maxDelay) &&
            (isNaN(options.backoff.maxDelay) || options.backoff.maxDelay < 1)) {
            throw new Error('maxDelay must be a valid integer greater than 0');
        }
    }
    if (!checkFn || !isFunction(checkFn)) {
        throw new Error('checkFn must be a function');
    }
    return options;
};

const wrapSyncMethod = <T>(checkFn: CheckFn<T>): ASyncCheckFn<T> => async (iteration: number) => checkFn(iteration);

const eventLoop = <T>(checkFn: ASyncCheckFn<T>, options: IBusyWaitOptions, delayer: Delayer)
    : Promise<IBusyWaitResult<T>> => {
    return new Promise((resolve, reject) => {
        let iteration = 0;
        const start = Date.now();
        const iterationCheck = async () => {
            iteration++;
            try {
                const result = await checkFn(iteration);
                return resolve({
                    backoff: {
                        iterations: iteration,
                        time: Date.now() - start,
                    },
                    result,
                });
            } catch (e) {
                if (options.maxChecks && iteration === options.maxChecks) {
                    return reject(new Error(options.failMsg || 'Exceeded number of iterations to wait'));
                }
                setTimeout(iterationCheck, delayer(iteration));
            }
        };
        setTimeout(iterationCheck, options.waitFirst ? delayer(iteration) : 0);
    });
};

export const busywait = async <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    const options = getOptions(checkFn, _options);
    const delayer = getDelayer(options.backoff);
    return eventLoop(wrapSyncMethod(checkFn), options, delayer);
};

type Delayer = (iteration: number) => number;

const getDelayer = (options: IBusyWaitBackoffOptions): Delayer => (iteration: number) => {
    if (isLinearBackoffOptions(options)) {
        return options.sleepTime;
    }
    let delay = options.initialSleepTime * Math.pow(options.multiplier || 2, iteration);
    delay = Math.min(delay, options.maxDelay || Infinity);
    if (options.jitter === 'full') {
        return Math.round(Math.random() * delay);
    }
    return delay;
}
