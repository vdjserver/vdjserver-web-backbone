define(['app', 'js-yaml', 'text!config/airr-schema.yaml.html'], function(App, jsYaml, AIRRSchema) {

    'use strict';

    var schema = jsYaml.safeLoad(AIRRSchema);

    App.Models.AIRRSchema = schema;
    return schema;
});
