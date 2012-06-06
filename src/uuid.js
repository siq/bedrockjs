define([], function() {
    var Mash = function() {
        var n = 0xefc8249d;
        return function(data) {
            data = data.toString();
            for (var i = 0, l = data.length; i < l; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000;
            }
            return (n >>> 0) * 2.3283064365386963e-10;
        };
    };

    var Kybos = function() {
        return (function(args) {
            var s0 = 0;
            var s1 = 0;
            var s2 = 0;
            var c = 1;
            var s = [];
            var k = 0;
 
            var mash = Mash();
            var s0 = mash(' ');
            var s1 = mash(' ');
            var s2 = mash(' ');
            for (var j = 0; j < 8; j++) {
                s[j] = mash(' ');
            }
 
            if (args.length == 0) {
                args = [+new Date];
            }

            for (var i = 0; i < args.length; i++) {
                s0 -= mash(args[i]);
                if (s0 < 0) {
                    s0 += 1;
                }
                s1 -= mash(args[i]);
                if (s1 < 0) {
                    s1 += 1;
                }
                s2 -= mash(args[i]);
                if (s2 < 0) {
                    s2 += 1;
                }
                for (var j = 0; j < 8; j++) {
                    s[j] -= mash(args[i]);
                    if (s[j] < 0) {
                        s[j] += 1;
                    }
                }
            }
 
            var random = function() {
                var a = 2091639;
                k = s[k] * 8 | 0;
                var r = s[k];
                var t = a * s0 + c * 2.3283064365386963e-10; // 2^-32
                s0 = s1;
                s1 = s2;
                s2 = t - (c = t | 0);
                s[k] -= s2;
                if (s[k] < 0) {
                    s[k] += 1;
                }
                return r;
            };

            random.uint32 = function() {
                return random() * 0x100000000; // 2^32
            };

            random.fract53 = function() {
                return random() + (random() * 0x200000 | 0) * 1.1102230246251565e-16;
            };

            random.addNoise = function() {
                for (var i = arguments.length - 1; i >= 0; i--) {
                    for (j = 0; j < 8; j++) {
                        s[j] -= mash(arguments[i]);
                        if (s[j] < 0) {
                            s[j] += 1;
                        }
                    }
                }
            };

            random.version = 'Kybos 0.9';
            random.args = args;
            return random;
        } (Array.prototype.slice.call(arguments)));
    };

    var byteToHex = [];
    for (var i = 0; i < 256; i++) {
        byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    var byteArray = new Array(16);
    return function() {
        var random = Kybos().uint32, bth = byteToHex, bytes = byteArray, r, i;

        for (i = 0; i < 16; i++) {
            if ((i & 0x03) == 0) {
                r = random();
            }
            bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        i = 0;
        return bth[bytes[i++]] + bth[bytes[i++]] + 
            bth[bytes[i++]] + bth[bytes[i++]] + '-' +
            bth[bytes[i++]] + bth[bytes[i++]] + '-' +
            bth[bytes[i++]] + bth[bytes[i++]] + '-' +
            bth[bytes[i++]] + bth[bytes[i++]] + '-' +
            bth[bytes[i++]] + bth[bytes[i++]] +
            bth[bytes[i++]] + bth[bytes[i++]] +
            bth[bytes[i++]] + bth[bytes[i++]];
    }
});
