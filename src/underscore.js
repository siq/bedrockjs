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

    return _;
});
