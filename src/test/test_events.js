/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    'vendor/underscore',
    './../class',
    './../events'
], function(_, Class, Eventable) {
    module('events');

    var Eventful = Class.extend({
        init: function() { }
    }, {mixins: [Eventable]});

    test('subscription and unsubscription', function() {
        var eventful = Eventful(), calls = 0,
            callback = function(event, value) {
                strictEqual(value, 'value');
                calls += 1;
            };

        strictEqual(calls, 0);
        eventful.trigger('test', 'value');
        strictEqual(calls, 0);

        eventful.on('test', callback);
        strictEqual(calls, 0);
        eventful.trigger('test', 'value');
        strictEqual(calls, 1);

        eventful.off('test', callback);
        strictEqual(calls, 1);
        eventful.trigger('test', 'value');
        strictEqual(calls, 1);
    });

    test('unsubscription via returning false', function() {
        var eventful = Eventful(), calls = 0,
            callback = function(event) {
                calls += 1;
                return false;
            };

        eventful.on('test', callback);
        strictEqual(calls, 0);
        eventful.trigger('test');
        strictEqual(calls, 1);
        eventful.trigger('test');
        strictEqual(calls, 1);
    });

    test('subscription to all events', function() {
        var eventful = Eventful(), calls = 0,
            callback = function() {
                calls += 1;
            };

        eventful.on('all', callback);
        strictEqual(calls, 0);
        eventful.trigger('one');
        strictEqual(calls, 1);
        eventful.trigger('two');
        strictEqual(calls, 2);
        eventful.trigger('three');
        strictEqual(calls, 3);
    });

    test('subscribe to multiple events at once', function() {
        var eventful = Eventful(),
            happened = {change: 0, update: 0};
        eventful.on('change update', function(eventName) {
            happened[eventName]++;
        }).trigger('change').trigger('update');

        equal(happened.change, 1);
        equal(happened.update, 1);
    });

    test('unsubscribe to multiple events at once', function() {
        var eventful = Eventful(),
            happened = {change: 0, update: 0};
        eventful.on('change update', function(eventName) {
            happened[eventName]++;
        }).trigger('change').trigger('update');

        equal(happened.change, 1);
        equal(happened.update, 1);

        eventful.off('change update').trigger('change').trigger('update');

        equal(happened.change, 1);
        equal(happened.update, 1);
    });

    start();
});
