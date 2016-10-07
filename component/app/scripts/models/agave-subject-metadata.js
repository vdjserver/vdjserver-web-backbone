define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var SubjectMetadata = {};

    SubjectMetadata = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'subject',
                    owner: '',
                    value: {
                        'project_uuid': '',
                        'name': '',
                        'category': '',
                        'species': '',
                        'species_strain': '',
                        'common_name': '',
                        'gender': '',
                        'age': '',
                        'age_unit': '',
                        'health_status': '',
                        'disease': '',
                        'collection_date': '',
                        'collection_location_latitude': '',
                        'collection_location_longitude': '',
                        'collection_location': '',
                        'collection_location_country': '',
                        'specimen_id': '',
                        'specimen_type': '',
                        'repository': '',
                        'repository_sample_id': '',
                        'collector_name': '',
                        'collector_institution': '',
                        'collector_email': ''
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

    Backbone.Agave.Model.SubjectMetadata = SubjectMetadata;
    return SubjectMetadata;
});
