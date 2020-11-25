
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
import list_template from 'Templates/community/community-list.html';
import template from 'Templates/community/study-summary.html';
import Handlebars from 'handlebars';

import { ADC } from 'Scripts/backbone/backbone-adc';

// Olivia: Trying to figure out how to display as a sibling view that appears right after each instance of RepertoireRowView
import repertoire_details_template from 'Templates/community/repertoire-details-row.html';
var RepertoireDetailView = Marionette.View.extend({
    tagName: 'tr',
    className: 'repertoire-details',
    template: Handlebars.compile(repertoire_details_template),
});

import repertoire_template from 'Templates/community/repertoire-row.html';
var RepertoireRowView = Marionette.View.extend({
    tagName: 'tr',
    template: Handlebars.compile(repertoire_template),
});

import repertoire_table_template from 'Templates/community/repertoire-table.html';
var RepertoireTable = Marionette.CollectionView.extend({
    tagName: 'table',
    className: 'table table-striped table-condensed table-bordered',
    template: Handlebars.compile(repertoire_table_template),
    childView: RepertoireRowView,
    childViewContainer: 'tbody',
});

var StudySummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'div',
    className: 'community-project',

    regions: {
        tableRegion: '#community-study-data-table'
    },

    initialize: function(parameters) {
        // pagination of data table
        // just repertoires for now but need to handle the others too
        this.pageQty = 10;
        this.currentPage = 0;
        this.constructPages();
        this.dataView = new RepertoireTable({ collection: this.paginatedRepertoires });
    },

    serializeModel() {
        const data = _.clone(this.model.attributes);

        // serialize nested model data
        data.study = data.study.attributes;

        // attempting to grab repertoires data
        data.repertoire = data.repertoires.models;
        // console.log ("this is data.repertoire: " + JSON.stringify(data.repertoires));

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
            // $(event.target).parent().parent("community-summary-stats").siblings(".community-table").addClass("no-display");
        },

        // Hide Detailed Data
        'click a.active-tab': function(e) {
            $(event.target).removeClass("active-tab");
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
        }
    },

    templateContext() {

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
            if (value.vdjserver_keywords.indexOf("10x_genomics") >= 0)
                is_10x_genomics = true;

        // repository tags
        var is_vdjserver = false;
        var repos = this.model.get('repository');
        var repo_titles = [];
        var adc_repos = ADC.Repositories();
        for (var i = 0; i < repos.length; ++i) {
            if (repos[i] == 'vdjserver') is_vdjserver = true;
            else repo_titles.push(adc_repos[repos[i]]['title']);
        }

        return {
            object: JSON.stringify(this.model),
            num_subjects: this.model.get('subjects').length,
            num_samples: this.model.get('samples').length,
            num_repertoires: this.model.get('repertoires').length,
            contains_ig: contains_ig,
            contains_tcr: contains_tcr,
            contains_single_cell: contains_single_cell,
            contains_paired_chain: contains_paired_chain,
            is_10x_genomics: is_10x_genomics,
            is_vdjserver: is_vdjserver,
            repo_titles: repo_titles
        };
    },

    constructPages() {
        this.pages = [];
        var reps = this.model.get('repertoires');
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

export default Marionette.CollectionView.extend({
    template: Handlebars.compile(list_template),
    initialize: function(parameters) {
        this.childView = StudySummaryView;
  },
});
