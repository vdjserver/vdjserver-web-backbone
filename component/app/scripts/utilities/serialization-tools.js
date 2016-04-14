define([
    'app',
], function(App) {

    'use strict';

    var SerializationTools = {};

    SerializationTools.GetSerializedModel = function(model) {
        var data = {};

        try {
            data = model.toJSON();
        }
        catch (e) {

        }

        return data;
    };

    App.Utilities.SerializationTools = SerializationTools;
    return SerializationTools;
});
