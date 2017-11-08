"use strict";

const busywait = require('../lib/index').sync;

const waitUntil = Date.now() + 2500;

function syncCheck(iteration) {
    console.log('running iteration', iteration);
    return Date.now() > waitUntil;
}

busywait(syncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (result) {
        console.log('finished after', result.iterations, 'iterations', 'with' +
            ' result', result.result);
    });