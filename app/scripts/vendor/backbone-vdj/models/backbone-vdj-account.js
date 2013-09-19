(function (window) { 


    'use strict';
    
    var Backbone = window.Backbone;                                           
    //var $ = window.$;                                                       
    //var _ = window._;                                                       
                                                                              
    var Vdj = Backbone.Vdj;                                               
                                                                              
    var Account = Vdj.Account = {}; 

    Account.New = Backbone.Model.extend({
        defaults: {
            internalUsername: '',
            password: '',
            email:    ''
        },
        url: function() {
            return Backbone.Agave.vdjApiRoot + '/user';
        },
        parse: function(response) {
            return response.result;
        }
    });


    Account.Profile = Vdj.Model.extend({
        defaults: {
            firstName: '',
            lastName:  '',
            email:     '',
            city:      '',
            state:     ''
        },
        url: function() {
            return '/user/profile';
        },
        parse: function(response) {
            console.log('account response is: ' + JSON.stringify(response));
            return response.result;
        }
    });


    return Account;                                                              
})(this);
