'use strict';

// Check each feature in the featureString parameter (comma separated) 
//  and returns an array with all unsupported features for the current browser
var detectBrowserUnsupportedFeatures = function (featureStringCommaSeparated) {
    var arrayFeatures = featureStringCommaSeparated
        .split(',')
        .filter(function (x) { return x.length })
        .map(function (x) { return x.replace(/[\*\/]/g, '') }); // Eliminate XSS vuln
    var arrayUnsupportedFeatures = [];
    for (var i = 0; i < arrayFeatures.length; i++) {
        var supportedFeature = true;
        var fullFeature = arrayFeatures[i];
        if (contains(fullFeature, "~")) {
            console.warn('Feature ' + fullFeature + ' can not be detected because it has not JavaScript API.');
        } else {
            // Get the feature and the container Object
            var featureString = fullFeature.substring(fullFeature.lastIndexOf('.') + 1);
            if (contains(featureString, "@@")) {
                console.warn('Feature ' + featureString + ' can not be detected because it depends on Symbol.');
            } else {
                var objectString = fullFeature.substring(0, fullFeature.lastIndexOf('.'));
                var object = getDescendantProp(window, objectString);
                if (object !== undefined) {
                    //if ((object.hasOwnProperty(featureString)) === false) {
                    if ((featureString in object) === false) {
                        supportedFeature = false;
                    }
                } else {
                    supportedFeature = false;
                }
                // If the feature is not supported by the browser, then add it to polyfill it
                if (supportedFeature === false) {
                    arrayUnsupportedFeatures.push(fullFeature);
                }
            }
        }
    }
    return arrayUnsupportedFeatures;
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/includes
function contains(origin, search, start) {
    'use strict';
    if (typeof start !== 'number') {
        start = 0;
    }
    if (start + search.length > origin.length) {
        return false;
    } else {
        return origin.indexOf(search, start) !== -1;
    }
}

function getDescendantProp(obj, desc) {
    var arr = desc.split(".");
    if (arr.length > 0 && arr[0] !== "") {
        while (arr.length) {
            var name = arr.shift();
            if (name in obj) {
                obj = obj[name];
            } else {
                console.warn('[getDescendantProp] - ' + name + ' property does not exists.');
                return undefined;
            }
        }
    }
    return obj;
}

function loadScript(src, done) {
    let js = document.createElement('script');
    js.src = src;
    js.onload = function () {
        done();
    };
    js.onerror = function () {
        done(new Error('Failed to load script ' + src));
    };
    document.head.appendChild(js);
}

var polyfillLoader = function (options) {
    var onCompleted = options.onCompleted;
    if (onCompleted === undefined) {
        return new Error("options.onCompleted function is required.");
    }
    var featureString = options.features || '';
    var features = detectBrowserUnsupportedFeatures(featureString);
    if (features.length === 0) {
        onCompleted();
    } else {
        var polyfillService = options.polyfillService || 'https://cdn.polyfill.io/v2/polyfill.min.js';
        // https://polyfill.io/v2/docs/examples#feature-detection
        var polyfillServiceUrl = polyfillService + '?features=' + features.join(',') + '&flags=gated,always';
        loadScript(polyfillServiceUrl, onCompleted);
    }
}

module.exports = {
    polyfillLoader: polyfillLoader,
    detectBrowserUnsupportedFeatures: detectBrowserUnsupportedFeatures
};