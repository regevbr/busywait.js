/* istanbul ignore next */
// @ts-ignore
// tslint:disable-next-line:variable-name
const __awaiter = (thisArg, _arguments, P, generator) => {
    function adopt(value: any) {
        return value instanceof P ? value : new P((resolve: any) => {
            resolve(value);
        });
    }

    return new (P || (P = Promise))((resolve: any, reject: any) => {
        function fulfilled(value: any) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value: any) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result: any) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

type _CheckFn<T> = (iteration: number, delay: number, totalDelay: number) => T;
export type SyncCheckFn<T> = T extends Promise<any> ? never : _CheckFn<T>;
export type ASyncCheckFn<T> = _CheckFn<Promise<T>>;
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

const wrapSyncMethod = <T>(checkFn: CheckFn<T>): ASyncCheckFn<T> =>
    async (iteration: number, delay: number, totalDelay: number) => checkFn(iteration, delay, totalDelay);

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

const getDelayer = (options: IBusyWaitOptions): Delayer => (iteration: number) => {
    let delay = options.sleepTime * Math.pow(options.multiplier || 1, iteration);
    delay = Math.min(delay, options.maxDelay || Infinity);
    if (options.jitter === 'full') {
        return Math.round(Math.random() * delay);
    }
    return delay;
}

interface IIterationState<T> {
    iteration: number;
    delayerIteration: number;
    delay: number;
    readonly startTime: number;
    resolve: Resolve<IBusyWaitResult<T>>;
    reject: Reject;
    promise: Promise<IBusyWaitResult<T>>;
    options: IBusyWaitOptions;
    delayer: Delayer;
    checkFn: ASyncCheckFn<T>;
}

const buildIterationState = <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): IIterationState<T> => {
    const options = getAndValidateOptions(checkFn, _options);
    const delayer = getDelayer(options);
    const delayerIteration = options.waitFirst ? 0 : -1;
    return {
        iteration: 0,
        delayerIteration,
        startTime: Date.now(),
        delay: options.waitFirst ? delayer(delayerIteration) : 0,
        options,
        delayer,
        checkFn: wrapSyncMethod(checkFn),
        ...unwrapPromise<IBusyWaitResult<T>>(),
    }
}

const iterationCheck = <T>(state: IIterationState<T>) => {
    const iterationRun = async () => {
        state.iteration++;
        state.delayerIteration++;
        try {
            const totalDelay = Date.now() - state.startTime;
            const result = await state.checkFn(state.iteration, state.delay, totalDelay);
            return state.resolve({
                backoff: {
                    iterations: state.iteration,
                    time: totalDelay,
                },
                result,
            });
        } catch (e) {
            if (state.options.maxChecks && state.iteration === state.options.maxChecks) {
                return state.reject(new Error(state.options.failMsg || 'Exceeded number of iterations to wait'));
            }
            state.delay = state.delayer(state.delayerIteration);
            setTimeout(iterationRun, state.delay);
        }
    };
    setTimeout(iterationRun, state.delay);
    return state.promise;
}

export const busywait = async <T>(checkFn: CheckFn<T>, options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    const iterationState = buildIterationState(checkFn, options)
    return iterationCheck(iterationState);
};
