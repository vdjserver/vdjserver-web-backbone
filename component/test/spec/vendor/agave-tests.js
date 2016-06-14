/*global describe, it */

define(['app', 'backbone-agave'], function(App) {

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

        it('Should perform login', function() {

            should.exist(App);
            App.init();

            should.exist(App.Agave);

            var model = App.Agave.token();

            console.log(model);
            App.Agave.destroyToken();

            // TODO: need to pull this in from config/env
            var formData = {
                username: '',
                password: ''
            };

            model.save(formData, {password: formData.password})
                .done(function() {

                    //assert.strictEqual(jqXHR.statusCode, 200);

                    var projectUuid = '9057880830218530330-242ac11b-0001-012';
                    var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: projectUuid});
                    projectFiles.fetch()
                        .then(function() {
                            console.log('Got projectFiles');
                            console.log(projectFiles);
                        })
                        .fail(function(error) {
                            console.log(error);
                        });

                });
        });

    });

});
