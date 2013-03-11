define([
    'vendor/underscore'
], function(_) {

    var whereProps = function(list, prop, value, first) {
        return _[first ? 'find' : 'filter'](list, function(model) {
            if (model.get(prop) !== value) return false;
            return true;
        });
    };

    _.mixin({
        mpluck: function(list, prop) {
            if (!_.isString(prop)) return [];
            return _.compact(
                _.map(list, function(model) {
                    return model.get(prop);
                })
            );
        },
        mwhere: function(list, prop, value) {
            return whereProps(list, prop, value);
        },
        mfindWhere: function(list, prop, value) {
            return whereProps(list, prop, value, true);
        }
    });

    // augment `_.where` and `_.findWhere` to accept string params
    _.where = _.wrap(_.where, function(f, list, key, val) {
        return _.isString(key)?
            f.call(this, list, _.object([key], [val])) :
            f.apply(this, _.rest(arguments, 1));
    });
    _.findWhere = _.wrap(_.where, function(f, list, key, val) {
        return _.isString(key)?
            f.call(this, list, _.object([key], [val]), true) :
            f.call(this, list, key, true);
    });

    return _;
});
