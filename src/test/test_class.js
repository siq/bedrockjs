/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    './../class'
], function(Class) {
    var TestClass = Class.extend({
        init: function() {
            this.bang = {boom: 'indigenous'};
        },
        foo: {bar: 'baz'}
    });

    module('prop');

    test('`Class.prop` works on bare JS objects', function() {
        var myObj = {foo: {bar: 'baz'}}, ret;

        equal(myObj.foo.bar, 'baz', 'initial check');

        ret = Class.prop(myObj, 'foo.bar', 'bang');

        equal(myObj.foo.bar, 'bang', 'setting');

        ok(ret === myObj,
            'return value of set is the object to enable chaining');

        equal(Class.prop(myObj, 'foo.bar'), 'bang', 'getting');

        ret = Class.prop(myObj, 'foo', 'what?');

        equal(myObj.foo, 'what?', 'setting to non-nested prop');

        ok(ret === myObj,
            'return value of set is the object to enable chaining');

        equal(Class.prop(myObj, 'foo'), 'what?', 'getting non-nested prop');
    }); 

    test('`myClassInstnace.prop`', function() {
        var myClassInstnace = TestClass(), ret;

        equal(myClassInstnace.foo.bar, 'baz', 'initial check');

        ret = myClassInstnace.prop('foo.bar', 'bang');

        equal(myClassInstnace.foo.bar, 'bang', 'setting');

        ok(ret === myClassInstnace,
            'return value of set is the instance to enable chaining');

        equal(myClassInstnace.prop('foo.bar'), 'bang', 'getting');

        equal(myClassInstnace.prop('foo.bare'), undefined, 'getting non existing stuff');

        ret = myClassInstnace.prop('foo', 'what?');

        equal(myClassInstnace.foo, 'what?', 'setting to non-nested prop');

        ok(ret === myClassInstnace,
            'return value of set is the instance to enable chaining');

        equal(myClassInstnace.prop('foo'), 'what?', 'getting non-nested prop');

    });

    start();
});

