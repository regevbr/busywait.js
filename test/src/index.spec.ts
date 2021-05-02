import {busywait, CheckFn, IBusyWaitResult} from '../../dist';
// @ts-ignore
import {itParam} from 'mocha-param';

const successMessage = 'success';

interface IParam {
    checkFn: CheckFn<string>;
}

type Done = (error?: any) => void;

describe('busywait.js', function() {

    this.timeout(10000);

    const waitTime = 2500;
    let waitUntil: number;
    let iterationsArray: number[];
    let delaysArray: number[];

    beforeEach(() => {
        iterationsArray = [];
        delaysArray = [];
        waitUntil = Date.now() + waitTime;
    });

    const checkIterationsArray = (iterations: number, delay: number, startDelay: boolean) => {
        iterationsArray.length.should.equal(iterations);
        delaysArray.length.should.equal(iterations);
        for (let i = 0; i < iterations; i++) {
            iterationsArray[i].should.equal(i + 1);
            delaysArray[i].should.equal((!startDelay && i === 0) ? 0 : delay);
        }
    };

    const checkIterationsAndDelaysArray = (iterations: number, delays: number[]) => {
        iterationsArray.length.should.equal(iterations);
        delaysArray.length.should.equal(iterations);
        for (let i = 0; i < iterations; i++) {
            iterationsArray[i].should.equal(i + 1);
            delaysArray[i].should.equal(delays[i]);
        }
    };

    const checkJitterDelaysArray = (delays: number[]) => {
        for (let i = 0; i < iterationsArray.length; i++) {
            delaysArray[i].should.be.lessThan(delays[i]);
        }
    };

    const syncCheck = (iteration: number, delay: number): string => {
        iterationsArray.push(iteration);
        delaysArray.push(delay);
        if (Date.now() > waitUntil) {
            return successMessage;
        }
        throw new Error('not the time yet');
    };

    const asyncCheck = (iteration: number, delay: number): Promise<string> => {
        iterationsArray.push(iteration);
        delaysArray.push(delay);
        return new Promise((resolve, reject) => {
            if (Date.now() > waitUntil) {
                return resolve(successMessage);
            } else {
                return reject();
            }
        });
    };

    const params: IParam[] = [
        {checkFn: syncCheck},
        {checkFn: asyncCheck},
    ];

    itParam('should complete', params, (param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            maxChecks: 20,
        })
            .then((result: IBusyWaitResult<string>) => {
                result.backoff.iterations.should.equal(6);
                result.backoff.time.should.be.greaterThan(waitTime - 100);
                result.backoff.time.should.be.lessThan(waitTime + 100);
                result.result.should.equal(successMessage);
                checkIterationsArray(6, 500, false);
            });
    });

    itParam('should complete with exponential backoff and jitter', params, (param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            multiplier: 2,
            waitFirst: true,
            jitter: 'full',
        })
            .then((result: IBusyWaitResult<string>) => {
                result.result.should.equal(successMessage);
                checkJitterDelaysArray([500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000]);
            });
    });

    itParam('should complete with exponential backoff', params, (param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            multiplier: 2,
        })
            .then((result: IBusyWaitResult<string>) => {
                result.backoff.iterations.should.equal(4);
                result.backoff.time.should.be.greaterThan(waitTime - 100);
                result.backoff.time.should.be.lessThan(waitTime + 1500);
                result.result.should.equal(successMessage);
                checkIterationsAndDelaysArray(4, [0, 500, 1000, 2000]);
            });
    });

    itParam('should complete with exponential backoff and start delay', params, (param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            multiplier: 2,
            waitFirst: true,
        })
            .then((result: IBusyWaitResult<string>) => {
                result.backoff.iterations.should.equal(3);
                result.backoff.time.should.be.greaterThan(waitTime - 100);
                result.backoff.time.should.be.lessThan(waitTime + 1500);
                result.result.should.equal(successMessage);
                checkIterationsAndDelaysArray(3, [500, 1000, 2000]);
            });
    });

    itParam('should complete with less tries', params, (param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            maxChecks: 20,
            waitFirst: true,
        })
            .then((result: IBusyWaitResult<string>) => {
                result.backoff.iterations.should.equal(5);
                result.backoff.time.should.be.greaterThan(waitTime - 100);
                result.backoff.time.should.be.lessThan(waitTime + 100);
                result.result.should.equal(successMessage);
                checkIterationsArray(5, 500, true);
            });
    });

    itParam('should fail on max checks', params, (done: Done, param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            maxChecks: 2,
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                checkIterationsArray(2, 500, false);
                err.message.should.equal('Exceeded number of iterations to wait');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    itParam('should fail on max checks with custom error', params, (done: Done, param: IParam) => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            maxChecks: 2,
            failMsg: 'custom fail',
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                checkIterationsArray(2, 500, false);
                err.message.should.equal('custom fail');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    itParam('should fail on no maxChecks', params, (done: Done, param: IParam) => {
        return verifyMaxChecksError(done, param, undefined);
    });

    const verifyMaxChecksError = (done: Done, param: IParam, value?: number): Promise<void> => {
        return busywait(param.checkFn, {
            sleepTime: 500,
            maxChecks: value || 0,
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                err.message.should.equal('maxChecks must be a valid integer greater than 1');
                done();
            });
    };

    itParam('should fail on invalid maxChecks', params, (done: Done, param: IParam) => {
        return verifyMaxChecksError(done, param, -5);
    });

    itParam('should fail on no sleepTime', params, (done: Done, param: IParam) => {
        return verifySleepTimeError(done, param, undefined);
    });

    const verifySleepTimeError = (done: Done, param: IParam, value?: number): Promise<void> => {
        return busywait(param.checkFn, {
            sleepTime: value || 0,
            maxChecks: 500,
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                err.message.should.equal('sleepTime must be a valid integer greater than 1');
                done();
            });
    };

    itParam('should fail on invalid sleepTime', params, (done: Done, param: IParam) => {
        return verifySleepTimeError(done, param, -5);
    });

    itParam('should fail on empty checkFn', params, (done: Done, param: IParam) => {
        return verifyCheckFuncError(done, param, undefined);
    });

    itParam('should fail on non function checkFn', params, (done: Done, param: IParam) => {
        return verifyCheckFuncError(done, param, 'str');
    });

    const verifyCheckFuncError = (done: Done, param: IParam, value: any): Promise<void> => {
        return busywait(value, {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                err.message.should.equal('checkFn must be a function');
                done();
            });
    };

    itParam('should fail on NaN multiplier', params, (done: Done, param: IParam) => {
        return verifyMultiplierError(done, param, NaN);
    });

    itParam('should fail on invalid multiplier', params, (done: Done, param: IParam) => {
        return verifyMultiplierError(done, param, 0);
    });

    const verifyMultiplierError = (done: Done, param: IParam, value: number): Promise<void> => {
        return busywait(param.checkFn, {
            sleepTime: 100,
            multiplier: value,
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                err.message.should.equal('multiplier must be a valid integer greater than 1');
                done();
            });
    };

    itParam('should fail on NaN maxDelay', params, (done: Done, param: IParam) => {
        return verifyMaxDelayError(done, param, NaN);
    });

    itParam('should fail on invalid maxDelay', params, (done: Done, param: IParam) => {
        return verifyMaxDelayError(done, param, 0);
    });

    const verifyMaxDelayError = (done: Done, param: IParam, value: number): Promise<void> => {
        return busywait(param.checkFn, {
            sleepTime: 100,
            maxDelay: value,
        })
            .then(() => {
                done('busywait should fail');
            })
            .catch((err) => {
                err.message.should.equal('maxDelay must be a valid integer greater than 1');
                done();
            });
    };

});
