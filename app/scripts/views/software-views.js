define([
    'app',
], function(App) {

    'use strict';

    var Software = {};

    Software.Index = Backbone.View.extend({
        template: 'software/index',
        events: {
            'click #vdjml-link': 'openVdjmlLink',
        },
        openVdjmlLink: function(e) {
            e.preventDefault();

            window.open('https://vdjserver.org/vdjml');
        },
    });

    App.Views.Software = Software;
    return Software;
});
