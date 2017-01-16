'use strict';



// Check each feature in the featureString parameter (comma separated) 
//  and returns an array with all unsupported features for the current browser
exports.detectBrowserUnsupportedFeatures = function (featureStringCommaSeparated) {
    var arrayFeatures = featureStringCommaSeparated
                    .split(',')
                    .filter(x => x.length)
		            .map(x => x.replace(/[\*\/]/g, '')); // Eliminate XSS vuln
    var arrayUnsupportedFeatures = [];
    for (var i = 0; i < arrayFeatures.length; i++) {
        var supportedFeature = true;
        var fullFeature = arrayFeatures[i];
        // Get the feature and the container Object
        var featureString = fullFeature.substring(fullFeature.lastIndexOf('.') + 1);
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
    return arrayUnsupportedFeatures;
}

function getDescendantProp(obj, desc) {
    var arr = desc.split(".");
    if (arr.length > 0 && arr[0] !== "") {
        while (arr.length) {
            var name = arr.shift();
            if (name in obj) {
                obj = obj[name];
            } else {
                console.warn('[getDescendantProp] - ' + name + " property does not exists.");
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

function loadScriptAync(src, done) {
    var s = document.createElement('script');

    // Include a `ua` argument set to a supported browser to skip UA identification
    // (improves response time) and avoid being treated as unknown UA (which would
    // otherwise result in no polyfills, even with `always`, if UA is unknown)
    s.src = src + '&callback=' + done;
    s.async = true;
    document.head.appendChild(s);
}


exports.polyfillLoader = function (options) {
    var onCompleted = options.onCompleted;
    if (onCompleted === undefined) {
        return new Error("options.onCompleted function is required.");
    }
    var featureString = options.features || '';
    var features = this.detectBrowserUnsupportedFeatures(featureString);
    if (features.length === 0) {
        onCompleted();
    } else {
        var polyfillService = options.polyfillService || 'https://cdn.polyfill.io/v2/polyfill.min.js';

        // https://polyfill.io/v2/docs/examples#feature-detection
        var polyfillServiceUrl = polyfillService + '?features=' + features.join(',') + '&flags=gated,always';
        loadScriptAync(polyfillServiceUrl, onCompleted);
    }
}