//
// project-files-pairing.js
// Pair read files
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

// modal view to perform read pairing
import template from 'Templates/project/files/project-files-pairing.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),
    region: '#modal',

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.files)
            this.files = parameters.files;
        this.anchor_guess = this.files.guessAnchor();
        this.pair_mode = 'paired-end';
        this.pair_results = null;
    },

    templateContext() {
        return {
            forward_guess: this.anchor_guess['forward'],
            reverse_guess: this.anchor_guess['reverse']
        }
    },

    events: {
        'click #select-paired-end-files': function(e) {
            console.log('paired-end files');
            $("#read-quality-files-form").addClass("no-display");
            $("#paired-end-files-form").removeClass("no-display");
            this.pair_mode = 'paired-end';
        },
        'click #select-read-quality-files': function(e) {
            console.log('read/quality files');
            $("#paired-end-files-form").addClass("no-display");
            $("#read-quality-files-form").removeClass("no-display");
            this.pair_mode = 'read-quality';
        },
        'click #perform-pairing-button': function(e) {
            console.log('perform pairing');
            let data = { 'mode': this.pair_mode };
            if (this.pair_mode == 'paired-end') {
                data['forward'] = $("#forward-read-anchor").val();
                data['reverse'] = $("#reverse-read-anchor").val();
            } else {
                data['read'] = $("#read-file-anchor").val();
                data['quality'] = $("#quality-file-anchor").val();
            }
            this.pair_results = this.files.pairFiles(data);
            console.log(this.pair_results);
        },
    }

});
