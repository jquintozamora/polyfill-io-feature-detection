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
    });

    
    it('should work', function () {
        var features = "Promise";

        function main() {
            console.log("main called!");
        }
        pf.polyfillLoader({
            "onCompleted": main,
            "features": "Promise,fetch,Object.is"
        });

        //expect().to.be.deep.eq(["Promise"]);
    });

});
