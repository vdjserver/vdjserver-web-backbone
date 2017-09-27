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
                        'columns': []
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

            // AIRR minimal standards and other defaults
            this.defaultColumns = ['sample_id', 'name', 'sample_description',
                                  'sample_type', 'tissue', 'disease_state_sample',
                                  'collection_date', 'collection_time_event', 'source_commercial',
                                  'subject_uuid', 'project_file', 'barcode'];
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"sampleColumns","associationIds":"' + this.get('projectUuid') + '"}')
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

        getColumnNames: function() {
            var columnNames = _.clone(this.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    });

    Backbone.Agave.Model.SampleColumns = SampleColumns;
    return SampleColumns;
});
