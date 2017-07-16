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
            if (contains(fullFeature, "Intl.~locale")) {
                supportedFeature = checkIntlLocale(window, fullFeature);
            } else {
                console.warn('Feature ' + fullFeature + ' can not be detected because it has not JavaScript API.');
            }
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
            }
        }
        // If the feature is not supported by the browser, then add it to polyfill it
        if (supportedFeature === false) {
            arrayUnsupportedFeatures.push(fullFeature);
        }
    }
    return arrayUnsupportedFeatures;
}

function checkIntlLocale(obj, feature) {
    var localeArray = feature.split("Intl.~locale");
    var locale = "";
    if (localeArray.length === 2) {
        var tempLocale = localeArray[1];
        if (tempLocale && tempLocale !== "") {
            locale = tempLocale.replace(".", "");

            if (!("Intl" in obj &&
                "Collator" in obj.Intl &&
                "supportedLocalesOf" in obj.Intl.Collator &&
                obj.Intl.Collator.supportedLocalesOf(locale).length === 1 &&
                "DateTimeFormat" in obj.Intl &&
                "supportedLocalesOf" in obj.Intl.DateTimeFormat &&
                obj.Intl.DateTimeFormat.supportedLocalesOf(locale).length === 1 &&
                "NumberFormat" in obj.Intl &&
                "supportedLocalesOf" in obj.Intl.NumberFormat &&
                obj.Intl.NumberFormat.supportedLocalesOf(locale).length === 1)) {
                return false;
            } else {
                return true;
            }
        } else {
            console.warn('Feature ' + feature + ' has wrong Intl.~locale.XX format. For example Intl.~locale.en-US');
        }
    } else {
        console.warn('Feature ' + feature + ' has wrong Intl.~locale format. For example Intl.~locale.en-US');
    }
    // if any error, returns false
    return false;
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
    var js = document.createElement('script');
    js.src = src;
    js.onload = function () {
        done(src);
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