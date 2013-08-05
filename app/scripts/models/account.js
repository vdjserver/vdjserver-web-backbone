define(['app'], function(App){

    var AccountModels = {};

    AccountModels.NewAccount = Backbone.Model.extend({
        defaults: {
            internalUsername: "",
            password: "",
            email:    ""
        },
        url: function() {
            return Backbone.Agave.vdjApiRoot + '/user';
        },
        parse: function(response) {
            return response.result;
        }
    });


    AccountModels.Profile = Backbone.Model.extend({
        defaults: {
            firstName: "",
            lastName:  "",
            email:     "",
            city:      "",
            state:     ""
        },
        url: function() {
            return Backbone.Agave.vdjApiRoot + '/user/profile';
        },
        parse: function(response) {
            console.log("account response is: " + JSON.stringify(response));
            return response.result;
        }
    });


    App.Models.Account = AccountModels;
    return AccountModels;
});
