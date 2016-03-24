/*global describe, it */

define(['app', 'agave-projects'], function() {

    'use strict';

    describe('Agave Projects Tests', function()  {

        it('Agave Projects collection should exist', function() {
            var collection = new Backbone.Agave.Collection.Projects();
            should.exist(collection);
        });

    });

});
