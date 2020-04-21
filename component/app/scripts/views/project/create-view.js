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
import create_template from '../../../templates/project/create.html';
import modal_template from '../../../templates/util/modal-message.html';
import modal_confirm_template from '../../../templates/util/modal-message-confirm.html';
import MessageModel from 'message';

// custom region to handle a bootstrap modal view
var ModalRegion = Marionette.Region.extend({
    constructor: function() {
        Marionette.Region.prototype.constructor.apply(this, arguments);
    },
});

// the bootstrap modal view
var ModalMessage = Marionette.View.extend({
  template: Handlebars.compile(modal_template),
  region: '#modal'
});

// the bootstrap modal view
var ModalMessageConfirm = Marionette.View.extend({
  template: Handlebars.compile(modal_confirm_template),
  region: '#modal'
});

var CreateView = Marionette.View.extend({
  template: Handlebars.compile('<h1>Create New Project</h1>' + create_template)
});

export default Marionette.View.extend({
    template: Handlebars.compile('<div id="create-project-region"></div><div id="modal"></div>'),

    // one region for the create project content
    // model region when saving the project
    regions: {
        createRegion: '#create-project-region',
        modalRegion: {
            el: '#modal',
            regionClass: ModalRegion
        }
    },

    initialize: function(parameters) {
        // we use a state variable to know what type of modal to display
        this.modalState = 'create';

        var view = new CreateView();
        this.showChildView('createRegion', view);
    },

    events: {
        'click #create-new-project': 'createNewProject',
        'shown.bs.modal': 'onShownModal',
        'hidden.bs.modal': 'onHiddenModal',
    },

    onShownModal() {
        console.log('create: Show the modal');

        var that = this;

        // if login state then an authenticating modal view was just shown
        // go perform the login
        console.log(this.modalState);
        if (this.modalState == 'create') {

            // pull data out of form and put into model
            var data = Syphon.serialize(this);
            this.model.setAttributesFromData(data);

            // save the model
            console.log(this.model);
            this.model.save()
            .done(function() {
                that.modalState = 'pass';
                $('#modal-message').modal('hide');
                console.log("create pass");
                console.log(that.model);
            })
            .fail(function(error) {
                // save failed so change state, hide the current modal
                console.log(error);
                that.modalState = 'fail';
                $('#modal-message').modal('hide');

                // prepare a new modal with the failure message
                var body = '<p>Server returned error code: ' + error.status + ' ' + error.statusText + '<p>';
                try {
                    var t = JSON.parse(error.responseText);
                    body += '<pre>' + JSON.stringify(t,null,2) + '</pre>';
                } catch (e) {}
                var message = new MessageModel({
                    'header': 'Project Creation',
                    'body':   '<p>Project creation failed...</p>' + body
                });

                var view = new ModalMessageConfirm({model: message});
                that.showChildView('modalRegion', view);
                $('#confirmation-button').removeClass('hidden');
                $('#modal-message').modal('show');

                console.log("create fail");
            });
        } else if (this.modalState == 'fail') {
          // if login failed, then we are showing the fail modal
        }
    },

    onHiddenModal() {
        console.log('create: Hide the modal');
        //this.getRegion().empty();
        if (this.modalState == 'pass') {
            // create passed so route to the project view
            App.router.navigate('project/' + this.model.get('uuid'), {trigger: true});
        } else if (this.modalState == 'fail') {
            console.log("show fail modal");
        }
    },

    createNewProject: function(e) {
        console.log('create-view: createNewProject');
        console.log(this.model);
        e.preventDefault();

        // TODO: we need to copy all the data from the form into the Project model

        // when login button is pressed, display an authenticating modal message
        // we cannot perform the actual login here because the modal has not
        // been shown to the user yet, wait for onShowModal()
        this.modalState = 'create';
        var message = new MessageModel({
          'header': 'Project Creation',
          'body':   '<p>Please wait while we create the new project...</p>'
        });

        var view = new ModalMessage({model: message});
        this.showChildView('modalRegion', view);
        $('#modal-message').modal('show');

        console.log(message);
    }

});
