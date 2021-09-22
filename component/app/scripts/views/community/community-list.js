
'use strict';

//
// community-list.js
// Manages the results list for the community data page
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
import Handlebars from 'handlebars';

import { ADC } from 'Scripts/backbone/backbone-adc';

import repertoire_subject_template from 'Templates/community/repertoire-subject-row.html';
var RepertoireSubjectView = Marionette.View.extend({
    tagName: 'td',
    className: 'rep-details',
    attributes: {
        "colspan": "7"
    },
    template: Handlebars.compile(repertoire_subject_template),
});

import repertoire_sample_template from 'Templates/community/repertoire-sample-row.html';
var RepertoireSampleView = Marionette.View.extend({
    tagName: 'td',
    className: 'rep-details',
    attributes: {
        "colspan": "7"
    },
    template: Handlebars.compile(repertoire_sample_template),
});

import repertoire_cell_template from 'Templates/community/repertoire-cell-row.html';
var RepertoireCellView = Marionette.View.extend({
    tagName: 'td',
    className: 'rep-details',
    attributes: {
        "colspan": "7"
    },
    template: Handlebars.compile(repertoire_cell_template),
});

import repertoire_tissue_template from 'Templates/community/repertoire-tissue-row.html';
var RepertoireTissueView = Marionette.View.extend({
    tagName: 'td',
    className: 'rep-details',
    attributes: {
        "colspan": "7"
    },
    template: Handlebars.compile(repertoire_tissue_template),
});

import repertoire_template from 'Templates/community/repertoire-row.html';
var RepertoireRowView = Marionette.View.extend({
    tagName: 'tbody',
    template: Handlebars.compile(repertoire_template),
    regions: {
        detailRegion: '#repertoire-details'
    },

  //   initialize: function(parameters) {
  //     var detail_view = new RepertoireDetailView();
  //     this.showChildView('detailRegion', detail_view);
  // },

  events:  {
    'click .subject': 'showRepDetails',
    'click .sample': 'showRepDetails',
    'click .cell': 'showRepDetails',
    'click .tissue': 'showRepDetails',
  },

  showRepDetails(detail_view) {
      $(event.target).toggleClass("selected-details");

      if ($(event.target).hasClass("subject selected-details")) {
         var detail_view = new RepertoireSubjectView();
         this.showChildView('detailRegion', detail_view);
     } else if ($(event.target).hasClass("sample selected-details")) {
         var detail_view = new RepertoireSampleView();
         this.showChildView('detailRegion', detail_view);
     } else if ($(event.target).hasClass("cell selected-details")) {
         var detail_view = new RepertoireCellView();
         this.showChildView('detailRegion', detail_view);
     } else if ($(event.target).hasClass("tissue selected-details")) {
         var detail_view = new RepertoireTissueView();
         this.showChildView('detailRegion', detail_view);
     }
      else { // nothing is selected, empty the view
          this.getRegion('detailRegion').empty();
      }
  },

});

import repertoire_table_template from 'Templates/community/repertoire-table.html';
var RepertoireTable = Marionette.CollectionView.extend({
    tagName: 'table',
    className: 'table table-condensed table-bordered',
    template: Handlebars.compile(repertoire_table_template),
    childView: RepertoireRowView,
    // childViewContainer: 'tbody'
});

import template from 'Templates/community/study-summary.html';
var StudySummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'div',
    className: 'community-project',

    regions: {
        tableRegion: '#community-study-data-table'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }

        // pagination of data table
        // just repertoires for now but need to handle the others too
        this.pageQty = 10;
        this.currentPage = 0;
        this.constructPages();
        this.dataView = new RepertoireTable({ collection: this.paginatedRepertoires });
    },

    serializeModel() {
        // Marionette will only serialize the main model attributes and
        // none of the sub-models, we add in the sub-models that we want
        // to directly access values in the html template.
        const data = _.clone(this.model.attributes);

        // serialize nested model data
        data.study = data.study.attributes;

        // get unfiltered collections
        var collections = this.controller.getCollections();
        var study_id = this.model.get('id');
        var full_study = collections.studyList.get(study_id);

        // repository tags
        data.is_vdjserver = false;
        data.vdjserver_counts = {};
        var repos = this.model.get('repository');
        data.repo_titles = [];
        var adc_repos = ADC.Repositories();
        for (var i = 0; i < repos.length; ++i) {
            if (repos[i] == 'vdjserver') {
                data.is_vdjserver = true;
                let vdjserver_study = this.model.get('repos').get('vdjserver');
                let full_vdjserver_study = full_study.get('repos').get('vdjserver');
                data.vdjserver_counts['num_repertoires'] = vdjserver_study.get('repertoires').length;
                data.vdjserver_counts['full_num_repertoires'] = full_vdjserver_study.get('repertoires').length;
                data.vdjserver_counts['num_subjects'] = vdjserver_study.get('subjects').length;
                data.vdjserver_counts['full_num_subjects'] = full_vdjserver_study.get('subjects').length;
                data.vdjserver_counts['num_samples'] = vdjserver_study.get('samples').length;
                data.vdjserver_counts['full_num_samples'] = full_vdjserver_study.get('samples').length;
                //data.vdjserver_counts['num_data_processings'] = vdjserver_study.get('data_processings').length;
                //data.vdjserver_counts['full_num_data_processings'] = full_vdjserver_study.get('data_processings').length;
            } else {
                var obj = {name: adc_repos[repos[i]]['title']};
                let repo_study = this.model.get('repos').get(repos[i]);
                let full_repo_study = full_study.get('repos').get(repos[i]);
                obj['num_repertoires'] = repo_study.get('repertoires').length;
                obj['full_num_repertoires'] = full_repo_study.get('repertoires').length;
                obj['num_subjects'] = repo_study.get('subjects').length;
                obj['full_num_subjects'] = full_repo_study.get('subjects').length;
                obj['num_samples'] = repo_study.get('samples').length;
                obj['full_num_samples'] = full_repo_study.get('samples').length;
                data.repo_titles.push(obj);
            }
        }
        //console.log(vdjserver_counts);

        // attempting to grab repertoires data
        //data.repertoire = data.repertoires.models;

        return data;
    },

    events: {
        // Setting event for "New Filter" Modal
        'click #new-community-filter': 'newFilterModal',

        'click .study-desc-more': function(e) {
            // console.log("clicked expand for desc");
            $(event.target).parent(".community-study-desc").addClass("no-display");

            $(event.target).parent(".community-study-desc").siblings(".community-study-desc-full").removeClass("no-display");

            // Expanding Grants
            $(event.target).parent(".community-study-desc").siblings(".row").find(".community-metadata").find(".grants").addClass("no-display");

            $(event.target).parent(".community-study-desc").siblings(".row").find(".community-metadata").find(".grants-full").removeClass("no-display");

            // Expanding Inclusion/Exclusion Criteria
            $(event.target).parent(".community-study-desc").siblings(".row").find(".community-metadata").find(".inclusion").addClass("no-display");

            $(event.target).parent(".community-study-desc").siblings(".row").find(".community-metadata").find(".inclusion-full").removeClass("no-display");
        },

        'click .study-desc-collapse': function(e) {
            // console.log("clicked collapse for desc");
            $(event.target).parent(".community-study-desc-full").addClass("no-display");

            $(event.target).parent(".community-study-desc-full").siblings(".community-study-desc").removeClass("no-display");

            // Collapsing Grants
            $(event.target).parent(".community-study-desc-full").siblings(".row").find(".community-metadata").find(".grants").removeClass("no-display");

            $(event.target).parent(".community-study-desc-full").siblings(".row").find(".community-metadata").find(".grants-full").addClass("no-display");

            // Collapsing Inclusion/Exclusion Criteria
            $(event.target).parent(".community-study-desc-full").siblings(".row").find(".community-metadata").find(".inclusion").removeClass("no-display");

            $(event.target).parent(".community-study-desc-full").siblings(".row").find(".community-metadata").find(".inclusion-full").addClass("no-display");
        },

        // Clicking Community Metadata Tabs
        'click .community-button > a': function(e) {
            $(event.target).toggleClass("active-tab");
            $(event.target).parent().toggleClass("selected");
            $(event.target).parent().siblings().removeClass("selected");
            $(event.target).parent().siblings().children("a").removeClass("active-tab");
        },

        // Hide Detailed Data
        'click a.active-tab': function(e) {
            $(event.target).removeClass("active-tab");
        },

        'click #clipboard-copy-url': function(e) {
            var text = e.target.getAttribute('download_url');
            console.log('copy to clipboard:', text);
            if (text) navigator.clipboard.writeText(text);
        },

        // Show/Hide Community Repertoires Data
        // Olivia: need to clean up for efficiency
        'click .community-repertoires': function(e) {
            this.showChildView('tableRegion', this.dataView);

            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-repertoires-metadata").toggleClass("no-display");

            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-table").not(".community-repertoires-metadata").addClass("no-display");
        },

        // Pagination for the Data Table
        'click #pagination-previous-page': 'previousPage',
        'click #pagination-next-page': 'nextPage',
        'change #pagination-page-size': 'pageSize',

        // Show/Hide Community Subjects Data
        // Olivia: need to clean up for efficiency
        'click .community-subjects': function(e) {
            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-subjects-metadata").toggleClass("no-display");

            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-table").not(".community-subjects-metadata").addClass("no-display");
        },

        // Show/Hide Community Clones Data
        // Olivia: need to clean up for efficiency
        'click .community-clones': function(e) {
            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-clones-metadata").toggleClass("no-display");

            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-table").not(".community-clones-metadata").addClass("no-display");
        },

        // Show/Hide Community Rearrangements Data
        // Olivia: need to clean up for efficiency
        'click .community-rearrangements': function(e) {
            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-rearrangements-metadata").toggleClass("no-display");

            $(event.target).parent(".community-button").parent(".community-summary-stats").siblings(".community-table").not(".community-rearrangements-metadata").addClass("no-display");
        },

        // Select All Checkboxes Functionality
        'click .select-all-repertoire': function(e) {
            console.log("checked all");
            $(event.target).closest("table").children("tbody").find("td input:checkbox").prop("checked", true);
        },

        // Sorting
        'click .sort.asc': function(e) {
            // console.log ("sorting");
            $(event.target).toggleClass("asc desc");
            $(event.target).siblings(".sort").removeClass("asc").addClass("no-sort");
            $(event.target).siblings(".sort").removeClass("desc").addClass("no-sort");

            // Insert function for actual sorting here
        },

        'click .sort.desc': function(e) {
            // console.log ("sorting");
            $(event.target).toggleClass("desc asc");
            $(event.target).siblings(".sort").removeClass("asc").addClass("no-sort");
            $(event.target).siblings(".sort").removeClass("desc").addClass("no-sort");

            // Insert function for actual sorting here
        },

        'click .sort.no-sort': function(e) {
            // console.log ("sorting");
            $(event.target).toggleClass("no-sort asc");
            $(event.target).siblings(".sort").removeClass("asc").addClass("no-sort");
            $(event.target).siblings(".sort").removeClass("desc").addClass("no-sort");

            // Insert function for actual sorting here
        },
    },

    getFileSizeDisplay(size) {
        var text = '???';
        if (!size) return text;

        if (size < 1024) {
            text = Math.round(size) + ' B';
            return text;
        } else size = size / 1024;

        if (size < 1024) {
            text = Math.round(size) + ' KB';
            return text;
        } else size = size / 1024;

        if (size < 1024) {
            text = Math.round(size) + ' MB';
            return text;
        } else size = size / 1024;

        if (size < 1024) {
            text = Math.round(size) + ' GB';
            return text;
        } else size = size / 1024;

        if (size < 1024) {
            text = Math.round(size) + ' TB';
            return text;
        } else size = size / 1024;

        // too big
        return text;
    },

    templateContext() {

        // get unfiltered collections
        var collections = this.controller.getCollections();
        var study_id = this.model.get('id');
        var full_study = collections.studyList.get(study_id);

        // study badges
        var study = this.model.get('study');
        var value = study.get('value');
        // console.log(value);
        var contains_ig = false;
        var contains_tcr = false;
        var contains_single_cell = false;
        var contains_paired_chain = false;
        if (value.keywords_study.indexOf("contains_ig") >= 0)
            contains_ig = true;
        if (value.keywords_study.indexOf("contains_tcr") >= 0)
            contains_tcr = true;
        if (value.keywords_study.indexOf("contains_single_cell") >= 0)
            contains_single_cell = true;
        if (value.keywords_study.indexOf("contains_paired_chain") >= 0)
            contains_paired_chain = true;

        // custom 10x flag
        var is_10x_genomics = false;
        if (value.vdjserver_keywords)
            if (value.vdjserver_keywords.indexOf("is_10x_genomics") >= 0)
                is_10x_genomics = true;

/*
        // repository tags
        var is_vdjserver = false;
        var vdjserver_study = null;
        var full_vdjserver_study = null;
        var vdjserver_counts = {};
        var vdjserver_num_repertoires = 0;
        var full_vdjserver_num_repertoires = 0;
        var vdjserver_num_subjects = 0;
        var full_vdjserver_num_subjects = 0;
        var vdjserver_num_samples = 0;
        var full_vdjserver_num_samples = 0;
        var vdjserver_num_data_processings = 0;
        var repos = this.model.get('repository');
        var repo_titles = [];
        var adc_repos = ADC.Repositories();
        for (var i = 0; i < repos.length; ++i) {
            if (repos[i] == 'vdjserver') {
                is_vdjserver = true;
                vdjserver_study = this.model.get('repos').get('vdjserver');
                vdjserver_num_subjects = vdjserver_study.get('subjects').length;
                vdjserver_num_repertoires = vdjserver_study.get('repertoires').length;
                vdjserver_num_samples = vdjserver_study.get('samples').length;
                vdjserver_num_data_processings = vdjserver_study.get('data_processings').length;
                full_vdjserver_study = full_study.get('repos').get('vdjserver');
                full_vdjserver_num_subjects = full_vdjserver_study.get('subjects').length;
                full_vdjserver_num_repertoires = full_vdjserver_study.get('repertoires').length;
                full_vdjserver_num_samples = full_vdjserver_study.get('samples').length;
                //vdjserver_num_data_processings = vdjserver_study.get('data_processings').length;
                vdjserver_counts['num_repertoires'] = vdjserver_num_repertoires;
                vdjserver_counts['full_num_repertoires'] = full_vdjserver_num_repertoires;
            } else {
                repo_titles.push(adc_repos[repos[i]]['title']);
            }
        }
        console.log(vdjserver_counts);
*/

        // publications
        var pub_list = [];
        if (value.pub_ids) {
            let fields = value.pub_ids.split(',');
            let ps = '';
            let pe = '';
            for (let i in fields) {
                if (i > 0) {
                    ps = '<p>';
                    pe = '</p>';
                }
                let entry = fields[i];
                let p = entry.split(':');
                if (p.length >= 2) {
                    if (p[0].trim() == 'PMID') {
                        pub_list.push({ name: ps + p[0].trim().toUpperCase() + ': ' + p[1].trim() + pe, url: 'https://pubmed.ncbi.nlm.nih.gov/' + p[1].trim() + '/' });
                    } else if (p[0].trim().toLowerCase() == 'doi') {
                        pub_list.push({ name: ps + p[0].trim().toUpperCase() + ': ' + p[1].trim() + pe, url: 'https://doi.org/' + p[1].trim()});
                    } else if (p[0].trim().toLowerCase() == 'http') {
                        pub_list.push({ name: ps + entry + pe, url: p.join(':') });
                    } else if (p[0].trim().toLowerCase() == 'https') {
                        pub_list.push({ name: ps + entry + pe, url: p.join(':') });
                    } else if (p[0].trim().toLowerCase() == 'PMC') {
                        pub_list.push({ name: ps + p[0].trim().toUpperCase() + ': ' + p[1].trim() + pe, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/' + p[1].trim() + '/' });
                    } else {
                        // unknown
                        pub_list.push({ name: ps + entry + pe, url: null });
                    }
                } else {
                    // unknown
                    pub_list.push({ name: ps + entry + pe, url: null });
                }
            }
        }

        // study download cache
        var has_one_download_cache = false;
        var has_multiple_download_cache = false;
        var download_url = null;
        var download_file_size = null;
        var download_files = [];
        var study_cache = full_study.get('study_cache');
        if (study_cache) {
            download_url = study_cache.get('download_url');
            if (download_url instanceof Array) {
                has_multiple_download_cache = true;
                var sizes = study_cache.get('file_size');
                for (let i = 0; i < sizes.length; ++i) {
                    download_files.push({url: download_url[i], file_size: this.getFileSizeDisplay(sizes[i])});
                }
            } else {
                has_one_download_cache = true;
                download_file_size = this.getFileSizeDisplay(study_cache.get('file_size'));
            }
        }

        // dates
        var publish_date = null;
        if (value.adc_publish_date) publish_date = new Date(value.adc_publish_date).toLocaleString();
        var update_date = null;
        if (value.adc_update_date) update_date = new Date(value.adc_update_date).toLocaleString();

        return {
            object: JSON.stringify(this.model),
            //vdjserver_counts: JSON.stringify(vdjserver_counts),
            //vdjserver_num_repertoires: vdjserver_num_repertoires,
            //full_vdjserver_num_repertoires: full_vdjserver_num_repertoires,
            //vdjserver_num_subjects: vdjserver_num_subjects,
            //full_vdjserver_num_subjects: full_vdjserver_num_subjects,
            //vdjserver_num_samples: vdjserver_num_samples,
            //full_vdjserver_num_samples: full_vdjserver_num_samples,
            contains_ig: contains_ig,
            contains_tcr: contains_tcr,
            contains_single_cell: contains_single_cell,
            contains_paired_chain: contains_paired_chain,
            is_10x_genomics: is_10x_genomics,
            //is_vdjserver: is_vdjserver,
            //repo_titles: repo_titles,
            pub_list: pub_list,
            has_one_download_cache: has_one_download_cache,
            has_multiple_download_cache: has_multiple_download_cache,
            download_url: download_url,
            download_file_size: download_file_size,
            download_files: download_files,
            publish_date: publish_date,
            update_date: update_date
        };
    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
            trigger: 'hover'
        });

        //$('[data-toggle="tooltip"]').tooltip();
    },

    constructPages() {
        // TODO: handle multiple repositories
        var repository_id = this.model.get('repository')[0];
        var repos = this.model.get('repos');
        var repository = repos.get(repository_id);

        this.pages = [];
        var reps = repository.get('repertoires');
        this.paginatedRepertoires = reps.clone();

        for (var i = 0; i < reps.length; i += this.pageQty) {
          this.pages[i/this.pageQty] =
            reps.models.slice(i, i + this.pageQty);
        }
        this.paginatedRepertoires.reset(this.pages[this.currentPage]);
    },

    previousPage() {
        --this.currentPage;
        if (this.currentPage < 0) this.currentPage = 0;
        this.paginatedRepertoires.reset(this.pages[this.currentPage]);
    },

    nextPage() {
        ++this.currentPage;
        if (this.currentPage >= this.pages.length) this.currentPage = this.pages.length - 1;
        this.paginatedRepertoires.reset(this.pages[this.currentPage]);
    },

    pageSize(e) {
        console.log('page size');
        var x = this.pageQty * this.currentPage;
        this.pageQty = Number(e.target.value);
        this.currentPage = Math.floor(x / this.pageQty);
        this.constructPages();
        //this.paginatedRepertoires.reset(this.pages[this.currentPage]);
        this.dataView = new RepertoireTable({ collection: this.paginatedRepertoires });
        this.showChildView('tableRegion', this.dataView);
    },
});

import list_template from 'Templates/community/community-list.html';
export default Marionette.CollectionView.extend({
    template: Handlebars.compile(list_template),
    initialize: function(parameters) {
        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }

        this.childView = StudySummaryView;
        this.childViewOptions = { controller: this.controller };
  },
});
