(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    var _ = window._;

    var Project = {};

    Project = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'project',
                    value: {
                        'name':  '',
                        'files': []
                    }
                }
            );
        },
        initialize: function() {
            this.users = new Backbone.Agave.Collection.ProjectUsers();

            var that = this;
            this.on('change add', function() {

                var uuid = that.get('uuid');
                if (uuid) {
                    that.users.setUuid(uuid);
                }
            });
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        }
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
})(this);
