/*global describe, it */

define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Accounts)', function()  {
        this.timeout(5000);

        it('Agave should exist', function() {
            var agave = new Backbone.Agave();
            should.exist(agave);
        });

        it('Auth token model should exist', function() {
            var authTokenModel = new Backbone.Agave.Auth.Token();
            should.exist(authTokenModel);
        });

        it('Should perform login', function(done) {

            should.exist(App);
            App.init();

            should.exist(App.Agave);

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // TODO: need to pull this in from config/env
            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
            };

            model.save(formData, {password: formData.password})
                .then(function(doneModel) {
                    //assert.strictEqual(jqXHR.statusCode, 200);

                    assert.isDefined(model.get('access_token'));
                    assert.isDefined(model.get('expires'));
                    assert.isDefined(model.get('expires_in'));
                    assert.isDefined(model.get('refresh_token'));
                    assert.isDefined(model.get('token_type'));
                    assert.isDefined(model.get('username'));
                    assert.isDefined(model.get('password'));
                    assert.equal(model.get('token_type'), 'bearer');
                    assert.equal(model.get('username'), formData.username);
                    assert.equal(model.get('password'), formData.password);

                    console.log("token is: " + JSON.stringify(model));

                    var projectUuid = '9057880830218530330-242ac11b-0001-012';
                    var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: projectUuid});
                    return projectFiles.fetch()
                        .then(function() {
                            console.log('Got projectFiles');
                            console.log(projectFiles);
                            done();
                        })
                        .fail(function(error) {
                            console.log(error);
                        });

                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

    });

});
