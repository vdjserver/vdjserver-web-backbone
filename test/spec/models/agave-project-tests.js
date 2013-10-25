/*global describe, it */

define(['app', 'agave-project'], function() {

    'use strict';

    describe('Agave Project Tests', function()  {

        it('Agave Project model should exist', function() {
            var model = new Backbone.Agave.Model.Project();
            should.exist(model);
        });

    });

})();
