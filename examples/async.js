"use strict";

const busywait = require('../lib/index').async;

const waitUntil = Date.now() + 2500;

function asyncCheck(iteration) {
    return new Promise(function (resolve, reject) {
        console.log('running iteration', iteration);
        if (Date.now() > waitUntil) {
            return resolve(true);
        } else {
            return reject();
        }
    });
}

busywait(asyncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (result) {
        console.log('finished after', result.iterations, 'iterations', 'with' +
            ' result', result.result);
    });