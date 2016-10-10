define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var SampleGroupMetadata = {};

    SampleGroupMetadata = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sampleGroup',
                    owner: '',
                    value: {
                        'project_uuid': '',
                        'name': '',
                        'description': '',
                        'samples': [],
                        'field_logicals': []
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
            return '/meta/v2/data/' + this.get('uuid');
        },
        sync: function(method, model, options) {
            return Backbone.Agave.PutOverrideSync(method, this, options);
        },
        setAttributesFromFormData: function(formData) {
            this.set('value', formData);
        },
    });

    Backbone.Agave.Model.SampleGroupMetadata = SampleGroupMetadata;
    return SampleGroupMetadata;
});
