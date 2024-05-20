
'use strict';

//
// cytoscape-graph.js
// Cytoscape view for interactive graphs
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
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
import Handlebars from 'handlebars';
import Highcharts from 'highcharts';
import cytoscape from 'cytoscape';

// TODO: this is quick hack using a hard-coded network, needs to be generalized

export default Marionette.View.extend({
    template: Handlebars.compile('<div id="cytoscape-graph" class="inline-chart"></div>'),

    initialize: function(parameters) {
        this.series = null;
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.title) this.title = parameters.title;
            if (parameters.subtitle) this.subtitle = parameters.subtitle;
            if (parameters.series) this.series = parameters.series;
            if (parameters.drilldown) this.drilldown = parameters.drilldown;
        }
    },

    showChart: function() {
        let doc = $(this.el);
        this.cy = cytoscape({

          container: doc.find('#cytoscape-graph'), // container to render in

          elements: [ // list of graph elements to start with
            { // node a
              data: { id: 'Scott', type: 'agent' }
            },
            { // node a
              data: { id: 'airr:Repertoire:9135128879355662826-242ac113-0001-012', type: 'Repertoire' }
            },
            { // node b
              data: { id: 'airr:DataFile:1', type: 'DataFile'  }
            },
            { // node b
              data: { id: 'airr:Rearrangement:1', type: 'Rearrangement'  }
            },
            { // node b
              data: { id: 'vdjserver:app:parameters:1', type: 'vdjserver:type'  }
            },
            { // node b
              data: { id: 'vdjserver:statistics:1', type: 'vdjserver:type'  }
            },
            { // node b
              data: { id: 'vdjserver:activity:1', type: 'vdjserver:type:app', "vdjserver:app": "irplus-statistics-ls6-0.1u2" }
            },
            { // edge ab
              data: { id: '1', source: 'vdjserver:activity:1', target: 'airr:DataFile:1', label: 'uses' }
            },
            { // edge ab
              data: { id: '2', source: 'vdjserver:activity:1', target: 'airr:Rearrangement:1', label: 'uses' }
            },
            { // edge ab
              data: { id: '3', source: 'vdjserver:activity:1', target: 'vdjserver:app:parameters:1', label: 'uses' }
            },
            { // edge ab
              data: { id: '4', source: 'vdjserver:statistics:1', target: 'vdjserver:activity:1', label: 'isGeneratedBy' }
            },
            { // edge ab
              data: { id: '5', source: 'vdjserver:statistics:1', target: 'Scott', label: 'isAttributedTo' }
            }
          ],

/*    "agent": {
      "orcid:0000-0002-9889-1221": {
        "prov:type": {
          "$": "prov:Person",
          "type": "prov:QUALIFIED_NAME"
        },
        "foaf:givenName": "Scott",
        "foaf:mbox": "<mailto:scott.christley@utsouthwestern.edu>"
      }
    },
    "entity": {
      "airr:Repertoire:9135128879355662826-242ac113-0001-012": {
        "airr:type": "Repertoire",
        "vdjserver:type": "app:inputs",
        "vdjserver:uuid": "9135128879355662826-242ac113-0001-012"
      },
      "airr:DataFile:1": {
        "airr:type": "DataFile",
        "vdjserver:type": "app:inputs",
        "vdjserver:uuid": "9135128879355662826-242ac113-0001-012",
        "metadata_file": ""
      },
      "airr:Rearrangement:1": {
        "airr:type": "Rearrangement",
        "vdjserver:type": "app:inputs",
        "airr_tsv_file": ""
      },
      "vdjserver:app:parameters:1": {
        "vdjserver:type": "app:parameters",
        "file_type": "rearrangement",
        "creator": "scott_test1",
        "repertoire_id": "9135128879355662826-242ac113-0001-012"
      },
      "vdjserver:statistics:1": {
        "vdjserver:type": "statistics"
      }
    },
    "activity": {
      "vdjserver:activity:1": {
          "vdjserver:type": "app",
          "vdjserver:app": "irplus-statistics-ls6-0.1u2"
      }
    },
    "uses": {
      "vdjserver:app:input:1": {
        "prov:activity": "vdjserver:activity:1",
        "prov:entity": "airr:DataFile:1"
      },
      "vdjserver:app:input:2": {
        "prov:activity": "vdjserver:activity:1",
        "prov:entity": "airr:Rearrangement:1"
      },
      "vdjserver:app:parameters:1": {
        "prov:activity": "vdjserver:activity:1",
        "prov:entity": "vdjserver:app:parameters:1"
      }
    },
    "isGeneratedBy": {
      "vdjserver:app:output:1": {
        "prov:activity": "vdjserver:activity:1",
        "prov:entity": "vdjserver:statistics:1"
      } */

          style: [ // the stylesheet for the graph
            {
              selector: 'node[type="Repertoire"]',
              style: {
                'shape': 'square',
                'background-color': '#600',
                'label': 'data(id)'
              }
            },
            {
              selector: 'node[type="agent"]',
              style: {
                'shape': 'triangle',
                'background-color': '#600',
                'label': 'data(id)'
              }
            },
            {
              selector: 'node[type="vdjserver:type:app"]',
              style: {
                'shape': 'round-rectangle',
                'background-color': '#F0F',
                'label': 'data(vdjserver:app)'
              }
            },
            {
              selector: 'node',
              style: {
                'background-color': '#ccc',
                'label': 'data(id)'
              }
            },

            {
              selector: 'edge',
              style: {
                'width': 3,
                'line-color': '#600',
                'target-arrow-color': '#666',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)'
              }
            }
          ],

          layout: {
            name: 'grid',
            rows: 1
          }

        });
        console.log(this.cy.width());
        console.log(this.cy.height());
        let options = {
          name: 'breadthfirst',

          fit: true, // whether to fit the viewport to the graph
          directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
          padding: 30, // padding on fit
          circle: false, // put depths in concentric circles if true, put depths top down if false
          grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
          spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
          boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
          avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
          nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
          roots: undefined, // the roots of the trees
          depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
          animate: false, // whether to transition the node positions
          animationDuration: 500, // duration of animation in ms if enabled
          animationEasing: undefined, // easing of animation if enabled,
          animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
          ready: undefined, // callback on layoutready
          stop: undefined, // callback on layoutstop
          transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
        };

        var layout = this.cy.layout( options );
        layout.run();
        // Send visualize API request

    }
});
