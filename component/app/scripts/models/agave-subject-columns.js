define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var SubjectColumns = {};

    SubjectColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'subjectColumns',
                    owner: '',
                    value: {
                        'columns': []
                    }
                }
            );
        },
        initialize: function(parameters) {
            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
                this.set('associationIds', [ parameters.projectUuid ]);
            }

            this.defaultColumns = ['Name', 'Category', 'Species', 'Strain', 'Gender', 'Age'];
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"subjectColumns","associationIds":"' + this.get('projectUuid') + '"}')
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

    Backbone.Agave.Model.SubjectColumns = SubjectColumns;
    return SubjectColumns;
});