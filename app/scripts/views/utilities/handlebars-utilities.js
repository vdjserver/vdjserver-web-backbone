define([
    'app',
    'handlebars',
], function(App, Handlebars) {

    'use strict';

    var HandlebarsUtilities = {};

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

    App.Utilities.HandlebarsUtilities = HandlebarsUtilities;
    return HandlebarsUtilities;
});
