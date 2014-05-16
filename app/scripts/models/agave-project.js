define(['backbone'], function(Backbone) {

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
        initialize: function() {
            /*
            this.users = new Backbone.Agave.Collection.ProjectUsers();

            var that = this;
            this.on('change add', function() {

                var uuid = that.get('uuid');
                var owner = that.get('owner');
                if (uuid) {
                    that.users.setUuid(uuid);
                    that.users.setOwner(owner);
                }
            });
            */
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        sync: function(method, model, options) {

            if (this.get('uuid') === '') {
                options.apiRoot = Backbone.Agave.vdjauthRoot;
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

            return Backbone.Agave.MetadataSync(method, this, options);
        }
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
});
