import Marionette from 'backbone.marionette';
import Handlebars, { template } from 'handlebars';

import community_charts_table_body_template from 'Templates/community/community-charts-table-body.html';
export var CommunityChartsInfoView = Marionette.View.extend({
    template: Handlebars.compile(community_charts_table_body_template),
    
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.spacing) this.spacing = parameters.spacing;
            this.communityChartsView = parameters.communityChartsView;
        }
        // this.childView = CommunityChartsView;
        // this.childViewOptions = { controller: this.controller };
    },

    templateContext: function() {
        return this.spacing;
    }
});

import community_charts_table_header_template from 'Templates/community/community-charts-table-header.html';
export var CommunityChartsInfoViewTable = Marionette.CollectionView.extend({
    template: Handlebars.compile(community_charts_table_header_template),
    childViewContainer: '.community-charts-table-body',
    
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.collection) this.collection = parameters.collection;
            if (parameters.headers) this.headers = parameters.headers;
            if (parameters.spacing) this.spacing = parameters.spacing;
            if (parameters.tableName) this.tableName = parameters.tableName;
        }
        this.childView = CommunityChartsInfoView;
        this.childViewOptions = { controller: this.controller, headers: this.headers, spacing: this.spacing};
    },

    templateContext: function() {
        return {...this.headers, ...this.spacing}
    }
});