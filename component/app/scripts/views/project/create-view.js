//
// create-view.js
// Create new project view
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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
import Syphon from 'backbone.syphon';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';

// AIRR Schema
import AIRRSchema from 'airr-schema';

// modal view for when the project is being created
import mm_template from 'Templates/util/modal-message.html';
var ModalMessage = Marionette.View.extend({
  template: Handlebars.compile(mm_template),
  region: '#modal'
});

// modal view for failure message
import mmc_template from 'Templates/util/modal-message-confirm.html';
var ModalMessageConfirm = Marionette.View.extend({
  template: Handlebars.compile(mmc_template),
  region: '#modal'
});

// project creation form
import create_template from 'Templates/project/create.html';
var CreateView = Marionette.View.extend({
  template: Handlebars.compile('<h1>Create New Project</h1>' + create_template),
  templateContext() {
      return {
          // pass as object
          airr_schema: this.model.airr_schema,

          // pass as string
          airr_string: JSON.stringify(this.model.airr_schema, null, 2),

          // label array
          keywords_array: [ 'Ig', 'TCR', 'Single Cell', 'Paired Chain'],

          // label object
          keywords_object: {
              'contains_single_cell': 'Single Cell',
              'contains_ig': 'Ig',
              'contains_paired_chain': 'Paired Chain',
              'contains_tcr': 'TCR'
          }
      }
  }
});

export default Marionette.View.extend({
    template: Handlebars.compile('<div id="create-project-region"></div>'),

    // one region for the create project content
    regions: {
        createRegion: '#create-project-region'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // we use a state variable to know what type of modal to display
        this.modalState = 'create';

        var view = new CreateView();
        this.showChildView('createRegion', view);
    },

    events: {
        'click #create-new-project': 'createNewProject',
        'click #save-project': 'saveProject'
    },

    // handle create project event
    createNewProject: function(e) {
        console.log('create-view: createNewProject');
        e.preventDefault();

        // Currently validates regardless if there is an error or not. NOTE: Still submits the form

        $('.needs-validation').addClass('was-validated');

        // Validation Function
        // (function() {
        //   console.log("form validation should work");
        //   // 'use strict';
        //     window.addEventListener('load', function() {
        //   //
        //   //   // Fetch all the forms we want to apply custom Bootstrap validation styles to
        //     var forms = document.getElementsByClassName('needs-validation');
        //
        //     // Loop over them and prevent submission
        //
        //     var validation = Array.prototype.filter.call(forms, function(form) {
        //       form.addEventListener('submit', function(e) {
        //        if (form.checkValidity() === false) {
        //           e.preventDefault();
        //           e.stopPropagation();
        //           $('.needs-validation').addClass('was-validated');
        //        }
        //
        //       }, false);
        //    });
        //   }, false);
        // })();

        // pull data out of form and put into model
        var data = Syphon.serialize(this);
        // manually hack the study_type until we have ontologies implemented
        data['study_type'] = null;
        this.model.setAttributesFromData(data);
        console.log(this.model);

        // display a modal while the project is being created
        this.modalState = 'create';
        var message = new MessageModel({
          'header': 'Project Creation',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we create the new project...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalMessage({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');

        console.log(message);
    },

    // handle save project event
    saveProject: function(e) {
        console.log('create-view: saveProject');
        e.preventDefault();

        // Currently validates regardless if there is an error or not. NOTE: Still submits the form

        $('.needs-validation').addClass('was-validated');

        // pull data out of form and put into model
        var data = Syphon.serialize(this);

        // manually hack the study_type until we have ontologies implemented
        data['study_type'] = null;
        this.model.setAttributesFromData(data);
        console.log(this.model);

        // display a modal while the project is being created
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Project Saved',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Project Saved</p>'
        });

        // the app controller manages the modal region
        var view = new ModalMessage({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');

        console.log(message);
    },

    // project creation request is sent to server after the modal is shown
    onShownModal(context) {
        console.log('create: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'create') {

            // save the model
            console.log(context.model);
            context.model.save()
            .done(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
                console.log("create pass");
                console.log(context.model);
            })
            .fail(function(error) {
                // save failed so change state, hide the current modal
                console.log(error);
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                // prepare a new modal with the failure message
                var body = '<p>Server returned error code: ' + error.status + ' ' + error.statusText + '<p>';
                try {
                    // make the JSON pretty
                    var t = JSON.parse(error.responseText);
                    body += '<pre>' + JSON.stringify(t,null,2) + '</pre>';
                } catch (e) {
                    // if response is not JSON, stick in the raw text
                    body += '<pre>' + error.responseText + '</pre>';
                }
                var message = new MessageModel({
                    'header': 'Project Creation',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Project creation failed!</div><p>Please submit the error below to the VDJServer Administrator.' + '<code>' + body + '</code>'
                });

                var view = new ModalMessageConfirm({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');

                console.log("create fail");
            });
        } else if (context.modalState == 'fail') {
          // if login failed, then we are showing the fail modal
      }
    },

    onHiddenModal(context) {
        console.log('create: Hide the modal');
        if (context.modalState == 'pass') {
            // create passed so route to the project view
            App.router.navigate('project/' + context.model.get('uuid'), {trigger: false});
            context.controller.showProjectPage(context.model.get('uuid'), null, true);
        } else if (context.modalState == 'fail') {
            console.log("show fail modal");
            // failure modal will automatically hide when user clicks OK
        }
    },


});
