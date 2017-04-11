define([
    'app',
], function(App) {

    'use strict';

    var Sidemenu = {};

    Sidemenu.List = Backbone.View.extend(
        {
            template: 'sidemenu/list',
            initialize: function(parameters) {

                this.notificationViews = {};

                if (parameters && parameters.projectUuid) {
                    this.selectedProjectUuid = parameters.projectUuid;
                }

                if (parameters && parameters.section) {
                    this.activeSection = parameters.section;
                }

                if (parameters.shouldLoadViewForIndex && parameters.shouldLoadViewForIndex === true) {
                    this.shouldLoadViewForIndex = true;
                    this.fetchDone = false;
                }

                if (App.Routers.communityMode)
                    App.Datastore.Collection.ProjectCollection = new Backbone.Agave.Collection.Projects.Public();
                else
                    App.Datastore.Collection.ProjectCollection = new Backbone.Agave.Collection.Projects.Private();

                var loadingView = new App.Views.Util.Loading({keep: true});
                this.insertView(loadingView);
                loadingView.render();

                var that = this;

                App.Datastore.Collection.ProjectCollection.fetch()
                    .then(function() {
                        // Don't listen to sync until after the fetch
                        // Otherwise, paginated fetch could cause unwanted early sync events
                        App.Datastore.Collection.ProjectCollection.on('sync', function() {
                            var projects = App.Datastore.Collection.ProjectCollection.each(function(project) {

                                var projectUuid = project.get('uuid');

                                App.Instances.WebsocketManager.subscribeToEvent(projectUuid);
                            });
                        });
                    })
                    .then(function() {
                        loadingView.remove();
                    })
                    .then(function() {
                        App.Datastore.Collection.ProjectCollection.trigger('initialFetchComplete');
                    })
                    .then(function() {

                        App.Datastore.Collection.ProjectCollection.on('change add remove destroy', function() {
                            that.render();
                        });
                    })
                    .done(function() {

                        that.render();

                        that.fetchDone = true;

                        if (that.shouldLoadViewForIndex && that.shouldLoadViewForIndex === true) {
                            that.loadViewForIndex();
                        }
                    })
                    .fail(function(error) {
                        if (!App.Routers.communityMode) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Collection.Projects().fetch()');
                            telemetry.set('view', 'Sidemenu.List');
                            telemetry.save();

                            that.setupViews();
                        }
                    })
                    ;
            },
            serialize: function() {
                var routePath = 'project';
                if (App.Routers.communityMode) routePath = 'community';
                return {
                    projects: App.Datastore.Collection.ProjectCollection.toJSON(),
                    communityMode: App.Routers.communityMode,
                    routePath: routePath
                };
            },
            events: {
                'click .project-create-menu': '_collapseAllSubmenus',
                'click .project-submenu a': '_uiSetActiveSubmenu',
                /*
                'click .project-menu': [
                    '_uiClearActiveSubmenu',
                    '_setActiveMenu',
                ],
                */
                'click .project-menu': '_uiSetActiveMenu',
            },
            afterRender: function() {
                // UI update in case of reload
                if (this.selectedProjectUuid) {
                    this._uiSetProjectActive(this.selectedProjectUuid);
                    this._uiOpenProjectSubmenu(this.selectedProjectUuid);
                }

                if (this.activeSection) {
                    $('.' + this.selectedProjectUuid + '-section-' + this.activeSection).addClass('active');
                }
            },
            setSection: function(section) {
                this.activeSection = section;
            },
            uiSelectProject: function(projectUuid) {
                this.selectedProjectUuid = projectUuid;

                this._uiSetProjectActive(this.selectedProjectUuid);
                this._uiOpenProjectSubmenu(this.selectedProjectUuid);

                if (this.activeSection) {
                    this._uiClearActiveSubmenu();
                    $('.' + this.selectedProjectUuid + '-section-' + this.activeSection).addClass('active');
                }
            },
            loadViewForIndex: function() {
                if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                    App.router.navigate('/project/create', {
                        trigger: true
                    });
                }
                else {
                    var projectModel = App.Datastore.Collection.ProjectCollection.at(0);
                    if (App.Routers.communityMode) {
                        App.router.navigate('/community/' + projectModel.get('uuid'), {
                            trigger: true
                        });
                    } else {
                        App.router.navigate('/project/' + projectModel.get('uuid'), {
                            trigger: true
                        });
                    }
                }
            },

            addFileTransfer: function(projectUuid, fileUniqueIdentifier, filename) {

                var fileTransferListView = new App.Views.Notifications.FileTransfer({
                    fileUniqueIdentifier: fileUniqueIdentifier,
                    filename: filename,
                });

                this.notificationViews[fileUniqueIdentifier] = fileTransferListView;

                $('#project-' + projectUuid + '-notification').append(
                    '<div class="' + fileUniqueIdentifier + '-transfer-view"></div>'
                );

                this.setView(
                    '.' + fileUniqueIdentifier + '-transfer-view',
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

                //$('.' + projectUuid + '-data-menu').addClass('active');
            },
            _uiOpenProjectSubmenu: function(projectUuid) {
                $('.project-submenu').addClass('hidden');
                $('#project-' + projectUuid + '-menu').nextUntil('.project-menu').removeClass('hidden');
            },
            _uiClearActiveSubmenu: function() {
                $('.project-submenu').removeClass('active');
            },
            _uiSetActiveMenu: function(e) {
                e.preventDefault();

                this._uiClearActiveSubmenu();
                var uuid = e.target.dataset.id;
                $('.' + uuid + '-section-' + Sidemenu.List.Sections.ProjectFiles).addClass('active');
            },
            _uiSetActiveSubmenu: function(e) {
                e.preventDefault();

                this._uiClearActiveSubmenu();

                $(e.currentTarget).closest('.project-submenu').addClass('active');
            },
        },
        {
            'Sections': {
                'ProjectFiles': 1,
                'ProjectPairedReadAssociations': 2,
                'ProjectQualAssociations': 3,
                'ProjectSettings': 4,
                'ProjectManageUsers': 5,
                'ProjectAnalyses': 6,
                'ProjectMetadata': 7,
            },
        }
    );

    App.Views.Sidemenu = Sidemenu;
    return Sidemenu;
});
