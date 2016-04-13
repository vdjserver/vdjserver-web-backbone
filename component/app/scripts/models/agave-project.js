define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var Project = {};

    Project = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'project',
                    owner: '',
                    value: {
                        'name':  ''
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
                options.url = '/projects';

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

    Backbone.Agave.Model.Project = Project;
    return Project;
});
