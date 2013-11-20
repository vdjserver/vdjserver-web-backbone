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
                        'name': ''
                    }
                }
            );
        },
        idAttribute: 'uuid',
        url: function() {
            return '/meta/data/' + this.get('uuid');
        }
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
})(this);
