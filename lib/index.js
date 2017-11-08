"use strict";

const _ = require('underscore');

module.exports = {
    sync: sync,
    async: async
};

function sync(syncCheckFn, options) {
    return _checkArgs(syncCheckFn, options)
        .then(function () {
            function asyncCheckFn(iteration) {
                return new Promise(function (resolve, reject) {
                    if (syncCheckFn(iteration)) {
                        return resolve();
                    } else {
                        return reject();
                    }
                });
            }

            return async(asyncCheckFn, options);
        });
}

function async(asyncCheckFn, options) {
    return _checkArgs(asyncCheckFn, options)
        .then(function () {
            return _eventLoop(asyncCheckFn, options);
        });
}

function _eventLoop(asyncCheckFn, options) {
    return new Promise(function busyWait(resolve, reject) {
        let iteration = 0;
        const iterationCheck = function () {
            iteration++;
            asyncCheckFn(iteration)
                .then(function checkSuccess() {
                    return resolve(iteration);
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

function _checkArgs(checkFn, options) {
    if (isNaN(options.maxChecks) || options.maxChecks < 1) {
        return Promise.reject("maxChecks must be a valid integer greater than 0");
    }
    if (isNaN(options.sleepTime) || options.sleepTime < 1) {
        return Promise.reject("sleepTime must be a valid integer greater than 0");
    }
    if (!checkFn || !_.isFunction(checkFn)) {
        return Promise.reject("checkFn must be a function");
    }
    return Promise.resolve();
}