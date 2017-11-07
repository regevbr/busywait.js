"use strict";

const Promise = require('bluebird');
const _ = require('underscore');

module.exports = {
    sync: sync,
    async: async
};

function sync(syncCheckFn, options) {
    return new Promise(function busyWait(resolve, reject) {
        const sleepTime = options.sleepTime || 0;
        const maxChecks = options.maxChecks || 0;
        if (maxChecks < 1) {
            return reject("maxChecks must be a valid integer greater than 0");
        }
        if (sleepTime < 1) {
            return reject("sleepTime must be a valid integer greater than 0");
        }
        if (!syncCheckFn || !_.isFunction(syncCheckFn)) {
            return reject("syncCheckFn must be a function");
        }
        let iteration = 0;
        const iterationCheck = function () {
            iteration++;
            if (syncCheckFn(iteration)) {
                return resolve(iteration);
            }
            if (iteration === maxChecks) {
                return reject("Exceeded number of iterations to wait");
            }
            setTimeout(iterationCheck, sleepTime);
        };
        setTimeout(iterationCheck, 0);
    });
}

function async(asyncCheckFn, options) {
    return new Promise(function busyWait(resolve, reject) {
        const sleepTime = options.sleepTime || 0;
        const maxChecks = options.maxChecks || 0;
        if (maxChecks < 1) {
            return reject("maxChecks must be a valid integer greater than 0");
        }
        if (sleepTime < 1) {
            return reject("sleepTime must be a valid integer greater than 0");
        }
        if (!asyncCheckFn || !_.isFunction(asyncCheckFn)) {
            return reject("asyncCheckFn must be a function");
        }
        let iteration = 0;
        const iterationCheck = function () {
            iteration++;
            asyncCheckFn(iteration)
                .then(function checkSuccess() {
                    return resolve(iteration);
                })
                .catch(function checkFailed() {
                    if (iteration === maxChecks) {
                        return reject("Exceeded number of iterations to wait");
                    }
                    setTimeout(iterationCheck, sleepTime);
                });
        };
        setTimeout(iterationCheck, 0);
    });
}
