(function (window) { 

    'use strict';
    
    var Backbone = window.Backbone;                                           
    //var $ = window.$;                                                       
    //var _ = window._;                                                       
                                                                              
    var Vdj = Backbone.Vdj;                                               
                                                                              
    var Account = Vdj.Account = {}; 

    Account.New = Vdj.Model.extend({
        defaults: {
            internalUsername: '',
            password: '',
            email:    ''
        },
        url: function() {
            return '/user';
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
        }
    });

    return Account;                                                              

})(this);
