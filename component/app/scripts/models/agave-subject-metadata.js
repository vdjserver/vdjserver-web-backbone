define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var Sample = {};

    Sample = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sample',
                    owner: '',
                    value: {
                        'project': '',
                        'specimen_source_id': '',
                        'specimen_category': '',
                        'specimen_source_species': '',
                        'specimen_source_species_strain': '',
                        'specimen_source_common_name': '',
                        'specimen_source_gender': '',
                        'specimen_source_age': '',
                        'specimen_source_age_unit': '',
                        'specimen_source_health_status': '',
                        'specimen_source_disease': '',
                        'specimen_collection_date': '',
                        'specimen_collection_location_latitude': '',
                        'specimen_collection_location_longitude': '',
                        'specimen_collection_location': '',
                        'specimen_collection_location_country': '',
                        'specimen_id': '',
                        'specimen_type': '',
                        'specimen_repository': '',
                        'specimen_repository_sample_id': '',
                        'specimen_collector_name': '',
                        'specimen_collector_institution': '',
                        'specimen_collector_email': ''
                    }
                }
            );
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        sync: function(method, model, options) {

            if (this.get('uuid') === '') {
                options.apiHost = EnvironmentConfig.vdjApi.hostname;
                options.url = '/sample';

                var value = this.get('value');
                var projectName = value.name;
                var username = Backbone.Agave.instance.token().get('username');

                this.clear();
                this.set({
                    username: username,
                    projectName: projectName
                });
            }

            return Backbone.Agave.PutOverrideSync(method, this, options);
        },
        setAttributesFromFormData: function(formData) {
            this.set('value', formData);
        },
    });

    Backbone.Agave.Model.Sample = Sample;
    return Sample;
});
