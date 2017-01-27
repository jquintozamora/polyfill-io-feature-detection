/*
    Unit Tests for polyfillLoader function
*/

'use strict';
var expect = require('chai').expect;
var pf = require('./../../index.js');

describe('Polyfill Loader Tests for IE 11', function () {

    before(function () {
        // runs before all tests in this block
        // Import IE11 window configs.
        window = require('./../utils/IE11.Config').configs();

        global.document = {};
        document.createElement = function (tag) { return { src: "", onload: function () { }, onerror: function () { } }; };
        document.head = {};
        document.head.appendChild = function (obj) {
            setTimeout(function () {
                if (obj.src.indexOf("https://error") > -1) {
                    obj.onerror();
                } else {
                    if (obj.onload) {
                        obj.onload();
                    } else {
                        obj.onerror();
                    }
                }
            }, 500);
        };
    });


    it('should call main with the polyfill url as a parameter', function (done) {
        var features = "Promise,fetch,Object.is";
        function main(data) {
            expect(data).to.eq("https://cdn.polyfill.io/v2/polyfill.min.js?features=Promise,fetch,Object.is&flags=gated,always");
            // this test is done, go to the next one
            done();
        }
        pf.polyfillLoader({
            "onCompleted": main,
            "features": features
        });
    });


    it('should call main with the polyfill url as a parameter filtered by only not supported features', function (done) {
        var features = "Promise,Date.now";
        function main(data) {
            expect(data).to.eq("https://cdn.polyfill.io/v2/polyfill.min.js?features=Promise&flags=gated,always");
            // this test is done, go to the next one
            done();
        }
        pf.polyfillLoader({
            "onCompleted": main,
            "features": features
        });
    });

    it('should call main with no parameters as all the features are supported by the browser', function (done) {
        var features = "Array.prototype.filter,Date.now";
        function main(data) {
            expect(data).to.eq(undefined);
            // this test is done, go to the next one
            done();
        }
        pf.polyfillLoader({
            "onCompleted": main,
            "features": features
        });
    });

    it('should call my custom service if configured as parameter polyfillService', function (done) {
        var features = "Promise";
        function main(data) {
            expect(data).to.eq('https://myservice?features=Promise&flags=gated,always');
            // this test is done, go to the next one
            done();
        }
        pf.polyfillLoader({
            "onCompleted": main,
            "features": features,
            "polyfillService": "https://myservice"
        });
    });

    it('should call main with error parameter when failed to load the script', function (done) {
        var features = "Promise";
        function main(data) {
            expect(data.toString()).to.eq((new Error('Failed to load script https://error?features=Promise&flags=gated,always')).toString());
            // this test is done, go to the next one
            done();
        }
        pf.polyfillLoader({
            "onCompleted": main,
            "features": features,
            "polyfillService": "https://error"
        });
    });
});
