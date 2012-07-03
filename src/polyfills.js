// es5 polyfills
define([], function() {
    var ignored = function() {},
        ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002' +
             '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F' +
             '\u3000\u2028\u2029\uFEFF';

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
            if (_toString(fun) != "[object Function]") {
                throw new TypeError(fun + " is not a function");
            }

            for (var i = 0; i < length; i++) {
                if (i in self)
                    result[i] = fun.call(thisp, self[i], i, self);
            }
            return result;
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
