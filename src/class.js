define([], function() {
    var slice = Array.prototype.slice;

    if (typeof Array.prototype.remove === 'undefined') {
        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
    }

    var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
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

    if (!window.console) {
        var ignored = function() {};
        window.console = {assert: ignored, debug: ignored, error: ignored, exception: ignored,
            info: ignored, log: ignored, warn: ignored};
    }

    var super_expr = /.*/, inheriting = false;
    if(/xyz/.test(function() {xyz;} )) {
        super_expr = /\b_super\b/;
    }

    var inject = function(base, prototype, namespace) {
        var name, value;
        for(name in namespace) {
            value = namespace[name];
            if(typeof value === 'function' && typeof base[name] === 'function' && super_expr.test(value)) {
                value = (function(name, fn) {
                    return function() {
                        var current_super = this._super, return_value;
                        this._super = base[name];
                        return_value = fn.apply(this, arguments);
                        this._super = current_super;
                        return return_value;
                    };
                })(name, value);
            }
            if(value !== undefined) {
                // if(name === '__mixin__') {
                //     value(base, prototype, namespace);
                if(name === 'afterInit') {
                    if(!prototype.afterInit) {
                        prototype.afterInit = [];
                    }
                    prototype.afterInit.push(value);
                } else if(name !== '__mixin__') {
                    prototype[name] = value;
                }
            }
        }
    };

    var Class = function() {};
    var extend = function(namespace, options) {
        var i, mixins, mixin, base = this.prototype;
        if(!options) {
            options = {};
        }
        if(options.mixins) {
            mixins = options.mixins;
        }
            
        inheriting = true;
        var prototype = new this();
        inheriting = false;

        if(mixins) {
            for(i = mixins.length - 1; i >= 0; i--) {
                inject(base, prototype, mixins[i]);
            }
        }
        inject(base, prototype, namespace);

        var constructor = function() {
            if(this instanceof constructor) {
                if(!inheriting) {
                    if(typeof this.init === 'function') {
                        var candidate = arguments[0];
                        if(candidate && candidate.__args__) {
                            this.init.apply(this, arguments[0].__args__);
                        } else {
                            this.init.apply(this, arguments);
                        }
                    }
                    if (this.afterInit) {
                        for (var i = 0, l = this.afterInit.length; i < l; i++) {
                            this.afterInit[i].apply(this, []);
                        }
                    }
                }
            } else {
                return new constructor({__args__: arguments});
            }
        };

        constructor.prototype = prototype;
        constructor.constructor = constructor;
        constructor.extend = extend;
        
        if(prototype.__new__) {
            prototype.__new__(constructor, this, prototype, mixins);
        }
        if(mixins) {
            for(i = mixins.length - 1; i >= 0; i--) {
                mixin = mixins[i];
                if (mixin.__mixin__) {
                    mixin.__mixin__.call(this, base, prototype, mixin);
                }
            }
        }
        return constructor;
    };
    Class.extend = extend;

    return Class;
});
