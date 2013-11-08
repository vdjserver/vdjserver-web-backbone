(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;
                                                                              
    var Project = {};

    Project = Agave.Model.extend({
        idAttribute: '_id',
        defaults: {
            name:       '',
            members:    []
            /*
            categories: [],
            created:    '',
            modified:   ''
            */
        },
        url: function() {
            if (this.id) {
                console.log('url scenario A. this is: ' + JSON.stringify(this));
                return '/project/' + this.id;
            }
            console.log('url scenario B. self is: ' + JSON.stringify(this));
            return '/project';
        }
    });

    Agave.Model.Project = Project;
    return Project;
})(this);
