"use strict";

const busywait = require('../index');
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

    it('sync should complete', function () {
        return busywait.sync(syncCheck, {
            sleepTime: 500,
            maxChecks: 20
        })
            .then(function (iterations) {
                expect(iterations).to.be(6);
            });
    });

    it('sync should fail on max checks', function (done) {
        busywait.sync(syncCheck, {
            sleepTime: 500,
            maxChecks: 2
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function () {
                done();
            })
    });

    it('sync should fail on no maxChecks', function (done) {
        busywait.sync(syncCheck, {
            sleepTime: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('maxChecks must be a valid integer greater than 0');
                done();
            })
    });

    it('sync should fail on invalid maxChecks', function (done) {
        busywait.sync(syncCheck, {
            maxChecks: -5,
            sleepTime: 500
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('maxChecks must be a valid integer greater than 0');
                done();
            })
    });

    it('sync should fail on no sleepTime', function (done) {
        busywait.sync(syncCheck, {
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('sleepTime must be a valid integer greater than 0');
                done();
            })
    });

    it('sync should fail on invalid sleepTime', function (done) {
        busywait.sync(syncCheck, {
            sleepTime: -5,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('sleepTime must be a valid integer greater than 0');
                done();
            })
    });

    it('sync should fail on empty syncCheckFn', function (done) {
        busywait.sync(undefined, {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('syncCheckFn must be a function');
                done();
            })
    });

    it('sync should fail on non function syncCheckFn', function (done) {
        busywait.sync('str', {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('syncCheckFn must be a function');
                done();
            })
    });

    it('async should complete', function () {
        return busywait.async(asyncCheck, {
            sleepTime: 500,
            maxChecks: 20
        })
            .then(function (iterations) {
                expect(iterations).to.be(6);
            });
    });

    it('async should fail on max checks', function (done) {
        busywait.async(asyncCheck, {
            sleepTime: 500,
            maxChecks: 2
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function () {
                done();
            })
    });

    it('async should fail on no maxChecks', function (done) {
        busywait.async(asyncCheck, {
            sleepTime: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('maxChecks must be a valid integer greater than 0');
                done();
            })
    });

    it('async should fail on invalid maxChecks', function (done) {
        busywait.async(asyncCheck, {
            maxChecks: -5,
            sleepTime: 500
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('maxChecks must be a valid integer greater than 0');
                done();
            })
    });

    it('saync should fail on no sleepTime', function (done) {
        busywait.async(asyncCheck, {
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('sleepTime must be a valid integer greater than 0');
                done();
            })
    });

    it('async should fail on invalid sleepTime', function (done) {
        busywait.async(asyncCheck, {
            sleepTime: -5,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('sleepTime must be a valid integer greater than 0');
                done();
            })
    });

    it('async should fail on empty asyncCheckFn', function (done) {
        busywait.async(undefined, {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('asyncCheckFn must be a function');
                done();
            })
    });

    it('async should fail on non function asyncCheckFn', function (done) {
        busywait.async('str', {
            sleepTime: 500,
            maxChecks: 500,
        })
            .then(function () {
                done('busywait should fail')
            })
            .catch(function (err) {
                expect(err).to.be('asyncCheckFn must be a function');
                done();
            })
    });

});