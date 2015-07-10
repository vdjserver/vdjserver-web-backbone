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

                    $.fn.dataTableExt.oApi.fnFilterAll = function(oSettings, sInput, iColumn, bRegex, bSmart) {
                        var settings = $.fn.dataTableSettings;

                        for (var i = 0; i < settings.length; i++) {
                            settings[i].oInstance.fnFilter(sInput, iColumn, bRegex, bSmart);
                        }
                    };

                    var communityTable = that.$('#community').dataTable({
                        responsive: true,
                        pageLength: 10,
                    });

                    that.$('#searchAll').keyup(function() {
                        communityTable.fnFilterAll(this.value);
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

                    $.fn.dataTableExt.oApi.fnFilterAll = function(oSettings, sInput, iColumn, bRegex, bSmart) {
                        var settings = $.fn.dataTableSettings;

                        for (var i = 0; i < settings.length; i++) {
                            settings[i].oInstance.fnFilter(sInput, iColumn, bRegex, bSmart);
                        }
                    };

                    var community1 = that.$('#community-detail').dataTable({
                        responsive: true,
                        bPaginate: false,
                        bInfo: false,
                        bSort: false,
                    });

                    that.$('#searchAll').keyup(function() {
                        community1.fnFilterAll(this.value);
                    });

                    var community2 = that.$('#community2').dataTable({
                        bPaginate: false,
                        responsive: true,
                        pageLength: 20,
                        bInfo: false,
                        bLengthChange: false,
                    });

                    that.$('#searchAll').keyup(function() {
                        community2.fnFilterAll(this.value);
                    });

                })
                ;
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
