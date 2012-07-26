define([
    './polyfills'
], function() {
    var slice = Array.prototype.slice;

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

        
    Class.prop = function(object, name, value) {
        var context = object, nesting = name.split("."), index, item;
        for(index = 0; index < nesting.length-1; ++index) {
            item = nesting[index];
            if (!context[item]) {
                if(!value) {
                    return;
                } else {
                    context[item] = {};
                }
            }
            context = context[item];
        }
        if(value) {
            context[nesting[nesting.length-1]] = value;
        }
        return context[nesting[nesting.length-1]];
    };
    
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

        // Create getter / setter methods to emulate string based nested access
        prototype.prop = function(name, value) {
            return Class.prop(this, name, value);
        };
        

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
