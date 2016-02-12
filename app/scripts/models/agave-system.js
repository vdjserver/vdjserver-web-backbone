define(['backbone'], function(Backbone) {

    'use strict';

    var System = {};

    System = Backbone.Agave.Model.extend({
        defaults: {
            'id': '',
            'name': '',
            'default': false,
            'description': '',
            'public': false,
            'status': 'UP',
            'type': '',
        },
        url: function() {
            return '/systems/v2/' + this.get('id');
        },
    });

    Backbone.Agave.Model.System = System;
    return System;
});
