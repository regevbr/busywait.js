"use strict";

module.exports = {
    sync: _sync,
    async: _async
};

function _sync(syncCheckFn, options) {
    return _busywait(syncCheckFn, options, true);
}

function _async(asyncCheckFn, options) {
    return _busywait(asyncCheckFn, options, false);
}

function _busywait(checkFn, _options, wrapCheckFun) {
    const options = Object.assign({}, _options);
    return _checkArgs(checkFn, options)
        .then(function () {
            return _eventLoop(wrapCheckFun ? _wrapSyncMethod(checkFn) : checkFn, options);
        });
}

function _checkArgs(checkFn, options) {
    if (isNaN(options.maxChecks) || options.maxChecks < 1) {
        return Promise.reject("maxChecks must be a valid integer greater than 0");
    }
    if (isNaN(options.sleepTime) || options.sleepTime < 1) {
        return Promise.reject("sleepTime must be a valid integer greater than 0");
    }
    if (!checkFn || !_isFunction(checkFn)) {
        return Promise.reject("checkFn must be a function");
    }
    return Promise.resolve();
}

function _wrapSyncMethod(checkFn) {
    return function (iteration) {
        return new Promise((resolve, reject) => {
            return checkFn(iteration) ? resolve(true) : reject()
        });
    };
}

function _eventLoop(asyncCheckFn, options) {
    return new Promise((resolve, reject) => {
        let iteration = 0;
        const iterationCheck = function () {
            iteration++;
            asyncCheckFn(iteration)
                .then(function checkSuccess(result) {
                    return resolve({
                        iterations: iteration,
                        result: result
                    });
                })
                .catch(function checkFailed() {
                    if (iteration === options.maxChecks) {
                        return reject(options.failMsg || "Exceeded number of iterations to wait");
                    }
                    setTimeout(iterationCheck, options.sleepTime);
                });
        };
        setTimeout(iterationCheck, options.waitFirst ? options.sleepTime : 0);
    });
}

function _isFunction(obj) {
    return toString.call(obj) === '[object Function]';
}