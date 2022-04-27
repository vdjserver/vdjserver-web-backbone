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

// AIRR Schema
import AIRRSchema from 'airr-schema';

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

    Handlebars.registerHelper('GetHumanReadableFileSize', function(data) {
        if (data) {
            return filesize(data, {base: 10});
        }
    });

    // dynamically construct the popover text with AIRR schema info
    Handlebars.registerHelper('FieldHelpPopover', function(schema_name, field_name) {

        // TODO: lookup field in schema
        var schema = AIRRSchema[schema_name];
        if (!schema) {
            console.log('Internal ERROR: unknown schema ' + schema_name);
            return;
        }

        var field = schema['properties'][field_name];
        if (!field) {
            console.log('Internal ERROR: unknown field ' + field_name+ ' in schema ' + schema_name);
            return;
        }
        var title = field['x-airr']['name']; // this will be field['title']
        var description = '';
        if (field['x-airr']['miairr']) {
            description += '<em>MiAIRR:</em> <b>' + field['x-airr']['miairr'] + '</b><br>';
            description += '<em>MiAIRR field:</em> ' + field_name + '<br>';
        }
        if ((field['x-airr']['nullable']) || (field['x-airr']['nullable'] == undefined))
            description += '<em>Nullable:</em> Value may be blank.<br>';
        else
            description += '<em>Nullable:</em> Value must be provided.<br>';
        description += '<em>Description:</em> ' + field['description'] + '<br>';
        if (field['example']) {
            if (field['$ref'] == '#/Ontology')
                description += '<br><em>Example:</em> ' + field['example']['value'];
            else
                description += '<br><em>Example:</em> ' + field['example'];
        }
        console.log(field);

        return '<i class="fa fa-question-circle" id="' + field_name + '_help" data-toggle="popover" title="' + title + '" data-html="true" data-content="' + description + '"></i>';
    });

    // dynamically construct the MiAIRR Star with AIRR schema info
    Handlebars.registerHelper('FieldStar', function(schema_name, field_name) {

        // TODO: lookup field in schema
        var schema = AIRRSchema[schema_name];
        if (!schema) {
            console.log('Internal ERROR: unknown schema ' + schema_name);
            return;
        }

        var field = schema['properties'][field_name];
        if (!field) {
            console.log('Internal ERROR: unknown field ' + field_name+ ' in schema ' + schema_name);
            return;
        }

        if (field['x-airr']['miairr'])
            return '<i class="fa fa-star" data-toggle="tooltip" data-placement="top" title="MiAIRR ' + field['x-airr']['miairr'] + ' field"></i>';

        return;
    });

    Handlebars.registerHelper('contains', function(needle, haystack, options) {
       needle = Handlebars.escapeExpression(needle);
       haystack = Handlebars.escapeExpression(haystack);
       return (haystack.indexOf(needle) > -1) ? options.fn(this) : options.inverse(this);
    });

    // Testing a helper that will set the variable value
    Handlebars.registerHelper("setVar", function(varName, varValue, options) {
      options.data.root[varName] = varValue;
    });

    // Truncating text (350 characters)
    Handlebars.registerHelper('truncate', function(options) {
        if ( options.fn(this).trim().split(" ").length > 30 ) {
            var message = options.fn(this);
            var shortText = $('<p>', {text: message})
            .html()
            .trim()
            .substring(0, 350)
            .split(" ")
            .slice(0, -1)
            .join(" ") + "..."

            return shortText;
        }
        return options.fn(this);
    });

    // Truncating text (75 characters)
    Handlebars.registerHelper('truncate_75', function(options) {
        if ( options.fn(this).trim().split(" ").length > 30 ) {
            var message = options.fn(this);
            var shortText = $('<p>', {text: message})
            .html()
            .trim()
            .substring(0, 75)
            .split(" ")
            .slice(0, -1)
            .join(" ") + "..."

            return shortText;
        }
        return options.fn(this);
    });
};
