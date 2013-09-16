/*global describe, it */

define(['app'], function(App) {

    'use strict';

    describe('VDJBackbone Basic Functionality Tests', function()  {

        it('App should exist', function() {
            console.log("app is: " + App);
            should.exist(App);
        });

        it('New Account model should exist', function() {
            var accountModel = new App.Models.Account.NewAccount();
            should.exist(accountModel);
        });

        it('Profile model should exist', function() {
            var profileModel = new App.Models.Account.Profile();
            should.exist(profileModel);
        });

        it('Auth token model should exist', function() {
            var authTokenModel = new Backbone.Agave.Auth.Token();
            should.exist(authTokenModel);
        });

        /*
        it('Agave token model should exist', function() {
            var agaveTokenModel = App.Agave.token();
            should.exist(agaveTokenModel);
        });
        */

        it('Agave File IO Browser collection should exist', function() {
            var fileListing = new Backbone.Agave.IO.Listing();
            should.exist(fileListing);
        });

        it('test', function() {
            var backboneModel = new Backbone.Model();
            var agave = new Agave();
            should.exist(agave);
        });

    });

})();
