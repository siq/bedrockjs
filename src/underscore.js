define([
    'vendor/underscore'
], function(_) {

    _.mixin({
        props: function(list, prop) {
            return _.compact(
                _.map(list, function(model) {
                    return model.get(prop);
                })
            );
        }
    });

    return _;
});
