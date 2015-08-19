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
                        responsive: {details: false},
                    });

                    var communityProjectExperiments = that.$('#community-project-experiments').dataTable({
                        bInfo: false,
                        bLengthChange: false,
                        bPaginate: false,
                        bSort: false,
                        pageLength: 20,
                        responsive: {details: false},
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

        _clickDownloadFile: function(e){
          e.preventDefault();

          var that = this;

          var projectUuid = e.target.dataset.projectuuid;
          var fileName = e.target.dataset.filename;
          var fileModel = new Backbone.Agave.Model.File({
            relativeUrl: '//community' + '/' + projectUuid + '/files' + '/' + fileName,
            projectUuid: projectUuid
          });

          $('.progress').remove();

          var progressWrapper = $('<div class="progress file-upload-progress-wrapper"></div>');
          var progressBar = $('<div class="progress-bar progress-striped active progress-bar-success"></div>');

          $(e.target).after(progressWrapper.append(progressBar));

          fileModel.fetch()
            .then(function(response){
                var totalSize = fileModel.get('length');

                var xhr = that.downloadFileToDisk(fileModel);

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
                        progressBar.attr('aria-valuenow', percentCompleted)
                        progressBar.attr('style', 'width:'+percentCompleted+'%');
                        progressBar.text(percentCompleted.toFixed(2)+' %');
                    },
                    false
                );

                xhr.addEventListener(
                    'load',
                    function() {
                    },
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
        },

        downloadFileToDisk: function(file) {
            var path = '';

            path = EnvironmentConfig.agaveRoot
                 + '/files'
                 + '/v2'
                 + '/media'
                 + '/system'
                 + '/' + EnvironmentConfig.storageSystem
                 + '/' + file.get('path')
                 ;

            var xhr = new XMLHttpRequest();
            xhr.open(
                'get',
                path
            );

            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));

            xhr.onload = function() {
                if (this.status === 200 || this.status === 202) {
                    window.saveAs(
                        new Blob([this.response]),
                        file.get('name')
                    );
                }
            };

            xhr.send();

            return xhr;
        },
    });

    App.Views.Community = Community;
    return Community;
});
