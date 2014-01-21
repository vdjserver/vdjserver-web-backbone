(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var ProjectUsers = {};

    ProjectUsers = Backbone.Agave.Collection.extend({
        initialize: function() {
            this.uuid = '';
        },
        setUuid: function(uuid) {
            this.uuid = uuid;
        },
        getUuid: function() {
            return this.uuid;
        },
        model: Backbone.Agave.Model.ProjectUser,
        url: function() {
            return '/meta/v2/data/' + this.uuid + '/pems';
        },
        addUserToProject: function(username) {

            var newUser = new Backbone.Agave.Model.ProjectUser();
            newUser.set({username: username});
            




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

    Backbone.Agave.Collection.ProjectUsers = ProjectUsers;
    return ProjectUsers;
})(this);
