//
// handlebars-utilities.js
// helper functions for handlebars
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

import Handlebars from 'handlebars';
import filesize from 'filesize';
import moment from 'moment';

// AIRR Schema
import { airr } from 'airr-js';

export var HandlebarsUtilities = {};

HandlebarsUtilities.registerRawPartial = function(templatePath, templateIdentifier) {

    $.get(App.templatePrefix + templatePath + '.html')
        .done(function(contents) {

            var template = Handlebars.compile(contents);

            var dictionary = {};
            dictionary[templateIdentifier] = template;

            Handlebars.registerPartial(dictionary);
        })
        ;
};

HandlebarsUtilities.registerAllHelpers = function() {

    // if two values are the same
    Handlebars.registerHelper('ifEquals', function(v1, v2, options) {

        if (v1 === v2) {
            return options.fn(this);
        }

        return options.inverse(this);
    });

    // if value is true
    Handlebars.registerHelper('ifTrue', function(v1) {
        if (v1 === true) {
            return true;
        }
        return false;
    });

    // if value is false
    Handlebars.registerHelper('ifFalse', function(v1) {
        if (v1 === false) {
            return true;
        }
        return false;
    });

    // if value is null or undefined
    Handlebars.registerHelper('ifNull', function(v1) {
        if (v1 === null) {
            return true;
        }
        if (v1 === undefined) {
            return true;
        }
        return false;
    });

    Handlebars.registerHelper('or', function(v1, v2) {
        return v1 || v2;
    });

    Handlebars.registerHelper('GetHumanReadableFileSize', function(data) {
        if (data) {
            return filesize(data, {base: 10});
        }
    });

    Handlebars.registerHelper('FormatDate', function(agaveDate) {
        var formattedDate = moment(new Date(agaveDate)).format('D-MMM-YYYY');
        return formattedDate;
    });

    Handlebars.registerHelper('FormatDateTime', function(agaveDate) {
        var formattedDate = moment(new Date(agaveDate)).format('D-MMM-YYYY h:mm a');
        return formattedDate;
    });

    Handlebars.registerHelper('GetTagDisplay', function(publicAttributes) {
        if (publicAttributes && publicAttributes['tags']) {
            var tags = publicAttributes['tags'];
            if (_.isArray(tags)) {
                tags = tags.join(', ');
            }
            return tags;
        }
    });

    // dynamically construct the popover text with AIRR schema info
    Handlebars.registerHelper('FieldHelpPopover', function(schema_name, field_name) {

        var schema = airr.get_schema(schema_name);
        if (!schema) {
            console.log('Internal ERROR: unknown schema ' + schema_name);
            return;
        }

        var field = schema['properties'][field_name];
        if (!field) {
            console.log('Internal ERROR: unknown field ' + field_name+ ' in schema ' + schema_name);
            return;
        }
        var title = '';
        if (field['title']) title = field['title'];
        else if (field['x-airr'] && field['x-airr']['name']) title = field['x-airr']['name'];
        var description = '';
        if (field['x-airr'] && field['x-airr']['miairr']) {
            description += '<em>MiAIRR:</em> <b>' + field['x-airr']['miairr'] + '</b><br>';
            description += '<em>MiAIRR field:</em> ' + field_name + '<br>';
        }
        if (field['nullable'] || (field['nullable'] == undefined))
            description += '<em>Nullable:</em> Value may be blank.<br>';
        else
            description += '<em>Nullable:</em> Value must be provided.<br>';
        if (field['description']) description += '<em>Description:</em> ' + field['description'].replace(/"/g, "'") + '<br>';
        else description += '<em>Description:</em> description missing<br>';
        if (field['example']) {
            if (! Array.isArray(field['example'])) {
                if (schema.is_ontology(field_name))
                    description += '<br><em>Example:</em> ' + field['example']['label'].replace(/"/g, "'");
                else
                    description += '<br><em>Example:</em> ' + field['example'].toString().replace(/"/g, "'");
            }
        }
        //console.log(field);

        return '<i class="fa fa-question-circle" data-toggle="popover" data-trigger="hover" data-html="true" data-container="body" id="' + field_name + '_help" title="' + title + '" data-content="' + description + '"></i>';
    });

    // dynamically construct the MiAIRR Star with AIRR schema info
    Handlebars.registerHelper('FieldStar', function(schema_name, field_name) {

        var schema = airr.get_schema(schema_name);
        if (!schema) {
            console.log('Internal ERROR: unknown schema ' + schema_name);
            return;
        }

        var field = schema['properties'][field_name];
        if (!field) {
            console.log('Internal ERROR: unknown field ' + field_name+ ' in schema ' + schema_name);
            return;
        }

        if (field['x-airr'] && field['x-airr']['miairr'])
            return '<i class="fa fa-star" data-toggle="tooltip" title="MiAIRR ' + field['x-airr']['miairr'] + ' field"></i>';

        return;
    });

    Handlebars.registerHelper('contains', function(needle, haystack, options) {
       needle = Handlebars.escapeExpression(needle);
       haystack = Handlebars.escapeExpression(haystack);
       return (haystack.indexOf(needle) > -1) ? options.fn(this) : options.inverse(this);
    });
};
