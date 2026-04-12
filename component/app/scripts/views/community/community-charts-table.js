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
            if (parameters.fields) this.fields = parameters.fields;
            else this.fields = [];
        }
    },

    templateContext: function() {
        let values = { body1: '', body2: '', body3:'', body4:'', body5:'', body6:'' };
        for (let i = 0; i < this.fields.length; ++i) {
            let f = this.fields[i];
            if (f && this.model.get(f)) values['body' + (i + 1)] = this.model.get(f);
        }
        return {...values, ...this.spacing}
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
            if (parameters.fields) this.fields = parameters.fields;
            if (parameters.tableName) this.tableName = parameters.tableName;
        }
        this.childView = CommunityChartsInfoView;
        this.childViewOptions = { controller: this.controller, headers: this.headers, spacing: this.spacing, fields: this.fields};
    },

    templateContext: function() {
        return {...this.headers, ...this.spacing}
    }
});