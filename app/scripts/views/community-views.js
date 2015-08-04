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
            var that = this;

            this.communityDatas.fetch()
                .then(function() {
                    return that.render();
                })
                .then(function() {

                    var communityTable = that.$('#community').dataTable({
                        responsive: true,
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
            var that = this;

            this.communityProject.fetch()
                .then(function() {
                    return that.render();
                })
                .then(function() {

                    var communityProject = that.$('#community-project').dataTable({
                        responsive: true,
                        bPaginate: false,
                        bInfo: false,
                        bSort: false,
                    });

                    var communityProjectExperiments = that.$('#community-project-experiments').dataTable({
                        bPaginate: false,
                        responsive: true,
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
