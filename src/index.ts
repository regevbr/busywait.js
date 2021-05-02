export type SyncCheckFn<T> = T extends Promise<any> ? never : (iteration: number, delay: number) => T;
export type ASyncCheckFn<T> = (iteration: number, delay: number) => Promise<T>;
export type CheckFn<T> = ASyncCheckFn<T> | SyncCheckFn<T>;

export type Jitter = 'none' | 'full';

export interface IBusyWaitOptions {
    sleepTime: number;
    failMsg?: string;
    maxChecks?: number;
    waitFirst?: boolean;
    multiplier?: number;
    jitter?: Jitter;
    maxDelay?: number;
}

export interface IBusyWaitResult<T> {
    backoff: {
        iterations: number;
        time: number;
    }
    result: T;
}

type Resolve<T> = (result: T) => void;
type Reject = (error: Error) => void;
type Delayer = (iteration: number) => number;

const isFunction = (value: any): value is () => any => toString.call(value) === '[object Function]';
const isNumber = (value: any): value is number => typeof value === 'number';

const getAndValidateOptions = <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): IBusyWaitOptions => {
    const options = Object.assign({}, _options);
    if (isNumber(options.maxChecks) && (isNaN(options.maxChecks) || options.maxChecks < 1)) {
        throw new Error('maxChecks must be a valid integer greater than 1');
    }
    if (isNaN(options.sleepTime) || options.sleepTime < 1) {
        throw new Error('sleepTime must be a valid integer greater than 1');
    }
    if (isNumber(options.multiplier) &&
        (isNaN(options.multiplier) || options.multiplier < 1)) {
        throw new Error('multiplier must be a valid integer greater than 1');
    }
    if (isNumber(options.maxDelay) &&
        (isNaN(options.maxDelay) || options.maxDelay < 1)) {
        throw new Error('maxDelay must be a valid integer greater than 1');
    }
    if (!checkFn || !isFunction(checkFn)) {
        throw new Error('checkFn must be a function');
    }
    return options;
};

const wrapSyncMethod = <T>(checkFn: CheckFn<T>): ASyncCheckFn<T> =>
    async (iteration: number, delay: number) => checkFn(iteration, delay);

const unwrapPromise = <T>() => {
    let resolve: Resolve<T>;
    let reject: Reject;
    const promise = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    // @ts-expect-error
    return {promise, resolve, reject};
}

const getDelayer = (options: IBusyWaitOptions): Delayer => (iteration: number) => {
    let delay = options.sleepTime * Math.pow(options.multiplier || 1, iteration);
    delay = Math.min(delay, options.maxDelay || Infinity);
    if (options.jitter === 'full') {
        return Math.round(Math.random() * delay);
    }
    return delay;
}

export const busywait = async <T>(_checkFn: CheckFn<T>, _options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    const options = getAndValidateOptions(_checkFn, _options);
    const delayer = getDelayer(options);
    const checkFn = wrapSyncMethod(_checkFn);
    let iteration = 0;
    let delayerIteration = options.waitFirst ? 0 : -1;
    const start = Date.now();
    let delay = options.waitFirst ? delayer(delayerIteration) : 0;
    const {promise, resolve, reject} = unwrapPromise<IBusyWaitResult<T>>();
    const iterationCheck = async () => {
        iteration++;
        delayerIteration++;
        try {
            const result = await checkFn(iteration, delay);
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
            delay = delayer(delayerIteration);
            setTimeout(iterationCheck, delay);
        }
    };
    setTimeout(iterationCheck, delay);
    return promise;
};
