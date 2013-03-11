/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    './../underscore'
], function(_) {

    var Model = function(value) {
            return {
                get: function(value) {
                    return (this[value] === this.prop)?
                        this.prop : undefined;
                },
                prop: value
            };
        },
        models = [
            Model('a'),
            Model('a'),
            Model('b'),
            Model('c')
        ];

    test('mixin methods present', function() {
        ok(_.isFunction(_.mpluck));
        ok(_.isFunction(_.mwhere));
        ok(_.isFunction(_.mfindWhere));
    });

    test('`mpluck` works', function() {
        var props = _.mpluck(models, 'prop');

        equal(_.mpluck().length, 0);
        equal(props.length, 4);
        equal(props[0], 'a');
        equal(props[1], 'a');
        equal(props[2], 'b');
        equal(props[3], 'c');
    });

    test('`mwhere` works', function() {
        var props = _.mwhere(models, 'prop', 'a');

        equal(_.mwhere().length, 0);
        equal(props.length, 2);
        equal(props[0], models[0]);
        equal(props[1], models[1]);
    });

    test('`mfindWhere` works', function() {
        var prop = _.mfindWhere(models, 'prop', 'b');

        equal(_.mfindWhere(), null);
        equal(prop, models[2]);
    });

    test('augmented `where` works', function() {
        equal(_.where().length, 0);

        equal(_.where(models, 'prop', undefined).length, 0);
        equal(_.where(models, 'prop', {}).length, 0);
        equal(_.where(models, 'prop', 'a').length, 2);
        equal(_.where(models, 'prop', 'b').length, 1);
        equal(_.where(models, 'prop', 'c').length, 1);
        equal(_.where(models, 'prop', 'a')[0], models[0]);
        equal(_.where(models, 'prop', 'a')[1], models[1]);
        equal(_.where(models, 'prop', 'b')[0], models[2]);
        equal(_.where(models, 'prop', 'c')[0], models[3]);

        // standard findWhere functionality
        equal(_.where(models, {prop: 'a'}).length, 2);
        equal(_.where(models, {prop: 'b'}).length, 1);
        equal(_.where(models, {prop: 'c'}).length, 1);
        equal(_.where(models, {prop: 'a'})[0], models[0]);
        equal(_.where(models, {prop: 'a'})[1], models[1]);
        equal(_.where(models, {prop: 'b'})[0], models[2]);
        equal(_.where(models, {prop: 'c'})[0], models[3]);
    });

    test('augmented `findWhere` works', function() {
        equal(_.findWhere(), null);

        equal(_.findWhere(models, 'prop', undefined), undefined);
        equal(_.findWhere(models, 'prop', 'a'), models[0]);
        equal(_.findWhere(models, 'prop', 'b'), models[2]);
        equal(_.findWhere(models, 'prop', 'c'), models[3]);

        // standard findWhere functionality
        equal(_.findWhere(models, {prop: 'a'}), models[0]);
        equal(_.findWhere(models, {prop: 'b'}), models[2]);
        equal(_.findWhere(models, {prop: 'c'}), models[3]);

    });

    start();
});
