"use strict";

const busywait = require('../lib/index').async;
const Promise = require('bluebird');

const waitUntil = Date.now() + 2500;

function asyncCheck(iteration) {
    return new Promise(function (resolve, reject) {
        console.log('running iteration', iteration);
        if (Date.now() > waitUntil) {
            return resolve();
        } else {
            return reject();
        }
    });
}

busywait(asyncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (iterations) {
        console.log('finished after', iterations, 'iterations');
    });