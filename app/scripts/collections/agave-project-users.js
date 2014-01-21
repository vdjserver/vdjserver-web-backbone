(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var ProjectUsers = {};

    ProjectUsers = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.ProjectUser,
        url: function() {
            //return '/meta/v2/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"project"}');
        }
    });

    Backbone.Agave.Collection.ProjectUsers = ProjectUsers;
    return ProjectUsers;
})(this);
