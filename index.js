
// Loading polyfill only when needed: https://philipwalton.com/articles/loading-polyfills-only-when-needed/

//https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList,URL

// Feature detection: 
//  https://addyosmani.com/blog/writing-polyfills/ 
//  https://hacks.mozilla.org/2014/11/an-easier-way-of-using-polyfills/
//  window.Element.prototype.hasOwnProperty('classList')
//  if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

// "URL" in window
// "requestAnimationFrame" in window
// "classList" in window.Element.prototype
// "Promise" in window

// Dynamic polyfill
//   https://github.com/PascalAOMS/dynamic-polyfill

// 

// Support: 
//  http://caniuse.com/#search=lastIndexOf - Not supported IE8


// Good programming with featureString: https://github.com/Financial-Times/polyfill-service/blob/master/service/PolyfillSet.js


// Testing with Mocha and Proclaim
//  https://github.com/Financial-Times/polyfill-service/blob/master/test/node/lib/test_aliases.js



exports.default = function (options) {

    var onCompleted = options.onCompleted;
    if (onCompleted === undefined) {
        return new Error("options.onCompleted function is required.");
    }

    var features = options.features || '';
    if (detectBrowserFeatures(features)) {
        onCompleted();
    } else {
        var polyfillService = options.polyfillService || 'https://cdn.polyfill.io/v2/polyfill.min.js?features=';
        var polyfillServiceUrl = polyfillService;
        if (features === '') {
            polyfillServiceUrl += '?features=' + features;
        }
        loadScript(polyfillServiceUrl, onCompleted);
    }
}

// Check each feature in the featureString parameter (comma separated) 
//  and returns an array with all unsupported features for the current browser
exports.detectBrowserFeatures = function (featureString) {

    var arrayFeatures = featureString.split(',');
    var arrayUnsupportedFeatures = [];
    for (var i = 0; i < arrayFeatures.length; i++) {
        var supportedFeature = true;
        var item = arrayFeatures[i];
        // Get the feature and the container Object
        var featureString = item.substring(item.lastIndexOf('.') + 1);
        var objectString = item.substring(0, item.lastIndexOf('.'));
        var object = getDescendantProp(window, objectString);
        if (object !== undefined) {
            if ((object.hasOwnProperty(featureString)) === false) {
                supportedFeature = false;
            }
        } else {
            supportedFeature = false;
        }
        // If the feature is not supported by the browser, then add it to polyfill it
        if (supportedFeature === false) {
            arrayUnsupportedFeatures.push(featureString);
        }
    }
    return arrayUnsupportedFeatures;
}

function getDescendantProp(obj, desc) {
    //console.log("obj: " + obj + ", desc: " + desc);
    var arr = desc.split(".");
    if (arr.lenght > 0 && arr.length[0] !== "") {
        while (arr.length) {
            var name = arr.shift();
            if (name in obj) {
                obj = obj[name];
            } else {
                console.warn('[detectBrowserFeatures] - ' + obj + ' has not ' + name + " property.");
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
