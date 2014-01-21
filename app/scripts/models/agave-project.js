(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    var _ = window._;

    var Project = {};

    Project = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'project',
                    value: {
                        'name':  '',
                        'files': []
                    }
                }
            );
        },
        initialize: function() {
            this.users = new Backbone.Agave.Collection.Permissions();
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        addUserToProject: function(username) {

            //var users = _.uniq(this.get('users'));
            var users = this.get('users');

            if (! _.contains(users, username)) {
                users.push(username);

                this.set('users', users);
            }



        },
        removeUserFromProject: function(username) {

            var users = this.get('users');

            if (_.contains(users, username)) {
                users = _.without(users, username);

                this.set('users', users);
            }
        }
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
})(this);
