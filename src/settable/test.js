/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    'vendor/underscore',
    'vendor/moment',
    './../class',
    './../events',
    './../settable'
], function(_, moment, Class, Eventable, Settable) {
    var MyClass = Class.extend({}, {mixins: [Settable]}),
        EventableClass = Class.extend({
            _settableEventName: 'change'
        }, {mixins: [Settable, Eventable]});

    module('basic functionality');

    test('instantiation', function() {
        var instance = MyClass();
        ok(instance);
    });

    test('setting and getting a property', function() {
        var instance = MyClass();

        instance.set('foo', 'bar');
        equal(instance.get('foo'), 'bar');

        instance.set({
            baz: 'boom',
            bing: 'bang'
        });
        equal(instance.get('baz'), 'boom');
        equal(instance.get('bing'), 'bang');
    });

    test('set returns this', function() {
        var instance = MyClass(),
            that = instance.set({foo: 'bar'});

        ok(instance === that);
    });

    test('various forms of calling set', function() {
        var instance = MyClass();

        instance.set({foo: 'bar', baz: 'boom'});
        instance.set({the: 'other'}, {silent: true});
        instance.set('key1', 'value1');
        instance.set('key2', 'value2', {silent: true});

        equal(instance.get('foo'), 'bar');
        equal(instance.get('baz'), 'boom');
        equal(instance.get('the'), 'other');
        equal(instance.get('key1'), 'value1');
        equal(instance.get('key2'), 'value2');
    });

    test('tracking previous values', function() {
        var instance = MyClass()
            .set({foo: 'bar', baz: 'boom'})
            .set({foo: 'bar2', baz: 'boom2'});

        equal(instance.previous('foo'), 'bar');
        equal(instance.previous('baz'), 'boom');
        deepEqual(instance.previous(), {foo: 'bar', baz: 'boom'});
    });

    module('events');

    asyncTest('setting triggers an event', function() {
        var triggered = false, instance = EventableClass();
        instance.on('change', function(eventName, changed) {
            ok(triggered = true, 'event was triggered');
            ok(changed.foo);
            start();
        });

        setTimeout(function() {
            if (!triggered) {
                ok(false, 'event wasnt triggered');
                start();
            }
        }, 50);

        instance.set({foo: 'bar'});
    });

    asyncTest('setting with "silent: true" doesnt trigger', function() {
        var triggered = false, instance = EventableClass();
        instance.on('change', function(eventName, changed) {
            triggered = true;
            ok(false, 'event was triggered');
            start();
        });

        setTimeout(function() {
            if (!triggered) {
                ok(true, 'event wasnt triggered');
                start();
            }
        }, 50);

        instance.set({foo: 'bar'}, {silent: true});
        instance.set('foo', 'bar', {silent: true});
    });

    module('configuration options');

    test('changing _settableProperty', function() {
        var MyClass = Class.extend({
                _settableProperty: 'options'
            }, {mixins: [Settable]}),
            instance = MyClass().set({foo: 'bar'});

        ok(typeof instance._settableProperties === 'undefined');
        equal(instance.options.foo, 'bar');

        instance.set('foo', 'bar2');
        equal(instance.options.foo, 'bar2');
        equal(instance.get('foo'), 'bar2');
        equal(instance.previous('foo'), 'bar');
    });

    test('setting _settableProperty to null', function() {
        var MyClass = Class.extend({
                _settableProperty: null
            }, {mixins: [Settable]}),
            instance = MyClass().set({foo: 'bar'});

        ok(typeof instance._settableProperties === 'undefined');
        equal(instance.foo, 'bar');

        instance.set('foo', 'bar2');
        equal(instance.foo, 'bar2');
        equal(instance.get('foo'), 'bar2');
        equal(instance.previous('foo'), 'bar');
    });

    asyncTest('changing _settableEventName', function() {
        var EventableClass = Class.extend({
                _settableEventName: 'foo'
            }, {mixins: [Eventable, Settable]}),
            triggered = false, instance = EventableClass();
        instance.on('foo', function(eventName, changed) {
            ok(triggered = true, 'correct event was triggered');
            ok(changed.foo);
            start();
        }).on('change', function() {
            triggered = true;
            ok(false, 'wrong event was triggered');
            start();
        });

        setTimeout(function() {
            if (!triggered) {
                ok(false, 'event wasnt triggered');
                start();
            }
        }, 50);

        instance.set({foo: 'bar'});

    });

    asyncTest('changing _settableEventName to null', function() {
        var EventableClass = Class.extend({
                _settableEventName: null
            }, {mixins: [Eventable, Settable]}),
            triggered = false, instance = EventableClass();
        instance.on('foo', function(eventName, changed) {
            triggered = true;
            ok(false, 'event should not have triggered');
            ok(changed.foo);
            start();
        });

        setTimeout(function() {
            if (!triggered) {
                ok(true, 'no event was triggered');
                start();
            }
        }, 50);

        instance.set({foo: 'bar'});

    });

    asyncTest('setting _onChange to a function', function() {
        var changeFired = false,
            MyClass = Class.extend({
                _settableOnChange: function(changed, opts) {
                    ok(changeFired = true, 'change happened');
                    ok(this === instance, 'context is set correctly');
                    ok(changed.foo, 'changed object reflects changes');
                    equal(opts.sheezy, 'fo reezy');
                    start();
                }
            }, {mixins: [Settable]}),
            instance = MyClass();

        setTimeout(function() {
            if (!changeFired) {
                ok(false, 'event wasnt triggered');
                start();
            }
        }, 50);

        instance.set({foo: 'bar'}, {sheezy: 'fo reezy'});
    });

    asyncTest('setting _onChange to a string', function() {
        var changeFired = false,
            MyClass = Class.extend({
                _settableOnChange: 'onChange',
                onChange: function(changed, opts) {
                    ok(changeFired = true, 'change happened');
                    ok(this === instance, 'context is set correctly');
                    ok(changed.foo, 'changed object reflects changes');
                    equal(opts.sheezy, 'fo reezy');
                    start();
                }
            }, {mixins: [Settable]}),
            instance = MyClass();

        setTimeout(function() {
            if (!changeFired) {
                ok(false, 'event wasnt triggered');
                start();
            }
        }, 50);

        instance.set({foo: 'bar'}, {sheezy: 'fo reezy'});
    });

    asyncTest('setting _settableAreEqual works correctly', function() {
        var v1 = {foo: 'bar'}, v2 = {foo: 'bar'}, changed = false,
            MyClass = EventableClass.extend({
                _settableAreEqual: _.isEqual
            }),
            instance = MyClass().set('val', v1);

        instance.on('change', function(evtName, changes) {
            console.log('in change event, changed:',changes,_.isEmpty(changes));
            changed = _.isEmpty(changes)? false : changes;
        }).set('val', v2);

        setTimeout(function() {
            equal(changed, false);

            instance.set('val', 123);

            setTimeout(function() {
                deepEqual(changed, {val: true});
                start();
            }, 50);
        }, 50);
    });

    module('nested properties');

    test('setting/getting nested property', function() {
        var instance = MyClass().set('foo.bar', 'baz');
        equal(instance.get('foo.bar'), 'baz');
        ok(_.isObject(instance._settableProperties.foo));

        instance.set('foo', 'baz2');
    });

    module('has');

    test('basic `has` functionality', function() {
        var m = MyClass().set({foo: 'bar'});
        equal(m.has('foo'), true);
        equal(m.has('baz'), false);
    });

    test('`has` returns true when something set to undefined or null', function() {
        var m = MyClass().set({foo: undefined, bar: null});
        equal(m.has('foo'), true);
        equal(m.has('bar'), true);

        m.set({baz: 'abc'});
        equal(m.has('baz'), true);
        m.set({baz: undefined});
        equal(m.has('baz'), true);
    });

    test('`has` nested property', function() {
        var m = MyClass().set('foo.bar', 'baz');
        ok(m._settableProperties.foo.hasOwnProperty('bar'), 'property is set');
        ok(m.has('foo.bar'), 'has reports correctly');
        m.set('foo', 123);
        equal(m.has('foo.bar'), false, 'has reports correctly');
    });

    module('dates');

    asyncTest('setting equivalent but different dates doesnt trigger', function() {
        var d1 = moment(),
            d2 = d1.clone(),
            m = EventableClass().set('created', d1.toDate()),
            triggered = false;

        // sanity check
        ok(d1.toDate() !== d2.toDate());
        ok(d1.toDate().toString() === d2.toDate().toString());

        m.on('change', function() {
            triggered = true;
        });

        m.set('created', d2.toDate());

        setTimeout(function() {
            equal(triggered, false, 'setting to an equivalent date shouldnt trigger');
            start();
        }, 50);
    });

    start();
});

