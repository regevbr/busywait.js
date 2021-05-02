'use strict';

export type SyncCheckFn<T> = T extends Promise<any> ? never : (iteration: number) => T;
export type ASyncCheckFn<T> = (iteration: number) => Promise<T>;
export type CheckFn<T> = ASyncCheckFn<T> | SyncCheckFn<T>;

export interface IBusyWaitOptions {
    failMsg?: string;
    waitFirst?: boolean;
    sleepTime: number;
    maxChecks: number;
}

export interface IBusyWaitResult<T> {
    iterations: number;
    result: T;
}

const isFunction = (obj: any) => toString.call(obj) === '[object Function]';

const getOptions = <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): IBusyWaitOptions => {
    const options = Object.assign({}, _options);
    if (isNaN(options.maxChecks) || options.maxChecks < 1) {
        throw new Error('maxChecks must be a valid integer greater than 0');
    }
    if (isNaN(options.sleepTime) || options.sleepTime < 1) {
        throw new Error('sleepTime must be a valid integer greater than 0');
    }
    if (!checkFn || !isFunction(checkFn)) {
        throw new Error('checkFn must be a function');
    }
    return options;
};

const wrapSyncMethod = <T>(checkFn: CheckFn<T>): ASyncCheckFn<T> => async (iteration: number) => checkFn(iteration);

const eventLoop = <T>(checkFn: ASyncCheckFn<T>, options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    return new Promise((resolve, reject) => {
        let iteration = 0;
        const iterationCheck = async () => {
            iteration++;
            try {
                const result = await checkFn(iteration);
                return resolve({
                    iterations: iteration,
                    result,
                });
            } catch (e) {
                if (iteration === options.maxChecks) {
                    return reject(new Error(options.failMsg || 'Exceeded number of iterations to wait'));
                }
                setTimeout(iterationCheck, options.sleepTime);
            }
        };
        setTimeout(iterationCheck, options.waitFirst ? options.sleepTime : 0);
    });
};

export const busywait = async <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    const options = getOptions(checkFn, _options);
    return eventLoop(wrapSyncMethod(checkFn), options);
};
