'use strict';

export type SyncCheckFn<T> = (iteration: number) => T;
export type ASyncCheckFn<T> = (iteration: number) => Promise<T>;

export type CheckFn<T> = SyncCheckFn<T> | ASyncCheckFn<T>;

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

export const busywait = <T>(checkFn: CheckFn<T>, _options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    const options = Object.assign({}, _options);
    return checkArgs(checkFn, options)
        .then(() => {
            return eventLoop(wrapSyncMethod(checkFn), options);
        });
};

const checkArgs = <T>(checkFn: CheckFn<T>, options: IBusyWaitOptions): Promise<void> => {
    if (isNaN(options.maxChecks) || options.maxChecks < 1) {
        return Promise.reject('maxChecks must be a valid integer greater than 0');
    }
    if (isNaN(options.sleepTime) || options.sleepTime < 1) {
        return Promise.reject('sleepTime must be a valid integer greater than 0');
    }
    if (!checkFn || !isFunction(checkFn)) {
        return Promise.reject('checkFn must be a function');
    }
    return Promise.resolve();
};

const wrapSyncMethod = <T>(checkFn: CheckFn<T>): ASyncCheckFn<T> => {
    return (iteration: number) => {
        return new Promise((resolve, reject) => {
            try {
                resolve(checkFn(iteration));
            } catch (err) {
                reject(err);
            }
        });
    };
};

const eventLoop = <T>(checkFn: ASyncCheckFn<T>, options: IBusyWaitOptions): Promise<IBusyWaitResult<T>> => {
    return new Promise((resolve, reject) => {
        let iteration = 0;
        const iterationCheck = () => {
            iteration++;
            checkFn(iteration)
                .then((result: T) => {
                    return resolve({
                        iterations: iteration,
                        result,
                    });
                })
                .catch(() => {
                    if (iteration === options.maxChecks) {
                        return reject(options.failMsg || 'Exceeded number of iterations to wait');
                    }
                    setTimeout(iterationCheck, options.sleepTime);
                });
        };
        setTimeout(iterationCheck, options.waitFirst ? options.sleepTime : 0);
    });
};

const isFunction = (obj: any): boolean => {
    return toString.call(obj) === '[object Function]';
};
