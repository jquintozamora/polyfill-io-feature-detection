'use strict';

if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    'use strict';
    if (!((typeof func === 'Function' || typeof func === 'function') && this))
      throw new TypeError();

    var len = this.length >>> 0,
      res = new Array(len), // preallocate array
      t = this, c = 0, i = -1;
    if (thisArg === undefined) {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          if (func(t[i], i, t)) {
            res[c++] = t[i];
          }
        }
      }
    }
    else {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          if (func.call(thisArg, t[i], i, t)) {
            res[c++] = t[i];
          }
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function (callback/*, thisArg*/) {

    var T, A, k;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

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
  var finished = false

  function handleLoad() {
    if (!finished) {
      finished = true
      done(src)
    }
  }

  function handleReadyStateChange() {
    if (!finished) {
      if (script.readyState === 'complete') {
        handleLoad()
      }
    }
  }

  function handleError() {
    if (!finished) {
      finished = true
      done(new Error('Failed to load script ' + src))
    }
  }
  var script = document.createElement('script')
  script.onload = handleLoad
  script.type = 'text/javascript'
  script.onreadystatechange = handleReadyStateChange
  script.onerror = handleError
  script.src = src
  document.head.appendChild(script)
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