
'use strict';

//
// ontology-search.js
// Ontology search from EMBL-EBI OLS API
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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
import AIRRSchema from 'airr-schema';

export default Backbone.Model.extend({
    ols_api: 'https://www.ebi.ac.uk/ols/api/search',
    ontology: null,
    query: '',
    top_node: null,
    top_node_iri: null,
    rows: 50, // limit the number of responses

    initialize: function(parameters) {
        if (parameters && parameters.schema) {
            this.schema = AIRRSchema[parameters.schema];
        }
        if (parameters && parameters.field) {
            this.field = parameters.field;
        }
        if (parameters && parameters.query) {
            this.query = parameters.query;
        }

        // find ontology in x-airr attributes
        if (this.schema) {
            var p = this.schema['properties'];
            var t = p[this.field];
            if (t && t['x-airr']) {
                var ont = t['x-airr']['ontology'];
                if (ont) {
                    this.top_node = ont['top_node'];
                }
            }
        }

        // get CURIE resolution info
        if (this.top_node) {
            var f = this.top_node['id'].split(':');
            if (AIRRSchema['CURIEMap'][f[0]]) {
                var p = AIRRSchema['CURIEMap'][f[0]]['default']['provider'];
                var m = AIRRSchema['CURIEMap'][f[0]]['default']['map'];
                if (p && m) {
                    this.ontology = AIRRSchema['InformationProvider']['parameter'][f[0]][p]['ontology_id'];
                    this.top_node_iri = AIRRSchema['CURIEMap'][f[0]]['map'][m]['iri_prefix'] + f[1]
                }
            }
        }
    },

    url: function() {
        return this.ols_api + '?ontology=' + this.ontology
            + '&q=' + encodeURIComponent(this.query)
            + '&childrenOf=' + this.top_node_iri
            + '&rows=' + this.rows;
    },

    performSearch: function() {
        var that = this;
        return that.fetch()
            .then(function() {
                // clean up the response
                var res = that.get('response');
                var terms = [];
                for (var r in res['docs']) {
                    var desc = '';
                    if (res['docs'][r]['description'])
                        desc = res['docs'][r]['description'][0];
                    terms.push({id: res['docs'][r]['obo_id'],
                        label: res['docs'][r]['label'],
                        description: desc});
                }
                that.set('terms', terms);
                return terms;
            });
    }
});

