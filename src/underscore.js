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
        if (!_.isString(prop) || value === undefined) {
            return first ? null : [];
        }
        return _[first ? 'find' : 'filter'](list, function(model) {
            if (model.get(prop) !== value) return false;
            return true;
        });
    };

    // cache vendor `where` so when we `apply` it in `findWhere`
    // the wrapped `where` is not called
    var _where = _.where;
    _.where = _.wrap(_.where, function(func) {
        var args = Array.prototype.slice.call(arguments, 1),
            list = args[0], prop = args[1], value = args[2];
        return (args.length === 3)?
            whereProps(list, prop, value) : func.apply(this, args);
    });

    _.findWhere = _.wrap(_.findWhere, function(func) {
        var args = Array.prototype.slice.call(arguments, 1),
            list = args[0], prop = args[1], value = args[2];
        return  (args.length === 3)?
                    whereProps(list, prop, value, true) :
                (args.length === 0)?
                    null : _where.apply(this, args.concat(true));
    });

    return _;
});
