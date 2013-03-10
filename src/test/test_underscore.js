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
        };

    test('mixin methods present', function() {
        ok(_.isFunction(_.props));
    });

    test('`props` method work', function() {
        var models = [
                Model('a'),
                Model('a'),
                Model('b'),
                Model('c')
            ],
            props = _.props(models, 'prop');

        equal(_.props().length, 0);
        equal(props.length, 4);
        equal(props[0], 'a');
        equal(props[1], 'a');
        equal(props[2], 'b');
        equal(props[3], 'c');
    });

    test('`where` method work', function() {
        var models = [
                Model('a'),
                Model('a'),
                Model('b'),
                Model('c')
            ], objs = [{prop: 'a'}, {prop: 'b'}, {prop: 'c'}];

        equal(_.where().length, 0);

        // works with models
        equal(_.where(models, 'prop', undefined).length, 0);
        equal(_.where(models, 'prop', {}).length, 0);
        equal(_.where(models, 'prop', 'a').length, 2);
        equal(_.where(models, 'prop', 'b').length, 1);
        equal(_.where(models, 'prop', 'c').length, 1);
        equal(_.where(models, 'prop', 'a')[0], models[0]);
        equal(_.where(models, 'prop', 'a')[1], models[1]);
        equal(_.where(models, 'prop', 'b')[0], models[2]);
        equal(_.where(models, 'prop', 'c')[0], models[3]);

        // works with non-models
        equal(_.findWhere(objs, 'prop', undefined), null);
        equal(_.findWhere(objs, 'prop', 'a'), objs[0]);

        // standard findWhere functionality
        equal(_.where(models, {prop: 'a'}).length, 2);
        equal(_.where(models, {prop: 'b'}).length, 1);
        equal(_.where(models, {prop: 'c'}).length, 1);
        equal(_.where(models, {prop: 'a'})[0], models[0]);
        equal(_.where(models, {prop: 'a'})[1], models[1]);
        equal(_.where(models, {prop: 'b'})[0], models[2]);
        equal(_.where(models, {prop: 'c'})[0], models[3]);
    });

    test('`findWhere` method work', function() {
        var models = [
                Model('a'),
                Model('a'),
                Model('b'),
                Model('c')
            ],
            objs = [{prop: 'a'}, {prop: 'b'}, {prop: 'c'}];

        equal(_.findWhere(), null);

        // works with models
        equal(_.findWhere(models, 'prop', undefined), null);
        equal(_.findWhere(models, 'prop', 'a'), models[0]);
        equal(_.findWhere(models, 'prop', 'b'), models[2]);
        equal(_.findWhere(models, 'prop', 'c'), models[3]);

        // works with non-models
        equal(_.findWhere(objs, 'prop', undefined), null);
        equal(_.findWhere(objs, 'prop', 'a'), objs[0]);

        // standard findWhere functionality
        equal(_.findWhere(models, {prop: 'a'}), models[0]);
        equal(_.findWhere(models, {prop: 'b'}), models[2]);
        equal(_.findWhere(models, {prop: 'c'}), models[3]);

    });

    start();
});
