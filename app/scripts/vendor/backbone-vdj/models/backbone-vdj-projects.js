(function (window) { 

    'use strict';
    
    var Backbone = window.Backbone;                                           
    //var $ = window.$;                                                       
    //var _ = window._;                                                       
                                                                              
    var Vdj = Backbone.Vdj;                                               
                                                                              
    var Project = Vdj.Project = {}; 

    Project = Vdj.Model.extend({
        defaults: {
            name:       '',
            members:    [],
            categories: [],
            created:    '',
            modified:   ''
        },
        url: function() {
            return '/project';
        }
    });

    return Project;                                                              

})(this);
