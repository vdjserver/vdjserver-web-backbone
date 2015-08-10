define([
    'app',
    'environment-config',
    'recaptcha-ajax',
    'backbone.syphon',
], function(
    App,
    EnvironmentConfig
) {

    'use strict';

    var Community = {};

    Community.Index = Backbone.View.extend({
        template: 'community/index',

        events: {
            'click .paginate_button' : 'switchPage',
        },

        initialize: function() {
            this.communityDatas = new Backbone.Agave.Collection.CommunityDatas();
        },

        startChart: function() {

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);
            loadingView.render();

            var that = this;

            this.communityDatas.fetch()
                .then(function() {
                    return that.render();
                })
                .then(function() {
                    loadingView.remove();
                    var communityTable = that.$('#community').dataTable({
                        responsive: {details: false},
                        pageLength: 10,
                    });
                    
                    that.$('#community-search').keyup(function() {
                        communityTable.fnFilter(this.value);
                    });
                })
                ;
        },

        serialize: function() {
            return {
                communityDatas: this.communityDatas.toJSON(),
            };
        },
    });

    Community.Detail = Backbone.View.extend({
        template: 'community/detail',

        events: {
            'click .paginate_button' : 'switchPage',
        },

        initialize: function(parameters) {
            this.communityProject = new Backbone.Agave.Model.CommunityData();

            if (parameters.hasOwnProperty('communityDataId')) {
                this.communityProject.set('uuid', parameters.communityDataId);
            }
        },

        startChart: function() {

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);
            loadingView.render();

            var that = this;

            this.communityProject.fetch()
                .then(function() {
                    return that.render();
                })
                .then(function() {
                    loadingView.remove();
                    var communityProject = that.$('#community-project').dataTable({
                        responsive: {details: false},
                        bPaginate: false,
                        bInfo: false,
                        bSort: false,
                    });

                    var communityProjectExperiments = that.$('#community-project-experiments').dataTable({
                        bPaginate: false,
                        responsive: {details: false},
                        pageLength: 20,
                        bInfo: false,
                        bLengthChange: false,
                    });

                    that.$('#community-project-search').keyup(function() {
                        communityProjectExperiments.fnFilter(this.value);
                    });
                });
        },

        serialize: function() {
            return {
                communityData: this.communityProject.toJSON(),
            };
        },
    });

    App.Views.Community = Community;
    return Community;
});
