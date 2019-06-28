define([
    'app',
], function(App) {

    'use strict';

    var RepCalcViewFactory = {};

    RepCalcViewFactory.GenerateWorkflowViews = function(config) {

        var workflowViews = [];

        for (var counter = 0; counter < config.length; counter++) {

            var viewName = config[counter];

            var view = RepCalcViewFactory.GetView(
                viewName
            );

            workflowViews.push(view);
        }

        return workflowViews;
    };

    RepCalcViewFactory.GetView = function(viewName) {

        var view;

        switch (viewName) {

            case 'geneSegment': {

                view = new App.Views.RepCalc.GeneSegmentUsage();

                break;
            }

            case 'CDR3': {

                view = new App.Views.RepCalc.CDR3();

                break;
            }

            case 'diversity': {

                view = new App.Views.RepCalc.Diversity();

                break;
            }

            case 'mutations': {

                view = new App.Views.RepCalc.MutationalAnalysis();

                break;
            }

            case 'lineage': {

                view = new App.Views.RepCalc.LineageAnalysis();

                break;
            }

            case 'clones': {

                view = new App.Views.RepCalc.ClonalAnalysis();

                break;
            }

            default: {
                break;
            }
        }

        return view;
    };

    App.Utilities.RepCalcViewFactory = RepCalcViewFactory;
    return RepCalcViewFactory;
});
