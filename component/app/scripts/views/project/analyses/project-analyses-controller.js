
'use strict';

//
// project-analyses-controller.js
// Controller for the project analyses page
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

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import ProjectAnalysesView from 'Scripts/views/project/analyses/project-analyses-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import FilterController from 'Scripts/views/utilities/filter-controller';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';
import { AnalysisDocument, ProjectJob } from 'Scripts/models/agave-job';
import { ProjectFileQuery } from 'Scripts/collections/agave-files';

import {TakaraBioUMIParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-takara-umi.js'
import {PrestoParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-presto.js'
import {VDJPipeParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-vdjpipe.js'
import {IgBlastParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-igblast.js'
import {RepCalcParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-repcalc.js'
import {StatisticsParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-statistics.js'
import {CellrangerParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-cellranger.js'
import {TCRMatchParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-tcrmatch.js'
import {TRUST4ParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-trust4.js'
import {CompAIRRParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-compairr.js'
import {ChartsView} from 'Scripts/views/project/analyses/project-analyses-charts.js'
import {LogsView} from 'Scripts/views/project/analyses/project-analyses-logs.js'
import {ErrorsView} from 'Scripts/views/project/analyses/project-analyses-errors.js'

import {ToolButtonsView} from 'Scripts/views/project/analyses/project-analyses-tool-buttons.js'

// Project analyses controller
//
function ProjectAnalysesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.view_mode = 'summary';
    // edits
    this.has_edits = false;
    this.resetCollections();

    // mapping for tool subviews
    this.toolViewMap = {
        takara_bio_umi_human_tr: TakaraBioUMIParameterView,
        vdjpipe: VDJPipeParameterView,
        presto: PrestoParameterView,
        igblast: IgBlastParameterView,
        repcalc: RepCalcParameterView,
        statistics: StatisticsParameterView,
        cellranger: CellrangerParameterView,
        tcrmatch: TCRMatchParameterView,
        trust4: TRUST4ParameterView,
        compairr: CompAIRRParameterView,
        charts: ChartsView,
        logs: LogsView,
        errors: ErrorsView
    };

    this.toolButtonsView = ToolButtonsView;

    // analyses view
    this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
    this.filterController = new FilterController(this, "vdjserver_analysis");
    this.filterController.constructValues(this.analysisList);
    this.filterController.showFilter();
}

ProjectAnalysesController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
        return this.mainView;
    },

    resetCollections() {
        // these collections should always point to the same models
        this.analysisList = this.controller.analysisList.getClonedCollection(); //create the cloned collection
    },

    getViewMode() {
        return this.view_mode;
    },

    // show project analyses
    showProjectAnalysesList() {
        // var collections = this.controller.getCollections();
        if (this.filteredAnalyses)
            this.mainView.showProjectAnalysesList(this.filteredAnalyses);
        else
            this.mainView.showProjectAnalysesList(this.analysisList);
        this.filterController.showFilter();
    },

    getCollections() {
        return this.controller.getCollections();
    },

    getAnalysisList() {
        return this.analysisList;
    },

    getOriginalAnalysisList() {
        return this.controller.analysisList;
    },

    applyFilter: function(filters) {
        if (filters) {
            this.filteredAnalyses = this.analysisList.filterCollection(filters);

            this.filteredAnalyses.sort_by = this.analysisList.sort_by;
            this.filteredAnalyses.sort();
        } else this.filteredAnalyses = null;

        this.showProjectAnalysesList();
    },

    applySort(sort_by) {
        var analyses = this.getAnalysisList();
        analyses.sort_by = sort_by;
        analyses.sort();
    },

    flagEdits: function() {
        // we keep flag just for file changes
        this.has_edits = true;
        // update header
        this.mainView.updateHeader();
    },

    addAnalysis: function(name) {
        var newAnalysis = new AnalysisDocument({projectUuid: this.controller.model.get('uuid')});
        newAnalysis.setAnalysis(name, true);
        newAnalysis.view_mode = 'edit';

        var clonedList = this.getAnalysisList();
        clonedList.add(newAnalysis, {at:0});

        $('#analysis_id_'+newAnalysis.get('uuid')).focus();
        this.flagEdits();
    },

    updateField: function(e, model) {
        model.updateField(e.target.name, e.target.value);
    },

    updateToggle: function(e, model, view, childClassName) {
        if (model) model.updateField(e.target.name, e.target.checked);
        if (view)
            // enable/disable subparameters
            view.$(`.${childClassName}`).each(function () {
                $(this).prop('disabled', !e.target.checked);
                if ($(this).hasClass('selectpicker')) {
                    $(this).selectpicker('refresh');
                }
            });
    },

    updateSelect: function(e, model) {
        model.updateField(e.target.name, e.target.value);
    },

    revertChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectAnalysesList();
    },

    saveChanges: function(e) {
        console.log('pgc Clicked Save');

        // clear errors
        let hasErrors = false;
        $('.needs-validation').removeClass('was-validated');
        let fields = $('.is-invalid');
        fields.removeClass('is-invalid');

        // model validation
        var colls = this.getCollections();
        var minY = Number.MAX_VALUE;
        for (let i = 0; i < this.analysisList.length; ++i) {
            // only validate models that have been changed or are new
            let model = this.analysisList.at(i);
            let origModel = this.getOriginalAnalysisList().get(model.get('uuid'));
            var changed = null;
            if (origModel) {
                if (model.view_mode == 'edit') changed = true;
            } else changed = true;

            // TODO: need to handle errors in the subview parameters
            // parameter fields will not be in html

            if (changed) {
                model.finalizeDocument(colls.fileList);
                let valid = model.isValid();
                if (!valid)  {
                    hasErrors = true;
                    let form = document.getElementById("project-analysis-form_" + model.get('uuid'));
                    var rect = form.getBoundingClientRect();
                    if (rect['y'] < minY) minY = rect['y'] + window.scrollY;
                    form = $(form);
                    for (let j = 0; j < model.validationError.length; ++j) {
                        let e = model.validationError[j];
                        console.log(e);
                        let f = form.find('#' + e['field']);
                        if (f.length > 0) {
                            f.addClass('is-invalid');
                        }
                    }
                }
            }
        }

        // form validation
        $('.needs-validation').addClass('was-validated');
        var form = document.getElementsByClassName('needs-validation');
        for (let i = 0; i < form.length; ++i)
            if (form[i].checkValidity() === false) {
                hasErrors = true;
                var rect = form[i].getBoundingClientRect();
                if (rect['y'] < minY)
                    minY = rect['y']+window.scrollY;
            }

        // needed to refresh view for selectpicker (bootstrap-select) invalid message to appear
        $('.selectpicker').selectpicker("refresh");

        // scroll to first form with error and abort save
        if (hasErrors) {
            $('html, body').animate({ scrollTop: minY - 100 }, 1000);
            return;
        }

        // display a modal while the data is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Analyses',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Submitting Analyses</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, null);
        $('#modal-message').modal('show');
    },

    // file changes are sent to server after the modal is shown
    onShownSaveModal: function(context) {
        console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {
            // the changed collection/models
            let modelList = context.getAnalysisList();
            let originalModelList = context.getOriginalAnalysisList();

            // TODO: analyses are not deleted, instead they are archived
            // see if any are archived
            //var deletedModels = originalModelList.getMissingModels(modelList);

            // Set up promises
            var promises = [];

            // deletions
//             deletedModels.map(function(uuid) {
//                 var m = context.getOriginalAnalysisList().get(uuid);
//                 var deleteChanges = async function(uuid, m) {
//                     var msg = null;
//                     await m.destroy().fail(function(error) { msg = error; });
//                     if (msg) return Promise.reject(msg);
// 
//                     return Promise.resolve();
//                 };
//                 promises.push(deleteChanges(uuid, m));
//             });

            // updates and new
            modelList.map(function(uuid) {
                var m = modelList.get(uuid);
                var saveChanges = async function(uuid, m) {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = context.getOriginalAnalysisList().get(uuid);
                        if (!origModel) return Promise.resolve();
                        else if (m.view_mode != 'edit') return Promise.resolve();
                    }

                    var msg = null;
                    await m.save().fail(function(error) { msg = error; });
                    if (msg) return Promise.reject(msg);

                    return Promise.resolve();
                };

                promises[promises.length] = saveChanges(uuid, m);
            });

            // Execute promises
            Promise.all(promises)
                .then(function() {
                    context.modalState = 'pass';
                    $('#modal-message').modal('hide');

                    // prepare a new modal with the success message
                    var message = new MessageModel({
                        'header': 'Analyses',
                        'body':   'Analyses has been successfully submitted!',
                        cancelText: 'Ok'
                    });

                    var view = new ModalView({model: message});
                    App.AppController.startModal(view, context, null, context.onHiddenSaveModal);
                    $('#modal-message').modal('show');
                })
                .catch(function(error) {
                    console.log(error);

                    // save failed so show error modal
                    context.modalState = 'fail';
                    $('#modal-message').modal('hide');

                    // prepare a new modal with the failure message
                    var message = new MessageModel({
                        'header': 'Analyses',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Analysis submission failed!</div>',
                        cancelText: 'Ok',
                        serverError: error
                    });

                    var view = new ModalView({model: message});
                    App.AppController.startModal(view, context, null, null);
                    $('#modal-message').modal('show');
                });
        } else if (context.modalState == 'fail') {
            // TODO: we should do something here?
            console.log('fail');
        }
    },

    onHiddenSaveModal: function(context) {
        console.log('save: Hide the modal');
        if (context.modalState == 'pass') {
            // changes all saved
            context.has_edits = false;
            context.controller.replaceAnalysesList(context.analysisList);
            context.resetCollections();
            context.showProjectAnalysesList();
        } else if (context.modalState == 'fail') {
            // failure modal will automatically hide when user clicks OK
        }
    },

};
export default ProjectAnalysesController;

