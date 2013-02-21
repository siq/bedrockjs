/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    'vendor/jquery',
    './../class',
    './../assettable',
    './../events',
    './../aslistenable'
], function($, Class, asSettable, Eventable, asListenable) {
    var Model = Class.extend({
            onChange: function(changed) {
                this.trigger('change', changed);
            }
        }, {mixins: [Eventable]}),
        MyClass = Class.extend({
            init: function(opts) {
                this.set(opts);
            },
            _onChange: function() {
                if (this.has('callback')) {
                    this.get('callback').apply(this, arguments);
                }
            },
            _onChange2: function() {
                if (this.has('callback2')) {
                    this.get('callback2').apply(this, arguments);
                }
            },
            update: function() {}
        });
    asSettable.call(Model.prototype, {onChange: 'onChange'});
    asSettable.call(MyClass.prototype, {onChange: 'update'});
    asListenable.call(MyClass.prototype);

    asyncTest('as listenable registers event handlers', function() {
        var m = Model(), happened = [],
            mc = MyClass({
                callback: function() {
                    happened.push(
                        [this, Array.prototype.slice.call(arguments, 0)]);
                }
            });

        mc.listenTo('model', 'change', '_onChange');
        mc.set('model', m);
        m.set('foo', 'bar');

        equal(happened.length, 1);
        ok(happened[0][0] === mc, 'scope correctly bound in _onChange');
        deepEqual(happened[0][1], ['change', {foo: true}]);
        start();
    });

    asyncTest('as listenable registers event handlers 2', function() {
        var happened = [],
            mc = MyClass({
                model: Model(),
                callback: function() {
                    happened.push(Array.prototype.slice.call(arguments, 0));
                }
            });
        mc.listenTo('model', 'change', '_onChange');
        mc.get('model').set('foo', 'bar');
        deepEqual(happened, [['change', {foo: true}]]);
        start();
    });

    asyncTest('as listenable unregisters previous event handlers 1', function() {
        var happened = [], m,
            mc = MyClass({
                model: m = Model(),
                callback: function() {
                    happened.push(Array.prototype.slice.call(arguments, 0));
                }
            });
        mc.listenTo('model', 'change', '_onChange');
        mc.get('model').set('foo', 'bar');
        deepEqual(happened, [['change', {foo: true}]]);

        mc.set('model', Model());
        m.set('foo', 'bar 2');
        deepEqual(happened, [['change', {foo: true}]],
            'previous model didnt trigger change');

        mc.get('model').set('baz', 'boom');
        deepEqual(happened, [['change', {foo: true}], ['change', {baz: true}]]);
        start();
    });

    asyncTest('as listenable unregisters previous event handlers 2', function() {
        var happened = [], m,
            mc = MyClass({
                model: m = Model(),
                callback: function() {
                    happened.push(Array.prototype.slice.call(arguments, 0));
                }
            });
        mc.listenTo('model', 'change', '_onChange');
        mc.get('model').set('foo', 'bar');
        deepEqual(happened, [['change', {foo: true}]]);

        mc.del('model');
        m.set('foo', 'bar 2');
        deepEqual(happened, [['change', {foo: true}]],
            'previous model didnt trigger change');

        mc.set('model', Model());
        mc.get('model').set('baz', 'boom');
        deepEqual(happened, [['change', {foo: true}], ['change', {baz: true}]]);
        start();
    });

    asyncTest('stopListening', function() {
        var happened = [], happened2 = [], m, m2,
            mc = MyClass({
                model: m = Model(),
                model2: m2 = Model(),
                callback: function() {
                    happened.push(Array.prototype.slice.call(arguments, 0));
                },
                callback2: function() {
                    happened2.push(Array.prototype.slice.call(arguments, 0));
                }
            });
        mc.listenTo('model', 'change', '_onChange');
        mc.listenTo('model2', 'change', '_onChange2');

        mc.get('model').set('foo', 'bar');
        mc.get('model2').set('foo2', 'bar2');
        deepEqual(happened, [['change', {foo: true}]]);
        deepEqual(happened2, [['change', {foo2: true}]]);

        mc.stopListening();

        mc.get('model').set('foo', 'bar');
        mc.get('model2').set('foo2', 'bar2');

        deepEqual(happened, [['change', {foo: true}]]);
        deepEqual(happened2, [['change', {foo2: true}]]);

        start();

    });

    // TODO:
    //  - multiple listeners

    start();
});
