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
                        // AIRR minimal standards
                        'subject_id': '',
                        'subject_name': '',
                        'organism': '',
                        'sex': '',
                        'age': '',
                        'age_event': '',
                        'ancestry_population': '',
                        'ethnicity': '',
                        'race': '',
                        'species_name': '',
                        'strain_name': '',
                        'linked_subjects': '',
                        'link_type': '',
                        'study_group_description': '',
                        'diagnosis': '',
                        'disease_length': '',
                        'disease_stage': '',
                        'prior_therapies': '',
                        'immunogen': '',
                        'intervention': '',
                        'medical_history': '',
                        // other defaults
                        'tax_id': '',
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

    Backbone.Agave.Model.SubjectMetadata = SubjectMetadata;
    return SubjectMetadata;
});
