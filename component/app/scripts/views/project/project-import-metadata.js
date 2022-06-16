//
// project-import-metadata.js
// Modal view for metadata import
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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
import template from 'Templates/project/project-import-metadata.html';
import Handlebars from 'handlebars';


export default Marionette.View.extend({
    template: Handlebars.compile(template),
    region: '#modal',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.file = null;
        this.operation = null;
        let collections = this.controller.getCollections();
        this.airrJSON = collections.fileList.getJSONCollection();
    },

    templateContext: function() {
        return {
            //metadataName: this.metadataName,
            jsonFiles: this.airrJSON.toJSON(),
        };
    },

    events: {
        'click #submit-import': 'submitImportForm',
    },

    submitImportForm: function(e) {
        var fileUuid = $('#file-import-name').val();
        this.operation = $('#data-operation').val();
        this.file = this.airrJSON.get(fileUuid);
    },

});

/*
    Projects.MetadataImport = Backbone.View.extend({
        // Public Methods
        template: 'project/metadata/import-metadata',
        initialize: function(parameters) {
            this.tsvFiles = this.projectFiles.getTSVCollection();
        },
        serialize: function() {
            return {
                metadataName: this.metadataName,
                tsvFiles: this.tsvFiles.toJSON(),
            };
        },
        afterRender: function() {
            $('#import-modal').modal('show');
        },
        events: {
            'click #submit-import': '_submitImportForm',
            'click #import-exit': '_exitImportForm',
        },

        // Private Methods
        _exitImportForm: function(e) {
            e.preventDefault();

            var that = this;

            $('#import-modal').on('hidden.bs.modal', function(e) {
                // force reload of page
                Backbone.history.loadUrl(Backbone.history.fragment);
            });
        },

        _submitImportForm: function(e) {
            var that = this;
            var fileUuid = $('#file-import-name').val();
            var op = $('#data-operation').val();
            var file = this.tsvFiles.get(fileUuid);

            this._uiShowImportProcessingView();

            this.parentView._performImport(file, op)
              .then(function(response) {
                  that._uiCancelJobLoadingView();
              })
              .fail(function(error) {
                  if (error.responseText) that._uiCancelJobLoadingView(error.responseText);
                  else that._uiCancelJobLoadingView('Unknown server error.');

                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', 'performImport()');
                  telemetry.set('view', 'Projects.MetadataImport');
                  telemetry.save();
              })
              ;
        },

        // UI
        _uiShowImportProcessingView: function() {
            // Clear out any previous errors
            $('#import-processing-view').html('');
            $('#import-processing-view').removeClass('alert alert-danger');

            var alertView = new App.Views.Util.Loading({ displayText: 'Importing... Please Wait.', keep: true});

            this.setView('#import-processing-view', alertView);
            alertView.render();

            $('.import-form-item').prop('disabled', true)
            $('.import-submit-button').prop('disabled', true)
        },

        _uiCancelJobLoadingView: function(error) {
            this.removeView('#import-processing-view');

            $('#import-processing-view').removeClass('alert alert-info');
            $('.import-submit-button').addClass('hidden');
            $('#import-exit').removeClass('hidden');

            if (error) {
                $('#import-processing-view').addClass('alert alert-danger');
                var msg = 'There was an error importing the metadata.<br/>';
                msg += error + '<br/>';
                $('#import-processing-view').append(msg);
            } else {
                var message = new App.Models.MessageModel({
                    'body': 'Import was successful!'
                });

                var alertView = new App.Views.Util.Alert({
                    options: {
                        type: 'success'
                    },
                    model: message
                });

                this.setView('#import-processing-view', alertView);
                alertView.render();
            }
        },
    });
*/
