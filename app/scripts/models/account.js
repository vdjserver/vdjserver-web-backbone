define(['app'], function(App){

    var AccountModels = {};

    AccountModels.NewAccount = Backbone.Model.extend({
        /*
        initialize: function(parameters) {

            if (parameters &&
                parameters.newsId)
            {
                this.newsId = parameters.newsId;
            }

        },
        */
        defaults: {
            username: "",
            password: "",
            email:    ""
        },
        url: function() {
            console.log("NewAccount model url is: " + Backbone.Agave.vdjAuthRoot + '/user');
            return Backbone.Agave.vdjApiRoot + '/user';
        },
        parse: function(response) {
            console.log("account response is: " + JSON.stringify(response));
            return response.result;
        }
        /*
        ,
        fetch: function() {
            var self = this;
            $.getJSON(this.url(), function(response) {
                self.set(response.item);
            });
        }
        */
    });


    App.Models.Account = AccountModels;
    return AccountModels;
});

