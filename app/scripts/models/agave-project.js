(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    var _ = window._;

    var Agave = Backbone.Agave;

    var Project = {};

    Project = Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Agave.MetadataModel.prototype.defaults,
                {
                    name: 'project',
                    value: {
                        'name':  '',
                        'users': [],
                        'files': []
                    }
                }
            );
        },
        url: function() {
            return '/meta/2.0/data/' + this.get('uuid');
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
