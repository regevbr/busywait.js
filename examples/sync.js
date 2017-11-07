const busywait = require('../index').sync;

const waitUntil = Date.now() + 2500;

function syncCheck(iteration) {
    console.log('running iteration', iteration);
    return Date.now() > waitUntil;
}

busywait(syncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (iterations) {
        console.log('finished after', iterations, 'iterations');
    });