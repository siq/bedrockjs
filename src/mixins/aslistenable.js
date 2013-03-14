define([
    'vendor/underscore'
], function(_) {
    return function() {
        if (!this.set) {
            throw Error('asListenable requires asSettable mixin');
        }

        var update, slice = Array.prototype.slice,
            onChange = this._settable.onChange;

        this._bindListener = function(listener) {
            var prop = listener[0], evt = listener[1], method = listener[2];
            if (this.has(prop)) {
                this.get(prop).on(evt, this[method]);
            }
        };

        this._unbindListener = function(listener) {
            var prop = listener[0], evt = listener[1], method = listener[2];
            if (this.has(prop)) {
                this.get(prop).off(evt, this[method]);
            }
        };

        update = function(update, changes, opts) {
            var self = this, args = slice.call(arguments, 1),
                listening = self._listening || [];
            _.each(changes, function(val, prop) {
                _.each(listening, function(l) {
                    var listenerProp = l[0], evt = l[1], method = l[2];
                    if (prop === listenerProp) {
                        if (self.previous(prop)) {
                            self.previous(prop).off(evt, self[method]);
                        }
                        if (self.get(prop)) {
                            self.get(prop).on(evt, self[method]);
                        }
                    }
                });
            });
            return update.apply(this, args);
        };

        this.listenTo = function(prop, evt, method) {
            var bound       = this._boundMethods    = this._boundMethods || [],
                listening   = this._listening       = this._listening    || [];
            if (_.indexOf(bound, method) < 0) {
                this[method] = _.bind(this[method], this);
            }
            listening.push([prop, evt, method]);
            this._bindListener(_.last(listening));
            return this;
        };

        this.stopListening = function(prop, evt, method) {
            if (prop == null) {
                _.each(this._listening, _.bind(this._unbindListener, this));
                this._listening = [];
            } else {
                this._unbindListener([prop, evt, method]);
                this._listening = _.filter(this._listening, function(l) {
                    return l[0] !== prop || l[1] !== evt || l[2] !== method;
                });
            }
            return this;
        };

        if (_.isString(onChange)) {
            this[onChange] = _.wrap(this[onChange], update);
        } else {
            this._settable.onChange = _.wrap(onChange, update);
        }
    };
});
