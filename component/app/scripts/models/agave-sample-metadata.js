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
                        'subject_uuid': '',
                        'Name': '',
                        'Description': '',
                        'bio_processing_uuid': '',
                        'data_association': '',
                        'Barcode': '',
                        'project_file': '',
                        'software_processing_uuid': ''
                    }
                }
            );
        },
        initialize: function(parameters) {
            Backbone.Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
                this.set('associationIds', [ parameters.projectUuid ]);
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
