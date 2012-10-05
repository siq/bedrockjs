define([
    'vendor/underscore'
], function(_) {
    var areNotEquivDates = function(v1, v2) {
            if (v1 && v1.getDate && v2 && v2.getDate) {
                return v1.toString() !== v2.toString();
            }
            return true;
        },

        // if you're trying to operate on some nested prop like `foo.bar.baz`,
        // and you've got an object `{foo: {bar: {baz: 123}}}`, then this will
        // return the `foo.bar` object.
        _nestedObj = function(obj, propName) {
            var i, l, split = propName.split('.'), cur = obj;
            for (i = 0, l = split.length; i < l-1; i++) {
                cur = cur[split[i]];
                if (!_.isObject(cur)) {
                    return;
                }
            }
            return cur;
        },

        // if you've got an object `{foo: {bar: {baz: 123}}}`, this will return
        // some nested prop like `foo.bar.baz`
        _nested = function(obj, propName, newValue) {
            var i, l, cur, next = obj, split = propName.split('.');
            for (i = 0, l = split.length; i < l-1; i++) {
                cur = next;
                next = cur[split[i]];
                if (!_.isObject(next)) {
                    if (arguments.length > 2) {
                        cur[split[i]] = next = {};
                    } else {
                        // We would return undefined if
                        // while getting a prop the container of the required prop we are interested in is null.
                        return undefined;
                    }
                }
            }
            if (arguments.length > 2) {
                next[split[split.length-1]] = newValue;
            } else {
                return next[split[split.length-1]];
            }
        };

    // # asSettable
    //
    // functionally mixin standard instance.get() and instance.set() semantics
    //
    // also provides a .prop() method that's similar to the jquery function
    //
    // ## configuration options
    //
    // ### `propName`
    //
    // all properties are stored on `this[options.propName]`. this defaults to
    // `_settableProperties`, so by default calling:
    //
    //     instance.set({foo: 'bar'});
    //
    // would result in `instance._settableProperties.foo` being set to 'bar'
    //
    // IF, however, you wish the properties to be set on someting else, say
    // for example `this.options`, then call this with the `propName` set to
    // 'options':
    //
    //     var MyClass = MySuperClass.extend({
    //         // ... etc ...
    //     });
    //     asSettable.call(MyClass.prototype, {propName: 'options'});
    //
    // if the options define `propName` as `null` (not `undefined`), then the
    // properties will be set directly on `this`, so for example:
    //
    //     var MyClass = MySuperClass.extend({
    //         // ... etc ...
    //     });
    //     asSettable.call(MyClass.prototype, {propName: null});
    //
    //     var instance = MyClass().set({foo: 'bar'});
    //     // instance.foo === bar
    //
    // of course, you shouldn't be accessing that object directly anyway,
    // you should use `.set()`, `.get()`, and `.prop()`.
    //
    // ### `eventName`
    //
    // if you want to trigger an event when a property changes, override the
    // `eventName` option at mixin time.
    //
    // if you never want an event triggered, just don't define the option.
    //
    // ### `onChange`
    //
    // if this option is a function, it will be called when a property is
    // changed. if it is a string, then the corresponding method will be called
    // on the class's prototype (in the context of the instance of course):
    //
    //     var MyClass = MySuperClass.extend({
    //         onChange: function(changed, opts) {
    //
    //             // 'this' refers to the instance of `MyClass`
    //             this.update(changed);
    //
    //             // `opts` is the opts used in the `set` call
    //             if (!opts.silent) {
    //                 this.trigger('optionsChange', changed, opts);
    //             }
    //     }
    //     asSettable.call(MyClass.prototype, {onChange: 'onChange'});
    //
    //     var MyOtherClass = MySuperClass.extend({
    //         // ... etc ...
    //     });
    //     asSettable.call(MyOtherClass.prototype, {
    //         onChange: function() {
    //             /*...*/
    //         }
    //     });
    //
    // ### 'areEqual'
    //
    // if you need to change the comparison function used to determine if two
    // different values are equal, use the `areEqual` property.
    //
    return function(options) {
        // we use the _settable prop as a proxy object so that when you mixin
        // to a class, then mixin again to a child class, you retain the
        // non-overriden options of the parent class' mixin.
        var _settable = _.extend(this._settable = this._settable || {}, options),
            p = _settable.propName,
            eventName = _settable.eventName,
            onChange = _settable.onChange,
            areEqual = _settable.areEqual,
            handleChanges = function(changes, opts) {
                if (!opts.silent) {
                    if (this.trigger && eventName) {
                        this.trigger(eventName, changes);
                    }
                    if (onChange) {
                        if (_.isString(onChange)) {
                            this[onChange].call(this, changes, opts);
                        } else {
                            onChange.call(this, changes, opts);
                        }
                    }
                }
            };

        if (typeof p === 'undefined') {
            p = _settable.propName = '_settableProperties';
        }

        this.del = function(key, opts) {
            var props = p === null? this : this[p], k = key, changes = {};
            opts = opts || {};
            if (!opts || !opts.notNested) {
                props = _nestedObj(props, k);
                if (!props) {
                    return this;
                }
                k = k.substring(k.lastIndexOf('.')+1, k.length);
            }
            if (props.hasOwnProperty(k)) {
                _nested(this._settablePreviousProperties, key, props[k]);
                delete props[k];
                changes[key] = true;
                handleChanges.call(this, changes, opts);
            }
            return this;
        };

        this.get = function(key, opts) {
            var obj = p === null? this : this[p];
            return opts && opts.notNested? obj[key] : _nested(obj, key);
        };

        this.has = function(key, opts) {
            var props = p === null? this : this[p];
            if (!opts || !opts.notNested) {
                props = _nestedObj(props, key);
                if (!props) {
                    return false;
                }
                key = key.substring(key.lastIndexOf('.')+1, key.length);
            }
            return props.hasOwnProperty(key);
        };

        // return the previous value of a property
        // return all previous properties if 'key == null'
        this.previous = function(key) {
            if (key == null) {
                return (this._settablePreviousProperties || {});
            } else {
                return (this._settablePreviousProperties || {})[key];
            }
        };

        // this is either a 'set' or a 'get':
        //
        //     instance.prop('stringValueForFirstArg')  // => get
        //     instance.prop(/* any other args */)      // => set
        //
        this.prop = function(/* arguments */) {
            var isGet = arguments.length === 1 && _.isString(arguments[0]);
            return this[isGet? 'get' : 'set']
                .apply(this, arguments);
        };

        // this can be called in any of the following ways:
        //
        //     instance.set({/* props */});
        //     instance.set({/* props */}, {/* opts */});
        //     instance.set('foo', bar);
        //     instance.set('foo', bar, {/* opts */});
        //
        // if `opts.silent == true`, then don't trigger a change event
        // (regardless of whether something changed.
        //
        // by default, this function will expand nested properties, i.e.:
        //
        //     instance.set('foo.bar', 'baz');
        //     // -> instance._settableProperties.foo.bar === 'baz'
        //
        // to disable this, set `opts.notNested` to true
        //
        this.set = function(/* arguments */) {
            var prop, value, newValue, changed, changing, valuesArentEqual,
                newProps = {}, opts = {}, changes = {},
                props = p === null? this : this[p],
                prevProps = this._settablePreviousProperties;

            if (!props) {
                props = this[p] = {};
            }

            if (!prevProps) {
                prevProps = this._settablePreviousProperties = {};
            }

            if (arguments.length === 1) {
                newProps = arguments[0];
            } else if (arguments.length === 2) {
                if (_.isString(arguments[0])) {
                    newProps[arguments[0]] = arguments[1];
                } else {
                    newProps = arguments[0];
                    opts = arguments[1];
                }
            } else {
                newProps[arguments[0]] = arguments[1];
                opts = arguments[2];
            }

            // changing = this._settableChanging;
            // this._settableChanging = true;

            for (prop in newProps) {
                if (newProps.hasOwnProperty(prop)) {
                    value = props[prop];
                    newValue = newProps[prop];

                    valuesArentEqual = areEqual?
                        !areEqual(value, newValue) :
                        newValue !== value && areNotEquivDates(value, newValue);

                    if (valuesArentEqual ||

                        // force update to be sent even if there's no changes
                        opts.update ||

                        // if the prop doesnt exist, but is being set to undef
                        // (necessary so `.has()` behaves correctly)
                        !props.hasOwnProperty(prop)) {

                        changes[prop] = changed = true;
                        if (opts.notNested) {
                            prevProps[prop] = value;
                            props[prop] = newValue;
                        } else {
                            _nested(prevProps, prop, value);
                            _nested(props, prop, newValue);
                        }
                    }
                }
            }

            // if (!changing) {
                if (changed) {
                    handleChanges.call(this, changes, opts);
                }
                // this._settableChanging = false;
            // }

            return this;
        };
    };
});
