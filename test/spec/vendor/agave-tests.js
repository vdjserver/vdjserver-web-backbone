/*global describe, it */

define(['app'], function(App) {

    'use strict';

    describe('Agave Tests', function()  {

        it('Agave should exist', function() {
            var agave = new Backbone.Agave();
            should.exist(agave);
        });

        it('Auth token model should exist', function() {
            var authTokenModel = new Backbone.Agave.Auth.Token();
            should.exist(authTokenModel);
        });

    });

})();
