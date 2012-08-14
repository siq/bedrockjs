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

    module('nestedProp');

    test('`Class.nestedProp` works on bare JS objects', function() {
        var myObj = {foo: {bar: 'baz'}}, ret;

        equal(myObj.foo.bar, 'baz', 'initial check');

        ret = Class.nestedProp(myObj, 'foo.bar', 'bang');

        equal(myObj.foo.bar, 'bang', 'setting');

        ok(ret === myObj,
            'return value of set is the object to enable chaining');

        equal(Class.nestedProp(myObj, 'foo.bar'), 'bang', 'getting');

        ret = Class.nestedProp(myObj, 'foo', 'what?');

        equal(myObj.foo, 'what?', 'setting to non-nested prop');

        ok(ret === myObj,
            'return value of set is the object to enable chaining');

        equal(Class.nestedProp(myObj, 'foo'), 'what?', 'getting non-nested prop');
    }); 

    test('setting `undefined`', function() {
        var o = {};

        Class.nestedProp(o, 'foo', undefined);

        ok(o.hasOwnProperty('foo'));
        ok(typeof o.foo === 'undefined');
    });

    start();
});

