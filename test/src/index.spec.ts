import {busywait, CheckFn, IBusyWaitResult} from '../../dist';
// @ts-ignore
import {itParam} from 'mocha-param';

const successMessage = 'success';

interface IParam {
    checkFn: CheckFn<string>;
}

type Done = (error?: any) => void;

describe('busywait.js', function() {

    this.timeout(5000);

    const waitTime = 2500;
    let waitUntil: number;
    let iterationsArray: number[];

    beforeEach(() => {
        iterationsArray = [];
        waitUntil = Date.now() + waitTime;
    });

    const checkIterationsArray = (iterations: number) => {
        iterationsArray.length.should.equal(iterations);
        for (let i = 0; i < iterations; i++) {
            iterationsArray[i].should.equal(i + 1);
        }
    };

    const syncCheck = (iteration: number): string => {
        iterationsArray.push(iteration);
        if (Date.now() > waitUntil) {
            return successMessage;
        }
        throw new Error('not the time yet');
    };

    const asyncCheck = (iteration: number): Promise<string> => {
        iterationsArray.push(iteration);
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
                checkIterationsArray(6);
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
                checkIterationsArray(5);
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
                checkIterationsArray(2);
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
                checkIterationsArray(2);
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

});
