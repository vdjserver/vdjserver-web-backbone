define([
    'app',
], function(App) {

    'use strict';

    var PrestoViewFactory = {};

    PrestoViewFactory.GenerateWorkflowViews = function(config) {

        var workflowViews = [];

        for (var counter = 0; counter < config.length; counter++) {

            var viewName = config[counter];

            var view = PrestoViewFactory.GetView(
                viewName
            );

            workflowViews.push(view);
        }

        return workflowViews;
    };

    PrestoViewFactory.GetView = function(viewName) {

        var view;

        switch (viewName) {

            case 'barcode': {

                view = new App.Views.Presto.Barcode();

                break;
            }

            case 'UMI': {

                view = new App.Views.Presto.UMI();

                break;
            }

            case 'finalOutputFilename': {

                view = new App.Views.Presto.FinalOutputFilename();

                break;
            }

            case 'findUnique': {

                view = new App.Views.Presto.FindUnique();

                break;
            }

            case 'reversePrimer': {

                view = new App.Views.Presto.JPrimer();

                break;
            }

            case 'outputFilePrefix': {

                view = new App.Views.Presto.OutputFilePrefix();

                break;
            }

            case 'qualityLengthFilter': {

                view = new App.Views.Presto.QualityLengthFilter();

                break;
            }

            case 'sequenceType': {

                view = new App.Views.Presto.SequenceType();

                break;
            }

            case 'forwardPrimer': {

                view = new App.Views.Presto.VPrimer();

                break;
            }

            default: {
                break;
            }
        }

        return view;
    };

    App.Utilities.PrestoViewFactory = PrestoViewFactory;
    return PrestoViewFactory;
});
