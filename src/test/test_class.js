/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    'vendor/underscore',
    './../class'
], function(_, Class) {
    var TestClass = Class.extend({
        init: function() {
            this.bang = {boom: 'indigenous'};
        },
        foo: {bar: 'baz'}
    });

    test('inheritance', function() {
        var A = Class.extend({
                a: 'class property of A',
                overridden: 'defined in A'
            }),
            B = A.extend({
                b: 'class property of B',
                overridden: 'defined in B'
            }),
            C = B.extend({
                c: 'class property of C',
                overridden: 'defined in C'
            }),
            a = A(), b = B(), c = C(), c2;

        _.each([a, b, c], function(instance) {
            equal(instance.a, 'class property of A');
        });

        _.each([b, c], function(instance) {
            equal(instance.b, 'class property of B');
        });

        equal(c.c, 'class property of C');

        c.c = 'instance property of c';

        c2 = C();

        equal(c.c, 'instance property of c');
        equal(c2.c, 'class property of C');

        ok(a instanceof A);
        ok(!(a instanceof B));
        ok(!(a instanceof C));

        ok(b instanceof A);
        ok(b instanceof B);
        ok(!(b instanceof C));

        ok(c instanceof A);
        ok(c instanceof B);
        ok(c instanceof C);

        equal(a.overridden, 'defined in A');
        equal(b.overridden, 'defined in B');
        equal(c.overridden, 'defined in C');
    });

    test('prototype chain', function() {
        var aProto = {
                a: 'class property of A',
                overridden: 'defined in A'
            },
            A = Class.extend(aProto),
            bProto = {
                b: 'class property of B',
                overridden: 'defined in B'
            },
            B = A.extend(bProto),
            cProto = {
                c: 'class property of C',
                overridden: 'defined in C'
            },
            C = B.extend(cProto),
            a = A(), b = B(), c = C();

        ok(a.constructor === A, 'instance.constructor should reference the class');
        ok(A.prototype.constructor === A, 'class.prototype.constructor should reference the class, like, for intstance, String.prototype.constructor');
        ok(!A.hasOwnProperty('constructor'), 'constructor should be defined on prototype');
        ok(!a.hasOwnProperty('constructor'), 'constructor should be defined on prototype');

        ok(b.constructor === B, 'instance.constructor should reference the class');
        ok(B.__super__ === A, 'class.__super__ should referenc the super class');
        ok(B.prototype.constructor === B, 'class.prototype.constructor should reference the class, like, for intstance, String.prototype.constructor');
        ok(!B.hasOwnProperty('constructor'), 'constructor should be defined on prototype');
        ok(!b.hasOwnProperty('constructor'), 'constructor should be defined on prototype');

        ok(c.constructor === C, 'instance.constructor should reference the class');
        ok(C.__super__ === B, 'class.__super__ should referenc the super class');
        ok(C.__super__.__super__ === A, 'climbing the prototype chain should be possible');
        equal(C.__super__.__super__.prototype.a, 'class property of A', 'accessing ancestors\' properties should be possible');
        ok(C.prototype.constructor === C, 'class.prototype.constructor should reference the class, like, for intstance, String.prototype.constructor');
        ok(!C.hasOwnProperty('constructor'), 'constructor should be defined on prototype');
        ok(!c.hasOwnProperty('constructor'), 'constructor should be defined on prototype');

        // this checks that A.prototype is {a: '...', overridden: '...'}, etc
        _.each([[aProto, A], [bProto, B], [cProto, C]], function(items) {
            var body = items[0], cls = items[1];
            _.each(body, function(val, key) {
                equal(cls.prototype[key], val);
            });
        });
    });

    test('__new__', function() {
        var A, A2, aNewRunCount = 0,
            aProto = {
                __new__: function(constructor, base, prototype) {
                    aNewRunCount++;
                }
            },
            B, bNewRunCount = 0,
            bProto = {
                __new__: function(constructor, base, prototype) {
                    bNewRunCount++;
                }
            },
            C, cNewRunCount = 0,
            cProto = {
                __new__: function(constructor, base, prototype) {
                    cNewRunCount++;
                }
            };

        A = Class.extend(aProto);
        equal(aNewRunCount, 0);
        A2 = A.extend({});
        equal(aNewRunCount, 1);

        B = A.extend(bProto);
        equal(aNewRunCount, 2);
        equal(bNewRunCount, 0);

        C = B.extend(cProto);
        equal(aNewRunCount, 2);
        equal(bNewRunCount, 1);
        equal(cNewRunCount, 0);
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

