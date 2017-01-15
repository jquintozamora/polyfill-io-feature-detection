
var expect = require('chai').expect;
var polyfillLoader = require('./../../index.js');

describe('Browser Feature detection Tests for IE 11', function() {

    before(function() {
        // runs before all tests in this block
        window = {};
        //window.Promise = function() {};
    });

    it('shoud accept multiple features', function() {

        var features = "Promise";
        expect(polyfillLoader.detectBrowserFeatures(features)).to.be.deep.eq(["Promise"]);
    });
});
