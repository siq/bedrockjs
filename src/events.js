define([], function() {
    return {
        on: function(name, callback, context) {
            var i, len, events = this._eventCallbacks,
                names = name.split(/\s+/);
            if (!events) {
                events = this._eventCallbacks = {};
            }

            for (i = 0, len = names.length; i < len; i++) {
                name = names[i];
                if(events[name]) {
                    events[name].push([callback, context]);
                } else {
                    events[name] = [[callback, context]];
                }
            }
            return this;
        },
        trigger: function(name) {
            var events = this._eventCallbacks, both = 2, callbacks, callback;
            if(events) {
                while(both--) {
                    callbacks = events[both ? name : 'all'];
                    if(callbacks) {
                        for(var i = 0, l = callbacks.length; i < l; i++) {
                            callback = callbacks[i];
                            if(callback) {
                                if(callback[0].apply(callback[1] || this, arguments) === false) {
                                    callback = null;
                                }
                            }
                            if(!callback) {
                                callbacks.splice(i, 1);
                                i--;
                                l--;
                            }
                        }
                    }
                }
            }
            return this;
        },
        off: function(name, callback) {
            var events = this._eventCallbacks, names, callbacks;
            if(!name) {
                this._eventCallbacks = {};
            } else if (events) {
                names = name.split(/\s+/);
                for (var i = 0, len = names.length; i < len; i++) {
                    name = names[i];
                    if (callback) {
                        callbacks = events[name];
                        if (callbacks) {
                            for (var j = 0, l = callbacks.length; j < l; j++) {
                                if(callbacks[j] && callbacks[j][0] === callback) {
                                    callbacks[j] = null;
                                    break;
                                }
                            }
                        }
                    } else {
                        events[name] = [];
                    }
                }
            }
            return this;
        }
    };
});
