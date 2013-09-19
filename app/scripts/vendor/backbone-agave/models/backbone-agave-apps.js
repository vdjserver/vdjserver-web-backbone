/**
  * Backbone Agave Apps
  * Version 0.1
  *
  */
(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Apps = Agave.Apps = {};

    Apps.Application = Agave.Model.extend({
        defaults: {
            'name':null
        },
        urlRoot: '/apps-v1/apps/'
    });

    Apps.PublicApplications = Agave.Collection.extend({
        model: Apps.Application,
        url: '/apps-v1/apps/list',
        requiresAuth: false,
        comparator: function(app) {
            return app.get('name').toLowerCase();
        }
    });

    Apps.PublicApplicationsNamed = Agave.Collection.extend({
        model: Apps.Application,
        requiresAuth: false,
        url: function() {
            return '/apps-v1/apps/name/' + this.name;
        }
    });

    Apps.PublicApplicationsTagged = Agave.Collection.extend({
        model: Apps.Application,
        requiresAuth: false,
        url: function() {
            return '/apps-v1/apps/tag/' + this.tag;
        }
    });

    Apps.PublicApplicationsTermed = Agave.Collection.extend({
        model: Apps.Application,
        requiresAuth: false,
        url: function() {
            return '/apps-v1/apps/term/' + this.term;
        }
    });

    Apps.SharedApplications = Agave.Collection.extend({
        model: Apps.Application,
        url: '/apps-v1/apps/shared/list'
    });

    Apps.SharedApplicationsNamed = Agave.Collection.extend({
        model: Apps.Application,
        url: function() {
            return '/apps-v1/apps/shared/name/' + this.name;
        }
    });

    Apps.SharedApplicationsTagged = Agave.Collection.extend({
        model: Apps.Application,
        url: function() {
            return '/apps-v1/apps/shared/tag/' + this.tag;
        }
    });

    Apps.SharedApplicationsTermed = Agave.Collection.extend({
        model: Apps.Application,
        url: function() {
            return '/apps-v1/apps/shared/term/' + this.term;
        }
    });

    return Apps;
})(this);
