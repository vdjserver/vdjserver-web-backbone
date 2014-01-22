(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var ProjectUsers = {};

    ProjectUsers = Backbone.Agave.Collection.extend({
        initialize: function() {
            this.uuid = '';
            this.owner = '';
        },
        comparator: 'username',
        getUuid: function() {
            return this.uuid;
        },
        setUuid: function(uuid) {
            this.uuid = uuid;
        },
        getOwner: function() {
            return this.owner; 
        },
        setOwner: function(owner) {
            this.owner = owner;
        },
        model: Backbone.Agave.Model.ProjectUser,
        url: function() {
            return '/meta/v2/data/' + this.uuid + '/pems';
        },
        parse: function(response) {

            if (response.result) {
                for (var i = 0; i < response.result.length; i++) {
                    response.result[i].uuid = this.uuid;


                    if (response.result[i].username === this.owner) {
                        response.result[i].isOwner = true;
                    }
                    else {
                        response.result[i].isOwner = false;
                    }
                };

                response = response.result;
            }


            return response;
        }

    });

    Backbone.Agave.Collection.ProjectUsers = ProjectUsers;
    return ProjectUsers;
})(this);
