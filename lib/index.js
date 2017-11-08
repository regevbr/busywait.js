"use strict";

const Promise = require('bluebird');
const _ = require('underscore');

module.exports = {
    sync: sync,
    async: async
};

function sync(syncCheckFn, options) {
    return new Promise(function busyWait(resolve, reject) {
        const error = _checkArgs(syncCheckFn, options);
        if (error) {
            return reject(error);
        }
        let iteration = 0;
        const iterationCheck = function () {
            iteration++;
            if (syncCheckFn(iteration)) {
                return resolve(iteration);
            }
            if (iteration === options.maxChecks) {
                return reject(options.failMsg || "Exceeded number of iterations to wait");
            }
            setTimeout(iterationCheck, options.sleepTime);
        };
        setTimeout(iterationCheck, 0);
    });
}

function async(asyncCheckFn, options) {
    return new Promise(function busyWait(resolve, reject) {
        const error = _checkArgs(asyncCheckFn, options);
        if (error) {
            return reject(error);
        }
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
        setTimeout(iterationCheck, 0);
    });
}

function _checkArgs(checkFn, options) {
    if (isNaN(options.maxChecks) || options.maxChecks < 1) {
        return "maxChecks must be a valid integer greater than 0";
    }
    if (isNaN(options.sleepTime) || options.sleepTime < 1) {
        return "sleepTime must be a valid integer greater than 0";
    }
    if (!checkFn || !_.isFunction(checkFn)) {
        return "checkFn must be a function";
    }
}