(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Project = {};

    Project = Agave.MetadataModel.extend({
        defaults: _.extend(
            {}, 
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'project',
                value: {
                    firstName: '',
                    lastName:  '',
                    email:     '',
                    city:      '',
                    state:     ''
                }
            }
        ),
        url: function() {
            return '/meta/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"project"}');
        }
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
})(this);
