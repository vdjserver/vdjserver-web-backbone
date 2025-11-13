//
// admin-repository.js
// Administration of data repository
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Ryan C. Kennedy
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import { ADCStatus } from 'Scripts/models/admin-vdjserver';

import template_buttons from 'Templates/admin/admin-repository-buttons.html';
var AdminButtonView = Marionette.View.extend({
    template: Handlebars.compile(template_buttons),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        var query_collection = '???';
        var load_collection = '???';
        var collections = this.controller.getCollections()
        query_collection = collections.queryCollection();
        load_collection = collections.loadCollection();

        return {
            query_collection: query_collection,
            load_collection: load_collection,
            //current_sort: current_sort,
        }
    },
});

import template_stats from 'Templates/admin/admin-repository-stats.html';
var AdminStatsView = Marionette.View.extend({
    template: Handlebars.compile(template_stats),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },
/*
    templateContext() {
        var query_collection = '???';
        var load_collection = '???';
        if (this.controller.adcStatus) {
            query_collection = this.controller.adcStatus.get('query_collection');
            load_collection = this.controller.adcStatus.get('load_collection');
        }

        return {
            query_collection: query_collection,
            load_collection: load_collection,
            //current_sort: current_sort,
        }
    },*/
});

import template from 'Templates/admin/admin-repository.html';
var RepositoryLoadView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
      // our controller
      if (parameters && parameters.controller) {
          this.controller = parameters.controller;
          this.loaded_mode = parameters.loaded_mode;
      }
    },

    templateContext: function() {
      var loaded_mode, inACollection, show_0, show_1, enable_0, enable_1;
      var collection_0, collection_1, isLoaded_0, isLoaded_1;
      var repertoireMetadataLoaded_0, repertoireMetadataLoaded_1;
      var rearrangementDataLoaded_0, rearrangementDataLoaded_1;
      loaded_mode = inACollection = show_0 = show_1 = enable_0 = enable_1 = false;
      collection_0 = collection_1 = isLoaded_0 = isLoaded_1 = false;
      repertoireMetadataLoaded_0 = repertoireMetadataLoaded_1 = false;
      rearrangementDataLoaded_0 = rearrangementDataLoaded_1 = false;
      if(this.model.load_0 != null) {
        this.collection_0 = this.model.load_0.get('value').collection;
        if(this.collection_0.length > 0) {
          this.inACollection = true;
          this.show_0 = true;
        }
        if(this.model.load_0.get('value').shouldLoad) {
          this.enable_0 = false;
        } else {
          this.enable_0 = true;
        }
        if(this.model.load_0.get('value').isLoaded) {
          this.isLoaded_0 = "Loaded";
          this.loaded_mode = true;
        } else {
          this.isLoaded_0 = "Not Loaded";
          this.loaded_mode = false;
        }
        if(this.model.load_0.get('value').repertoireMetadataLoaded) {
          this.repertoireMetadataLoaded_0 = "True";
        } else {
          this.repertoireMetadataLoaded_0 = "False";
        }
        if(this.model.load_0.get('value').rearrangementDataLoaded) {
          this.rearrangementDataLoaded_0 = "True";
        } else {
          this.rearrangementDataLoaded_0 = "False";
        }
      } else {
        this.show_0 = false;
      }

      if(this.model.load_1 != null) {
        this.collection_1 = this.model.load_1.get('value').collection;
        if(this.collection_1.length > 0) {
          this.inACollection = true;
          this.show_1 = true;
        }
        if(this.model.load_1.get('value').shouldLoad) {
          this.enable_1 = false;
        } else {
          this.enable_1 = true;
        }
        if(this.model.load_1.get('value').isLoaded) {
          this.isLoaded_1 = "Loaded";
          this.loaded_mode = true;
        } else {
          this.isLoaded_1 = "Not Loaded";
          this.loaded_mode = false;
        }
        if(this.model.load_1.get('value').repertoireMetadataLoaded) {
          this.repertoireMetadataLoaded_1 = "True";
        } else {
          this.repertoireMetadataLoaded_1 = "False";
        }
        if(this.model.load_1.get('value').rearrangementDataLoaded) {
          this.rearrangementDataLoaded_1 = "True";
        } else {
          this.rearrangementDataLoaded_1 = "False";
        }
      } else {
        this.show_1 = false;
      }
      if(!this.inACollection) {
        this.show_0 = false; this.show_1 = false;
        this.loaded_mode = false;
      }

    console.log(this.model.get('uuid'));
    if (this.model.get('uuid') == '1002552565004824085-242ac117-0001-012')
        console.log(this.model);

      this.show_0 = true;
      this.show_1 = true;
      return {
          loaded_mode: this.loaded_mode,
          inACollection: this.inACollection,
          show_0: this.show_0,
          show_1: this.show_1,
          enable_0: this.enable_0,
          enable_1: this.enable_1,
          collection_0: this.collection_0,
          collection_1: this.collection_1,
          isLoaded_0: this.isLoaded_0,
          isLoaded_1: this.isLoaded_1,
          repertoireMetadataLoaded_0: this.repertoireMetadataLoaded_0,
          repertoireMetadataLoaded_1: this.repertoireMetadataLoaded_1,
          rearrangementDataLoaded_0: this.rearrangementDataLoaded_0,
          rearrangementDataLoaded_1: this.rearrangementDataLoaded_1,
      }
    },

    events: {
        'click #admin-load-repo': 'loadRepo',
        'click #admin-unload-repo': 'unloadRepo',
        'click #admin-unpublish-project': 'unpublishProject',
        'click #admin-reload-project': 'reloadProject',
        'click #admin-enableLoad_0_mode': 'enableLoad_0',
        'click #admin-disableLoad_0_mode': 'disableLoad_0',
        'click #admin-enableLoad_1_mode': 'enableLoad_1',
        'click #admin-disableLoad_1_mode': 'disableLoad_1',
    },

    //
    // Load sequence
    //
    loadRepo: function(e) {
        e.preventDefault();
        console.log("Clicked Load");

        this.load_message = new MessageModel({
            'header': 'Load Project into ADC',
            'body': '<div>Are you sure you want to load the project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'load';
        var view = new ModalView({model: this.load_message});
        App.AppController.startModal(view, this, this.onShownLoadModal, this.onHiddenLoadModal);
        $('#modal-message').modal('show');
    },

    // sent to server after the modal is shown
    onShownLoadModal: function(context) {
        console.log('load: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenLoadModal: function(context) {
        console.log('load: Hide the modal');
        if (context.modalState == 'load') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.load_message.get('status') != 'confirm') return;

            // load project
            context.model.loadProject()
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Load Project into ADC',
                    'body':   'Project has been successfully flagged for loading!',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenLoadSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Load Project into ADC',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while loading project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenLoadSuccessModal: function(context) {
        console.log('load success: Hide the modal');
        this.load_message = null;

        // TODO: should refresh
    },

    //
    // Unload sequence
    //
    unloadRepo: function(e) {
        console.log("Clicked Unload");
        e.preventDefault();

        this.unload_message = new MessageModel({
            'header': 'Unload Project from ADC',
            'body': '<div>Are you sure you want to unload the project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'unload';
        var view = new ModalView({model: this.unload_message});
        App.AppController.startModal(view, this, this.onShownUnloadModal, this.onHiddenUnloadModal);
        $('#modal-message').modal('show');
    },

    // sent to server after the modal is shown
    onShownUnloadModal: function(context) {
        console.log('unload: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenUnloadModal: async function(context) {
        console.log('unload: Hide the modal');
        if (context.modalState == 'unload') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.unload_message.get('status') != 'confirm') return;

            // need load meta record for validation
            var load_meta = null;
            var collections = context.controller.getCollections();
            if (collections.loadCollection() == '_0') load_meta = context.model.load_0;
            if (collections.loadCollection() == '_1') load_meta = context.model.load_1;

            // unload project
            await context.model.unloadProject(load_meta)
                .catch(function(error) {
                    // save failed so show error modal
                    context.modalState = 'fail';

                    // prepare a new modal with the failure message
                    var message = new MessageModel({
                        'header': 'Unload Project into ADC',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while unloading project!</div>',
                        cancelText: 'Ok',
                        serverError: error
                    });

                    var view = new ModalView({model: message});
                    App.AppController.startModal(view, null, null, null);
                    $('#modal-message').modal('show');
                });
            if (context.modalState == 'fail') return;

            // prepare a new modal with the success message
            var message = new MessageModel({
                'header': 'Unload Project into ADC',
                'body':   'Project has been successfully flagged for unloading!',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenUnloadSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenUnloadSuccessModal: function(context) {
        console.log('unload success: Hide the modal');
        this.unload_message = null;

        // TODO: should refresh
    },

    //
    // Unpublish sequence
    //
    unpublishProject: function(e) {
        console.log("Unpublish Project button clicked");

        this.publish_message = new MessageModel({
            'header': 'Unpublish a Project',
            'body': '<div>Are you sure you want to unpublish the project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'publish';
        var view = new ModalView({model: this.publish_message});
        App.AppController.startModal(view, this, this.onShownUnpublishModal, this.onHiddenUnpublishModal);
        $('#modal-message').modal('show');
    },

    // sent to server after the modal is shown
    onShownUnpublishModal: function(context) {
        console.log('unpublish: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenUnpublishModal: function(context) {
        console.log('unpublish: Hide the modal');
        if (context.modalState == 'publish') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.publish_message.get('status') != 'confirm') return;

            // publish project
            context.model.unpublishProject()
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Unpublish Project',
                    'body':   'Project has been successfully unpublished!',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenUnpublishSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Unpublish Project',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while unpublishing project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenUnpublishSuccessModal: function(context) {
        console.log('unpublish success: Hide the modal');
        this.publish_message = null;

        // TODO: should refresh
    },

    //
    // Reload sequence
    //
    reloadProject: function(e) {
        e.preventDefault();
        console.log(this.model);
        console.log("Clicked Reload");
        var collections = this.controller.getCollections();

        this.reload_message = new MessageModel({
            'header': 'Reload Study Metadata into collection: ' + collections.loadCollection(),
            'body': '<div>Are you sure you want to reload the project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'reload';
        var view = new ModalView({model: this.reload_message});
        App.AppController.startModal(view, this, this.onShownReloadModal, this.onHiddenReloadModal);
        $('#modal-message').modal('show');
    },

    // project publish is sent to server after the modal is shown
    onShownReloadModal: function(context) {
        console.log('reload: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenReloadModal: async function(context) {
        console.log('reload: Hide the modal');
        if (context.modalState == 'reload') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.reload_message.get('status') != 'confirm') return;

            // need load meta record for validation
            var load_meta = null;
            var collections = context.controller.getCollections();
            if (collections.loadCollection() == '_0') load_meta = context.model.load_0;
            if (collections.loadCollection() == '_1') load_meta = context.model.load_1;

            // reload project
            await context.model.reloadProject(load_meta)
                .catch(function(error) {
                    // save failed so show error modal
                    context.modalState = 'fail';

                    // prepare a new modal with the failure message
                    var message = new MessageModel({
                        'header': 'Reload Study Metadata',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while reloading project!</div>',
                        cancelText: 'Ok',
                        serverError: error
                    });

                    var view = new ModalView({model: message});
                    App.AppController.startModal(view, null, null, null);
                    $('#modal-message').modal('show');
                });
            if (context.modalState == 'fail') return;

            context.modalState = 'pass';

            // prepare a new modal with the success message
            var message = new MessageModel({
                'header': 'Reload Study Metadata into collection: ' + collections.loadCollection(),
                'body':   'Project has been successfully queued for reload!',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenReloadSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenReloadSuccessModal: function(context) {
        console.log('reload success: Hide the modal');
        this.reload_message = null;
    },

    enableLoad_0: function(e) {
        e.preventDefault();
        console.log("Clicked Enable Load_0");
    },
    disableLoad_0: function(e) {
        e.preventDefault();
        console.log("Clicked Disable Load_0");
    },
    enableLoad_1: function(e) {
        e.preventDefault();
        console.log("Clicked Enable Load_1");
    },
    disableLoad_1: function(e) {
        e.preventDefault();
        console.log("Clicked Disable Load_1");
    },
});

var RepositoryLoadListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
            this.loaded_mode = parameters.loaded_mode;
        }

        this.childView = RepositoryLoadView;
        this.childViewOptions = { controller: this.controller, loaded_mode: this.loaded_mode };
    },

    templateContext: function() {
        return {
            loaded_mode: this.loaded_mode,
        }
    },
});

//
// List of projects for load/unload in data repository
//
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="admin-repository-list"></div>'),

    // one region for the project content
    regions: {
        listRegion: '#admin-repository-list'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
            this.loaded_mode = parameters.loaded_mode;
        }

        // our child views
        var view = new RepositoryLoadListView({collection: parameters.collection, controller: this.controller, loaded_mode: this.loaded_mode});
        this.showChildView('listRegion', view);
        this.buttonsView = new AdminButtonView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);

        // toolbars
        // we want filter by default
        //showFilterToolbar('admin-respository-filter', true, null);
        // we want stats by default
        //showStatsToolbar('admin-repository-stats', true, null);
        //
    },

    templateContext: function() {
        return {
            loaded_mode: this.loaded_mode,
        }
    },

    events: {
        'click #admin-files-sort-select': 'sort' /*function(e) {
            // check it is a new sort
            var files = this.controller.getPairedList();
            var current_sort = files['sort_by'];
            if (e.target.name != current_sort) {
                this.controller.applySort(e.target.name);
                this.updateHeader();
            }
        }*/,
        'click #admin-refresh': 'refresh',
        'click #admin-reload-all': 'reloadAll',
        'click #admin-enable-adc': 'enableADC',
        'click #admin-disable-adc': 'disableADC',
    },

    updateHeader: function() {
        this.buttonsView = new AdminButtonView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    sort: function(e) {
        e.preventDefault();
        console.log("Clicked Sort By");
    },
    refresh: function(e) {
        e.preventDefault();
        console.log("Clicked Refresh");
    },
    enableDownloadCache: function(e) {
        e.preventDefault();
        console.log("Clicked Enable ADC Download Cache");
    },
    disableDownloadCache: function(e) {
        e.preventDefault();
        console.log("Clicked Disable ADC Download Cache");
    },
    enableADC: function(e) {
        e.preventDefault();
        console.log("Clicked Enable ADC Repository");
    },
    disableADC: function(e) {
        e.preventDefault();
        console.log("Clicked Disable ADC Repository");
    },

    //
    // Reload all sequence
    //
    reloadAll: function(e) {
        e.preventDefault();
        console.log("Clicked reloadAll");

        var collections = this.controller.getCollections();
        var reload_cnt = 0;
        for (let i = 0; i < collections['publicProjectList'].length; ++i) {
            let project = collections['publicProjectList'].at(i);
            let load_meta = null;
            if (collections.loadCollection() == '_0') load_meta = project.load_0;
            if (collections.loadCollection() == '_1') load_meta = project.load_1;
            if (!load_meta) continue;
            else reload_cnt += 1;
        }

        this.reload_message = new MessageModel({
            'header': 'Reload All Study Metadata into Collection: ' + collections.loadCollection(),
            'body': '<div>Are you sure you want to reload all (' + reload_cnt + ') projects?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'reload';
        var view = new ModalView({model: this.reload_message});
        App.AppController.startModal(view, this, null, this.onHiddenReloadAllModal);
        $('#modal-message').modal('show');
    },

    onHiddenReloadAllModal: async function(context) {
        console.log('reloadAll: Hide the modal');
        if (context.modalState == 'reload') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.reload_message.get('status') != 'confirm') return;

            // display wait modal while we process
            var message = new MessageModel({
              'header': 'Reload All Study Metadata',
              'body':   '<p>Please wait while we send the reload requests...</p>'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, context.onShownReloadAllModal, null);
            $('#modal-message').modal('show');
        }
    },

    onShownReloadAllModal: async function(context) {
        console.log('reloadAll: Show the modal');
        if (context.modalState == 'reload') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.reload_message.get('status') != 'confirm') return;

            // perform reload for each project
            var collections = context.controller.getCollections();
            console.log(collections['publicProjectList']);
            for (let i = 0; i < collections['publicProjectList'].length; ++i) {
                let project = collections['publicProjectList'].at(i);
                let load_meta = null;
                if (collections.loadCollection() == '_0') load_meta = project.load_0;
                if (collections.loadCollection() == '_1') load_meta = project.load_1;
                if (!load_meta) continue;

                await project.reloadProject(load_meta)
                    .catch(function(error) {
                        // save failed so show error modal
                        context.modalState = 'fail';
                        $('#modal-message').modal('hide');

                        // prepare a new modal with the failure message
                        var message = new MessageModel({
                            'header': 'Reload All Study Metadata',
                            'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while reloading projects!</div>',
                            cancelText: 'Ok',
                            serverError: error
                        });

                        var view = new ModalView({model: message});
                        App.AppController.startModal(view, null, null, null);
                        $('#modal-message').modal('show');
                    });
                if (context.modalState == 'fail') return;
            }

            context.modalState = 'pass';
            $('#modal-message').modal('hide');

            // prepare a new modal with the success message
            var message = new MessageModel({
                'header': 'Reload All Study Metadata into Collection: ' + collections.loadCollection(),
                'body':   'Projects have been successfully queued for reload!',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenReloadAllSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenReloadAllSuccessModal: function(context) {
        console.log('reloadAll success: Hide the modal');
        this.reload_message = null;
    },
});

