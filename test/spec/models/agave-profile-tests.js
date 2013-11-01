/*global describe, it */

define(['app', 'agave-profile'], function() {

    'use strict';

    describe('Agave Profile Tests', function()  {

        it('Agave Profile model should exist', function() {
            var model = new Backbone.Agave.Model.Profile();
            should.exist(model);
        });

    });

});
