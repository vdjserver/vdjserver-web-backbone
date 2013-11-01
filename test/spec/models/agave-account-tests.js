/*global describe, it */

define(['app', 'agave-account'], function() {

    'use strict';

    describe('Agave Account Tests', function()  {

        it('Agave Account model should exist', function() {
            var model = new Backbone.Agave.Model.Account();
            should.exist(model);
        });

    });

});
