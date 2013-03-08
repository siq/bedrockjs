/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    './../underscore'
], function(_) {

    var Model = function(value) {
        var prop = value;
        return {
            get: function(value) {
                return (value === prop)?
                    prop : undefined;
            }
        };
    };

    test('mixin methods present', function() {
        ok(_.isFunction(_.props));
    });

    test('mixin methods work', function() {
        var models = [
            Model('a'),
            Model('a'),
            Model('b'),
            Model('c')
        ];
        equal(_.props(models, 'a').length, 2);
        equal(_.props(models, 'b').length, 1);
        equal(_.props(models, 'c').length, 1);
        equal(_.props(models, 'a')[0], 'a');
        equal(_.props(models, 'a')[1], 'a');
        equal(_.props(models, 'b')[0], 'b');
        equal(_.props(models, 'c')[0], 'c');
    });

    start();
});
