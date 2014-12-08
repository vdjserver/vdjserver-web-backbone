define([
    'app',
], function(App) {

    'use strict';

    var Sidemenu = {};

    Sidemenu.List = Backbone.View.extend({
        template: 'sidemenu/list',
        initialize: function(parameters) {

            this.notificationViews = {};

            if (parameters && parameters.projectUuid) {
                this.selectedProjectUuid = parameters.projectUuid;
            }

            if (parameters.shouldLoadViewForIndex && parameters.shouldLoadViewForIndex === true) {
                this.shouldLoadViewForIndex = true;
                this.fetchDone = false;
            }

            App.Datastore.Collection.ProjectCollection = new Backbone.Agave.Collection.Projects();

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);
            loadingView.render();

            var that = this;

            App.Datastore.Collection.ProjectCollection.fetch()
                .done(function() {
                    loadingView.remove();

                    App.Datastore.Collection.ProjectCollection.on('change add remove destroy', function() {
                        that.render();
                    });

                    that.render();

                    that.fetchDone = true;

                    if (that.shouldLoadViewForIndex && that.shouldLoadViewForIndex === true) {
                        that.loadViewForIndex();
                    }
                })
                .fail(function() {

                });
        },
        serialize: function() {
            return {
                projects: App.Datastore.Collection.ProjectCollection.toJSON()
            };
        },
        events: {
            'click .project-create-menu': '_collapseAllSubmenus',
            'click .project-submenu a': '_uiSetActiveSubmenu',
            'click .project-menu': '_uiClearActiveSubmenu',
        },
        afterRender: function() {
            // UI update in case of reload
            if (this.selectedProjectUuid) {
                this._uiSetProjectActive(this.selectedProjectUuid);
                this._uiOpenProjectSubmenu(this.selectedProjectUuid);
            }
        },
        uiSelectProject: function(projectUuid) {
            this.selectedProjectUuid = projectUuid;

            this._uiSetProjectActive(this.selectedProjectUuid);
            this._uiOpenProjectSubmenu(this.selectedProjectUuid);
        },
        loadViewForIndex: function() {
            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                App.router.navigate('/project/create', {
                    trigger: true
                });
            }
            else {
                var projectModel = App.Datastore.Collection.ProjectCollection.at(0);
                App.router.navigate('/project/' + projectModel.get('uuid'), {
                    trigger: true
                });
            }
        },
        addNotification: function(jobNotification) {

            var jobNotificationView = new App.Views.Notifications.Job({
                notificationModel: jobNotification,
            });

            this.insertView(
                '#project-' + jobNotification.projectUuid + '-notification',
                jobNotificationView
            );

            jobNotificationView.render();
        },

        addFileTransfer: function(projectUuid, fileUniqueIdentifier, filename) {

            var fileTransferListView = new App.Views.Notifications.FileTransfer({
                fileUniqueIdentifier: fileUniqueIdentifier,
                filename: filename,
            });

            this.notificationViews[fileUniqueIdentifier] = fileTransferListView;

            this.insertView(
                '#project-' + projectUuid + '-notification',
                fileTransferListView
            );

            fileTransferListView.render();
        },

        removeFileTransfer: function(fileUniqueIdentifier) {

            if (fileUniqueIdentifier && this.notificationViews[fileUniqueIdentifier]) {

                var fileTransferView = this.notificationViews[fileUniqueIdentifier];

                fileTransferView.remove();
            }
        },

        // Private Methods
        _collapseAllSubmenus: function() {
            $('.project-menu').removeClass('active');
            $('.project-submenu').addClass('hidden');
        },
        _uiSetProjectActive: function(projectUuid) {
            $('.list-group-item').removeClass('active');
            $('#project-' + projectUuid + '-menu').addClass('active');
        },
        _uiOpenProjectSubmenu: function(projectUuid) {
            $('.project-submenu').addClass('hidden');
            $('#project-' + projectUuid + '-menu').nextUntil('.project-menu').removeClass('hidden');
        },
        _uiClearActiveSubmenu: function() {
            $('.project-submenu').removeClass('active');
        },
        _uiSetActiveSubmenu: function(e) {
            e.preventDefault();

            this._uiClearActiveSubmenu();

            $(e.currentTarget).closest('.project-submenu').addClass('active'); //css('background-color', 'green');
        },
    });

    App.Views.Sidemenu = Sidemenu;
    return Sidemenu;
});
