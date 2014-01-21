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
        parse: function(response) {
           console.log("response is: " + JSON.stringify(response));

            if (response.result) {
                for (var i = 0; i < response.result.length; i++) {
                    response.result[i].uuid = this.uuid;
                };

                response = response.result;
            }


            return response;
        }

    });

    Backbone.Agave.Collection.ProjectUsers = ProjectUsers;
    return ProjectUsers;
})(this);
