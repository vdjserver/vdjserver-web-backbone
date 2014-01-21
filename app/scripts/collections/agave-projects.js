(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Projects = {};

    Projects = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.Project,
        url: function() {
            return '/meta/v2/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"project"}');
        }
    });

    Backbone.Agave.Collection.Projects = Projects;
    return Projects;
})(this);
