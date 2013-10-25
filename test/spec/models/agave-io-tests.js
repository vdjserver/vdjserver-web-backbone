/*global describe, it */

define(['app', 'agave-io'], function() {

    'use strict';

    describe('Agave IO Tests', function()  {

        it('Agave IO File model should exist', function() {
            var model = new Backbone.Agave.IO.File();
            should.exist(model);
        });

        it('Agave IO File Permissions model should exist', function() {
            var model = new Backbone.Agave.IO.FilePermissions();
            should.exist(model);
        });

        it('Agave IO File Browser collection should exist', function() {
            var collection = new Backbone.Agave.IO.Listing();
            should.exist(collection);
        });

        it('Agave IO File Share model should exist', function() {
            var model = new Backbone.Agave.IO.Share();
            should.exist(model);
        });
    });

})();
