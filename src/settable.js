define([
    'vendor/underscore',
    './class'
], function(_, Class) {
    var _nested = Class.nestedProp,
        areNotEquivDates = function(v1, v2) {
            if (v1 && v1.getDate && v2 && v2.getDate) {
                return v1.toString() !== v2.toString();
            }
            return true;
        };

    return {
        // # Settable
        //
        // mixin standard instance.get() and instance.set() semantics
        //
        // also provides a .prop() method that's similar to the jquery function
        //
        // ## configuration options
        //
        // ### `_settableProperty`
        //
        // all properties are stored on `this._settableProperty`, so calling:
        //
        //     instance.set({foo: 'bar'});
        //
        // would result in `instance._settableProperties.foo` being set to 'bar'
        //
        // IF, however, you wish the properties to be set on someting else, say
        // for example `this.options`, then in your class definition set
        // `_settableProperty` to 'options':
        //
        //     var MyClass = MySuperClass.extend({
        //         _settableProperty: 'options'
        //         // ... etc ...
        //     });
        //
        // if in the class definition `_settableProperty` is set to `null` (not
        // `undefined`), then the properties will be set directly on 'this', so
        // for example
        //
        //     var MyClass = MySuperClass.extend({
        //         _settableProperty: null
        //         // ... etc ...
        //     });
        //
        //     var instance = MyClass().set({foo: 'bar'});
        //     // instance.foo === bar
        //
        // of course, you shouldn't be accessing that object directly anyway,
        // you should use `.set()`, `.get()`, and `.prop()`.
        //
        // ### `_settableEventName`
        //
        // if calling `.set` results in a property change, and the instance is
        // Eventable, then a 'change' event will be triggered.
        //
        // if you want to trigger a different event, override the
        // `_settableEventName` property in your class def.
        //
        // if you never want an event triggered, set `_settableEventName` to
        // `null` in your class definition.
        //
        // ### `_settableOnChange`
        //
        // if this property is a function, then the callback is called when a
        // call to `set` incurs a change.  if it is a string, then the
        // corresponding property is looked up on `this`, and called.  the
        // function will be called in the context of the instance object:
        //
        //     var MyClass = MySuperClass.extend({
        //         _settableOnChange: function(changed, opts) {
        //
        //             // 'this' refers to the instance of `MyClass`
        //             this.update(changed);
        //
        //             // `opts` is the opts used in the `set` call
        //             if (!opts.silent) {
        //                 this.trigger('optionsChange', changed, opts);
        //             }
        //         }
        //         // ... etc ...
        //     });
        //
        //     var MyOtherClass = MySuperClass.extend({
        //         // when `set` causes a change, call `this.onChange`
        //         _settableOnChange: 'onChange'
        //         // ... etc ...
        //     });
        //
        __mixin__: function(base, prototype, mixin) {
            if (typeof prototype._settableProperty === 'undefined' &&
                typeof base._settableProperty      === 'undefined') {
                prototype._settableProperty = '_settableProperties';
            }
        },

        get: function(key, opts) {
            var obj = this._settableProperty == null?
                this : this[this._settableProperty];
            return opts && opts.notNested? obj[key] : _nested(obj, key); 
        },

        has: function(key) {
            var props = this._settableProperty == null?
                this : this[this._settableProperty];
            return props.hasOwnProperty(key);
        },

        // return the previous value of a property
        // return all previous properties if 'key == null'
        previous: function(key) {
            if (key == null) {
                return (this._settablePreviousProperties || {});
            } else {
                return (this._settablePreviousProperties || {})[key];
            }
        },

        // this is either a 'set' or a 'get':
        //
        //     instance.prop('stringValueForFirstArg')  // => get
        //     instance.prop(/* any other args */)      // => set
        //
        prop: function(/* arguments */) {
            var isGet = arguments.length === 1 && _.isString(arguments[0]);
            return this[isGet? 'get' : 'set']
                .apply(this, arguments);
        },

        // this can be called in any of the following ways:
        //
        //     instance.set({/* props */);
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
        set: function(/* arguments */) {
            var prop, value, newValue, changed, changing, valuesArentEqual,
                newProps = {}, opts = {}, changes = {},
                eventName = this._settableEventName,
                props = this._settableProperty == null?
                    this : this[this._settableProperty],
                prevProps = this._settablePreviousProperties;

            if (!props) {
                props = this[this._settableProperty] = {};
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

                    valuesArentEqual = this._settableAreEqual?
                        !this._settableAreEqual(value, newValue) :
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
                if (changed && !opts.silent) {
                    if (this.trigger && eventName) {
                        this.trigger(eventName, changes);
                    }
                    if (_.isFunction(this._settableOnChange)) {
                        this._settableOnChange.call(this, changes, opts);
                    } else if (_.isString(this._settableOnChange)) {
                        this[this._settableOnChange](changes, opts);
                    }
                }
                // this._settableChanging = false;
            // }

            return this;
        }
    };
});
