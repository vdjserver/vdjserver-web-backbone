define([
    'app',
    'environment-config',
], function(
    App,
    EnvironmentConfig
) {

    'use strict';

    var Community = {};

    Community.Index = Backbone.View.extend({
        template: 'community/index',

        events: {
            'click .paginate_button': 'switchPage',
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
            'click .paginate_button': 'switchPage',
            'click .download-file': '_clickDownloadFile',
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
                        bInfo: false,
                        bPaginate: false,
                        bSort: false,
                        responsive: true,
                    });

                    var communityProjectExperiments = that.$('#community-project-experiments').dataTable({
                        bInfo: false,
                        bLengthChange: false,
                        bPaginate: false,
                        bSort: false,
                        pageLength: 20,
                        responsive: true,
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

        _clickDownloadFile: function(e) {
            e.preventDefault();

            var that = this;

            var uuid = e.target.dataset.uuid;
            var fileName = e.target.dataset.filename;
            var fileModel = new Backbone.Agave.Model.File.Community({
                relativeUrl: '//community'
                           + '/' + uuid
                           + '/files'
                           + '/' + fileName
                           ,
            });

            var progressWrapper = $('<div class="progress file-upload-progress-wrapper"></div>');
            var progressBar = $('<div class="progress-bar progress-striped active progress-bar-success"></div>');

            if ($(e.currentTarget).siblings('.progress').length) {
                $(e.currentTarget).siblings('.progress').remove();
            }

            $(e.currentTarget).after(progressWrapper.append(progressBar));

            fileModel.fetch()
                .then(function(response) {
                    var xhr = fileModel.downloadFileToDisk();
                    var totalSize = fileModel.get('length');

                    xhr.addEventListener(
                        'progress',
                        function(progress) {

                            var percentCompleted = 0;

                            if (progress.lengthComputable) {
                                percentCompleted = progress.loaded / progress.total;
                            }
                            else {
                                percentCompleted = progress.loaded / totalSize;
                            }

                            percentCompleted *= 100;
                            progressBar.attr('aria-valuenow', percentCompleted);
                            progressBar.attr('style', 'width:' + percentCompleted + '%');
                            progressBar.text(percentCompleted.toFixed(2) + '%');
                        },
                        false
                    );

                    xhr.addEventListener(
                        'load',
                        function() {},
                        false
                    );
                })
                .fail(function(error) {
                    progressBar.remove();
                    var errorMessage = $('<div class="text-warning text-center">Could not download file</div>');
                    progressWrapper.append(errorMessage);

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Collection.CommunityDatas.fetch()');
                    telemetry.set('view', 'Community.Detail');
                    telemetry.save();
                })
                ;
        }
    });

    App.Views.Community = Community;
    return Community;
});
