(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Projects = {};

    Projects = Agave.MetadataCollection.extend({
        model: Agave.Model.Project,
        url: function() {
            return '/meta/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"project"}');
        }
    });

    Backbone.Agave.Collection.Projects = Projects;
    return Projects;
})(this);
