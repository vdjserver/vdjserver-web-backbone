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
                        'name':  '',
                        'project_title': '',
                        'description': '',
                        'project_type': '',
                        'inclusion_exclusion_criteria': '',
                        'grant_agency': '',
                        'grants': '',
                        'pi_name': '',
                        'pi_institution': '',
                        'pi_email': '',
                        'contact_name': '',
                        'contact_institution': '',
                        'contact_email': '',
                        'biomaterial_provider': '',
                        'collected_by': '',
                        'uploaded_by': '',
                        'publications': '',
                        'pub_ids': '',
                        'ncbi_bioproject': '',
                        'showArchivedJobs': false
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
                options.authType = 'basic';

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

        publishProject: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'PUT',
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.get('uuid') + '/publish'
            });

            return jqxhr;
        },

        unpublishProject: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'PUT',
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.get('uuid') + '/unpublish'
            });

            return jqxhr;
        },

        addUserToProject: function(username) {

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: this.get('uuid'),
                    username: username
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            });

            return jqxhr;
        },
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
});
