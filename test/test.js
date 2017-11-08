"use strict";

const busywait = require('../lib/index');
const itParam = require('mocha-param').itParam;
const expect = require('expect.js');
const Promise = require('bluebird');

describe('busywait.js', function () {

    this.timeout(5000);

    let waitUntil;

    beforeEach(function () {
        waitUntil = Date.now() + 2500;
    });

    function syncCheck() {
        return Date.now() > waitUntil;
    }

    function asyncCheck() {
        return new Promise(function (resolve, reject) {
            if (Date.now() > waitUntil) {
                return resolve();
            } else {
                return reject();
            }
        });
    }

    const params = [
        {checkFn: syncCheck, method: busywait.sync},
        {checkFn: asyncCheck, method: busywait.async}
    ];

    itParam('should complete', params, function (param) {
        return param.method(param.checkFn, {
            sleepTime: 500,
            maxChecks: 20
        })
            .then(function (iterations) {
                expect(iterations).to.be(6);
            });
    });

    itParam('should complete with less tries', params, function (param) {
        return param.method(param.checkFn, {
            sleepTime: 500,
            maxChecks: 20,
            waitFirst: true
        })
            .then(function (iterations) {
                expect(iterations).to.be(5);
            });
    });

    itParam('should fail on max checks', params, function (done, param) {
        return param.method(param.checkFn, {
            sleepTime: 500,
            maxChecks: 2
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be("Exceeded number of iterations to wait");
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    itParam('should fail on max checks with custom error', params, function (done, param) {
        return param.method(param.checkFn, {
            sleepTime: 500,
            maxChecks: 2,
            failMsg: "custom fail"
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be("custom fail");
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    itParam('should fail on no maxChecks', params, function (done, param) {
        return param.method(param.checkFn, {
            sleepTime: 500,
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be('maxChecks must be a valid integer greater than 0');
                done();
            });
    });

    itParam('should fail on invalid maxChecks', params, function (done, param) {
        return param.method(param.checkFn, {
            maxChecks: -5,
            sleepTime: 500
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be('maxChecks must be a valid integer greater than 0');
                done();
            });
    });

    itParam('should fail on no sleepTime', params, function (done, param) {
        return param.method(param.checkFn, {
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be('sleepTime must be a valid integer greater than 0');
                done();
            });
    });

    itParam('should fail on invalid sleepTime', params, function (done, param) {
        return param.method(param.checkFn, {
            sleepTime: -5,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be('sleepTime must be a valid integer greater than 0');
                done();
            });
    });

    itParam('should fail on empty checkFn', params, function (done, param) {
        return param.method(undefined, {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be('checkFn must be a function');
                done();
            });
    });

    itParam('should fail on non function checkFn', params, function (done, param) {
        return param.method('str', {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail');
            })
            .catch(function (err) {
                expect(err).to.be('checkFn must be a function');
                done();
            });
    });

});