/**
  * Backbone Agave Jobs
  * Version 0.1
  *
  */
(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var Agave = Backbone.Agave;

    var Jobs = Agave.Jobs = {};

    Jobs.Job = Agave.Model.extend({
        urlRoot: '/apps-v1/job',
        sync: function(method, model, options) {
            if (method === 'create') {
                options.emulateJSON = true;
                options.data = model.toJSON();
            }
            return Agave.sync(method, model, options);
        }
    });

    return Jobs;
})(this);
