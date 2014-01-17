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
        }
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
})(this);
