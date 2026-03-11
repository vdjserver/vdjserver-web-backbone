import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';
import { File, ProjectFile, ProjectFileMetadata, AnalysisFile } from 'Scripts/models/agave-file';

import parameter_template from 'Templates/project/analyses/project-analyses-output-files.html';
export var OutputFilesView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = parameters.analysisDetailView;
    },

    // templateContext() {
    //     let name = this.model.get("name");
    //     let description = this.model.get("description");
    //     let format = this.model.get("vdjserver:format");
    //     let tags = this.model.get("vdjserver:tags");
    //     return {
    //         // name:name,
    //         // description:description,
    //         // format:format,
    //         // tags:tags
    //     }        
    // },

    events: {
        'click #project-file-download': 'downloadFile',
    },
    // *** 
    downloadFile: function(e) {
        e.preventDefault();

        this.model.downloadFileToDisk()
            .fail(function(error) {
                // TODO: handle error
                console.log(error);
            });
    },

});

import table_template from 'Templates/project/analyses/project-analyses-output-files-table.html';
// export var OutputFilesViewTable = Marionette.CollectionView.extend({
//     template: Handlebars.compile(table_template),
//     childViewContainer: '.project-analyses-outfiles-table',

//     initialize: function(parameters) {
//         // our controller
//         if (parameters && parameters.controller)
//             this.controller = parameters.controller;

//         this.childView = OutputFilesView;
//         this.childViewOptions = { controller: this.controller };
//     },
// });


export var OutputFilesViewTable = Marionette.View.extend({
    template: Handlebars.compile(table_template),

    regions: {
        tableBody: {
            el: '.project-analyses-outfiles-table',
            replaceElement: false
        }
    },

    onRender() {
        this.showChildView(
            'tableBody',
            new Marionette.CollectionView({
                collection: this.collection,
                childView: OutputFilesView,
                childViewOptions: {
                    controller: this.controller
                }
            })
        );

        console.log("collection size:", this.collection.length);
        console.log(this.getRegion('tableBody').el);
        // console.log("row rendered", this.model.get("name"));

    },

    initialize(parameters) {
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    }
});