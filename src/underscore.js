define([
    'vendor/underscore'
], function(_) {

    _.mixin({
        props: function(list, prop) {
            if (!_.isString(prop)) return [];
            return _.compact(
                _.map(list, function(model) {
                    return model.get(prop);
                })
            );
        }
    });

    var whereProps = function(list, prop, value, first) {
        return _[first ? 'find' : 'filter'](list, function(model) {
            if (model.get(prop) !== value) return false;
            return true;
        });
    };

    _.where = _.wrap(_.where, function(func) {
        var args = Array.prototype.slice.call(arguments, 1),
            list = args[0], prop = args[1], value = args[2];
        return (_.isString(prop))?
            whereProps(list, prop, value) : func.apply(this, args);
    });
    _.findWhere = _.wrap(_.findWhere, function(func) {
        var args = Array.prototype.slice.call(arguments, 1),
            list = args[0], prop = args[1], value = args[2];
        return  (_.isString(prop))?
            whereProps(list, prop, value, true) : func.apply(this, args);
    });

    return _;
});
