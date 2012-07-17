// es5 polyfills
//
// mostly ripped off directly from here:
//
//    https://github.com/kriskowal/es5-shim/
//
// license for the shims:
//
//    Copyright 2009, 2010 Kristopher Michael Kowal. All rights reserved.
//    Permission is hereby granted, free of charge, to any person obtaining a copy
//    of this software and associated documentation files (the "Software"), to
//    deal in the Software without restriction, including without limitation the
//    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//    sell copies of the Software, and to permit persons to whom the Software is
//    furnished to do so, subject to the following conditions:
//    
//    The above copyright notice and this permission notice shall be included in
//    all copies or substantial portions of the Software.
//    
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
//    IN THE SOFTWARE.
//
define([], function() {
    var ignored = function() {},
        ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002' +
             '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F' +
             '\u3000\u2028\u2029\uFEFF',
        call = Function.prototype.call,
        prototypeOfArray = Array.prototype,
        prototypeOfObject = Object.prototype,
        slice = prototypeOfArray.slice,
        // Having a toString local variable name breaks in Opera so use _toString.
        _toString = prototypeOfObject.toString,
        prepareString = "a"[0] != "a",
        toObject = function (o) {
            if (o == null) { // this matches both null and undefined
                throw new TypeError("can't convert "+o+" to object");
            }
            // If the implementation doesn't support by-index access of
            // string characters (ex. IE < 9), split the string
            if (prepareString && typeof o == "string" && o) {
                return o.split("");
            }
            return Object(o);
        };



    if (!String.prototype.trim || ws.trim()) {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        ws = "[" + ws + "]";
        var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
            trimEndRegexp = new RegExp(ws + ws + "*$");
        String.prototype.trim = function trim() {
            if (this === undefined || this === null) {
                throw new TypeError("can't convert "+this+" to object");
            }
            return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
        };
    }

    // ES5 15.4.4.18
    // http://es5.github.com/#x15.4.4.18
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function forEach(fun /*, thisp*/) {
            var self = toObject(this),
                thisp = arguments[1],
                i = -1,
                length = self.length >>> 0;

            // If no callback function or if callback is not a callable function
            if (_toString.call(fun) != "[object Function]") {
                throw new TypeError(); // TODO message
            }

            while (++i < length) {
                if (i in self) {
                    // Invoke the callback function with call, passing arguments:
                    // context, property value, property key, thisArg object context
                    fun.call(thisp, self[i], i, self);
                }
            }
        };
    }

    // ES5 15.4.4.19
    // http://es5.github.com/#x15.4.4.19
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
    if (!Array.prototype.map) {
        Array.prototype.map = function map(fun /*, thisp*/) {
            var self = toObject(this),
                length = self.length >>> 0,
                result = Array(length),
                thisp = arguments[1];

            // If no callback function or if callback is not a callable function
            if (_toString.call(fun) != "[object Function]") {
                throw new TypeError(fun + " is not a function");
            }

            for (var i = 0; i < length; i++) {
                if (i in self)
                    result[i] = fun.call(thisp, self[i], i, self);
            }
            return result;
        };
    }

    if (!window.isNaN) {
        // from https://github.com/documentcloud/underscore/blob/master/underscore.js
        window.isNaN = function(value) {
            // `NaN` is the only value for which `===` is not reflexive
            return value === value;
        };
    }

    // not technically a polyfill, but this prevents bugs and makes life better
    // for everyone
    if (!window.console) {
        window.console = {
            assert: ignored,
            debug: ignored,
            error: ignored,
            exception: ignored,
            info: ignored,
            log: ignored,
            warn: ignored
        };
    }

    // and this is not a polyfill at all, and should not be in our codebase,
    // but was added out of a lack of discipline.
    if (typeof Array.prototype.remove === 'undefined') {
        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
    }

});
