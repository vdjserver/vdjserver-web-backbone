define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var SampleMetadata = {};

    SampleMetadata = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sample',
                    owner: '',
                    value: {
                        'project_uuid': '',
                        'subject_uuid': '',
                        'name': '',
                        'description': '',
                        'bio_processing_uuid': '',
                        'data_association': 'barcode',
                        'barcode': '',
                        'projectFile': '',
                        'software_processing_uuid': ''
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

    Backbone.Agave.Model.SampleMetadata = SampleMetadata;
    return SampleMetadata;
});
