define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var SampleColumns = {};

    SampleColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sampleColumns',
                    owner: '',
                    value: {
                        'project_uuid': '',
                        'columns': []
                    }
                }
            );
        },
        initialize: function(parameters) {
            var value = this.get('value');
            if ((value['project_uuid'] == undefined) || (value['project_uuid'] == '')) {
                value['project_uuid'] = this.get('projectUuid');
                this.set('value', value);
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"sampleColumns","value.project_uuid":"' + this.get('projectUuid') + '"}')
                   + '&limit=1'
                   + '&offset=0'
                   ;
        },
        sync: function(method, model, options) {
            return Backbone.Agave.PutOverrideSync(method, this, options);
        },
        setAttributesFromFormData: function(formData) {
            this.set('value', formData);
        },
    });

    Backbone.Agave.Model.SampleColumns = SampleColumns;
    return SampleColumns;
});
