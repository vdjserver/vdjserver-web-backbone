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

    var CommunityProject = {};

    CommunityProject.Index = Backbone.View.extend({
        template: 'community/community-project',

        events: {
            'click .paginate_button' : 'switchPage',
        },

        initialize: function() {
            this.communityProject = new Backbone.Agave.Collection.CommunityDatas();
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
                community: this.communityProject.toJSON(),
            };
        },
    });

    App.Views.CommunityProject = CommunityProject;
    return CommunityProject;
});
