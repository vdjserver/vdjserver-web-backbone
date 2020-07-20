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
import ModalView from 'Scripts/views/utilities/modal-view';

// AIRR Schema
import AIRRSchema from 'airr-schema';

// project creation form
import create_template from 'Templates/project/create.html';
var CreateView = Marionette.View.extend({
  template: Handlebars.compile('<h1>Create New Project</h1>' + create_template),
  templateContext() {
      return {
          // labels for keywords_study
          keywords_object: {
              'contains_ig': 'Ig',
              'contains_tcr': 'TCR',
              'contains_single_cell': 'Single Cell',
              'contains_paired_chain': 'Paired Chain'
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
        'click #cancel-project': 'cancelProject',
        'click #save-project': 'saveProject'
    },

    // cancel just takes you back to the project list
    cancelProject: function(e) {
        App.router.navigate('project', {trigger: true});
    },

    // handle create project event
    createNewProject: function(e) {
        console.log('create-view: createNewProject');
        e.preventDefault();

        $('.needs-validation').addClass('was-validated');

        // Fetch the form
        var form = document.getElementsByClassName('needs-validation');

        console.log(form);

        // Validate the form
        form[0].addEventListener('submit', function(e) {
            if (form[0].checkValidity() === false) {
                console.log("form validation worked");
                e.preventDefault();
                e.stopPropagation();

                // display a modal letting the user know there are missing form fields?
            }

            form[0].addClass('was-validated');


            // pull data out of form and put into model
            var data = Syphon.serialize(this);
            // manually hack the study_type until we have ontologies implemented
            data['study_type'] = null;
            // concatenate collector info
            var fields = [];
            if (data['collectedby_name'].length > 0) fields.push(data['collectedby_name']);
            if (data['collectedby_email'].length > 0) fields.push(data['collectedby_email']);
            if (data['collectedby_address'].length > 0) fields.push(data['collectedby_address']);
            data['collected_by'] = fields.join(', ');

            // concatenate submitter info
            fields = [];
            if (data['submittedby_name'].length > 0) fields.push(data['submittedby_name']);
            if (data['submittedby_email'].length > 0) fields.push(data['submittedby_email']);
            if (data['submittedby_address'].length > 0) fields.push(data['submittedby_address']);
            data['submitted_by'] = fields.join(', ');

            this.model.setAttributesFromData(data);
            console.log(this.model);

            // display a modal while the project is being created
            this.modalState = 'create';
            var message = new MessageModel({
              'header': 'Project Creation',
              'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we create the new project...</p>'
            });

            // the app controller manages the modal region
            var view = new ModalView({model: message});
            App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
            $('#modal-message').modal('show');
        });
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
        var view = new ModalView({model: message});
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
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                var message = new MessageModel({
                    'header': 'Project Creation',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Project creation failed!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        } else if (context.modalState == 'fail') {
        }
    },

    onHiddenModal(context) {
        console.log('create: Hide the modal');
        if (context.modalState == 'pass') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Project Creation',
                'body': '<p>Project successfully created!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSuccessModal);
            $('#modal-message').modal('show');
        } else if (context.modalState == 'fail') {
            console.log("show fail modal");
            // failure modal will automatically hide when user clicks OK
        }
    },

    onHiddenSuccessModal(context) {
        // create passed so route to the project view
        App.router.navigate('project/' + context.model.get('uuid'), {trigger: true});
    },


});
