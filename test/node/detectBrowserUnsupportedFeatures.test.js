/*
    Unit Tests for detectBrowserUnsupportedFeatures function
*/

'use strict';
var expect = require('chai').expect;
var polyfillLoader = require('./../../index.js');

describe('Browser Feature detection Tests for IE 11', function () {
    var warn, warnOutput = '';

    before(function () {
        // runs before all tests in this block
        // Import IE11 window configs.
        window = require('./../utils/IE11.Config').configs();
    });

    // mocking or stubbing console is not needed, we could use this: https://github.com/mochajs/mocha/wiki/Mess-with-globals
    // restore console.warn 
    var cleanup = function () {
        console.warn = warn;
        warnOutput = "";
    };
    beforeEach(function () {
        // store these functions to restore later because we are messing with them
        warn = console.warn;
        // our stub will concatenate any output to a string
        console.warn = function (s) {
            warnOutput += s;
        };
    });
    // restore after each test
    afterEach(cleanup);

    it('should detect Promise as unsupported feature', function () {
        var features = "Promise";
        expect(polyfillLoader.detectBrowserUnsupportedFeatures(features)).to.be.deep.eq(["Promise"]);
    });

    it('should detect Array.isArray as supported feature', function () {
        var features = "Array.isArray";
        expect(polyfillLoader.detectBrowserUnsupportedFeatures(features)).to.be.deep.eq([]);
    });

    it('should strip out more than one supported features', function () {
        var features = "Array.isArray,Date.now,Element.prototype.dataset,Object.defineProperties";
        expect(polyfillLoader.detectBrowserUnsupportedFeatures(features)).to.be.deep.eq([]);
    });

    it('should return more than one unsupported features', function () {
        var features = "Array.from,Array.prototype.fill,AudioContext,Promise,Element.prototype.append,Math.trunc,Object.is,Symbol.iterator";
        expect(polyfillLoader.detectBrowserUnsupportedFeatures(features)).to.be.deep.eq(["Array.from",
            "Array.prototype.fill",
            "AudioContext",
            "Promise",
            "Element.prototype.append",
            "Math.trunc",
            "Object.is",
            "Symbol.iterator"]);
        try {
            expect(warnOutput).to.equal('[getDescendantProp] - Symbol property does not exists.');
        }
        catch (e) {
            cleanup();
            throw e;
        }
    });

    it('should warn when not object exists getting the descendants of a complex object', function () {
        var features = "Symbol.iterator";
        expect(polyfillLoader.detectBrowserUnsupportedFeatures(features)).to.be.deep.eq(["Symbol.iterator"]);
        try {
            expect(warnOutput).to.equal('[getDescendantProp] - Symbol property does not exists.');
        }
        catch (e) {
            cleanup();
            throw e;
        }
    });
});
