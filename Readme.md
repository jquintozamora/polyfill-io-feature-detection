# Polyfill.io Features Detection in the browser
Feature detection in the browser before loading polyfill using services like polyfill.io

[![npm version](https://badge.fury.io/js/polyfill-io-feature-detection.svg)](https://badge.fury.io/js/polyfill-io-feature-detection)
[![NSP Status](https://nodesecurity.io/orgs/jquinto/projects/97ba8357-aca4-44b2-b17a-62e69e9d0bd2/badge)](https://nodesecurity.io/orgs/jquinto/projects/97ba8357-aca4-44b2-b17a-62e69e9d0bd2)
[![Code Climate](https://codeclimate.com/github/jquintozamora/polyfill-io-feature-detection/badges/gpa.svg)](https://codeclimate.com/github/jquintozamora/polyfill-io-feature-detection)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/jquintozamora/polyfill-io-feature-detection/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](Readme.md#want-to-contribute)

[![NPM](https://nodei.co/npm/polyfill-io-feature-detection.png?downloads=true)](https://nodei.co/npm/polyfill-io-feature-detection/)

<br />

## When should I use polyfill-io-feature-detection?
+ You want to isolate your app code from the browser supported features (applying polyfills)
+ You have to add polyfills to yout web application because requires support to different browsers and devices
+ You want to use polyfill service like [polyfill.io](https://polyfill.io/v2/docs) instead of including the polyfills in your bundle
+ You want (should) to [load polyfills only when needed](https://philipwalton.com/articles/loading-polyfills-only-when-needed)
+ You want to optimize the experience for users on modern browser
+ You want to save the polyfill service call when possible (using this polyfillLoader)

If you meet all these requirements, you probably will love this package. Because it allows you to load polyfills dynamically only when your browser really need it.


## Usage
```js
function App () {
    // your app code here
}

import { polyfillLoader } from 'polyfill-io-feature-detection';
polyfillLoader({
  "features": "Promise",
  "onCompleted": App
});
```

## Usage with React
```js
// index.jsx
import React from 'react';  
import {render} from 'react-dom';  
import App from './containers/App.jsx'; 

import { polyfillLoader } from 'polyfill-io-feature-detection';
// This function load polyfills only if needed. By default it uses polyfill.io
polyfillLoader({
  "features": "Promise,fetch",
  "onCompleted": main
});

// That function will be called after loading polyfills
function main() {
  render(
    <App />
    , document.getElementById('starter')
  );
}
```
More information: [Getting React to Load polyfills only when needed](https://blog.josequinto.com/2017/01/20/getting-react-to-load-polyfills-only-when-needed)

## Want to contribute?
Anyone can help make this project better

## License
(The MIT License)
Copyright (c) 2017 Jose Quinto (https://blog.josequinto.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
