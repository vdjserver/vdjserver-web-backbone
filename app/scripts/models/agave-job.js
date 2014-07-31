define(['app', 'backbone'], function(App, Backbone) {

    'use strict';

    var Job = {};

    Job.Detail = Backbone.Agave.Model.extend({
        defaults: {
            id: '',
        },
        url: function() {
            return '/jobs/v2/' + this.get('id');
        },
    });

    Job.OutputFile = Backbone.Agave.Model.extend({
        idAttribute: 'name',
        downloadFile: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type: 'GET',
                url: this.get('_links').self.href,
            });
            return jqxhr;
        },
    });

    Job.Listing = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'projectJob',
                    owner: '',
                    value: {
                        'projectUuid': '',
                        'jobUuid': '',
                    },
                }
            );
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
    });

    Job.VdjPipe = Backbone.Agave.JobModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    appId: 'vdj_pipe-0.0.12u1',
                }
            );
        },
        generateVdjPipeConfig: function(parameters, fileMetadata) {

            var outputConfig = {
                'base_path_input': '',
                'base_path_output': '',
                'csv_file_delimiter': '\\t',
                'single_read_pipe': [],
            };

            var paramOutput = [];
            var inputOutput = [];

            for (var key in parameters) {

                if (parameters.hasOwnProperty(key)) {
                    //console.log("key is: " + key);
                    if (key !== 'formtype' && key !== 'job-name') {
                        var keyCounterIndex = key.indexOf('-') + 1;
                        var keyCounter = key.slice(0, keyCounterIndex);
                        var vdjPipeParam = key.slice(keyCounterIndex);

                        //console.log("keyCounterIndex is: " + keyCounterIndex);
                        //console.log("keyCounter is: " + keyCounter);
                        //console.log("vdjPipeParam is: " + vdjPipeParam);

                        switch(vdjPipeParam) {

                            case 'ambiguous_window_filter':
                                paramOutput.push({
                                    'ambiguous_window_filter': {
                                        'min_length':    parseInt(parameters[key + '-min-length']),
                                        'max_ambiguous': parseInt(parameters[key + '-max-ambiguous']),
                                    },
                                });

                                break;

                            case 'average_quality_window_filter':
                                paramOutput.push({
                                    'average_quality_window_filter': {
                                        'min_quality':   parseFloat(parameters[key + '-min-quality']),
                                        'window_length': parseInt(parameters[key + '-window-length']),
                                        'min_length':    parseInt(parameters[key + '-min-length']),
                                    },
                                });

                                break;

                            case 'composition_stats':
                                paramOutput.push({
                                    //'composition_stats': {'out_prefix': parameters[key]}
                                    'composition_stats': {'out_prefix': 'pre-'},
                                });

                                break;

                            case 'find_sequences_from_multiple_groups':

                                var tmpFindIntersection = {
                                    'find_intersection': {
                                        'min_length': parseInt(parameters[key + '-min-length']),
                                    },
                                };

                                if (parameters[key + '-fraction-match']) {
                                    tmpFindIntersection.find_intersection.fraction_match = parseFloat(parameters[key + '-fraction-match']);
                                }
                                else if (parameters[key + '-ignore-ends']) {
                                    tmpFindIntersection.find_intersection.ignore_ends = parseInt(parameters[key + '-ignore-ends']);
                                }

                                paramOutput.push(tmpFindIntersection);

                                break;

                            case 'find_unique_sequences':
                                paramOutput.push({
                                    'find_unique': {
                                        'min_length':   parseInt(parameters[key + '-min-length']),
                                        'ignore_ends':  parseInt(parameters[key + '-ignore-ends']),
                                        'fraction_match': parseFloat(parameters[key + '-fraction-match']),
                                       // Could add out_path_fasta or out_path_duplicates
                                    },
                                });

                                break;

                            case 'histogram':
                                paramOutput.push({
                                    'histogram': {
                                        'name': parameters[key + '-name'],
                                        //'out_path': 'TODO',
                                    },
                                });

                                break;

                            case 'homopolymer_filter':
                                paramOutput.push({
                                    'homopolymer_filter': parseInt(parameters[key]),
                                });

                                break;

                            case 'length_filter':
                                paramOutput.push({
                                    'length_filter': {
                                        'min': parseInt(parameters[keyCounter + 'length-filter-min']),
                                        'max': parseInt(parameters[keyCounter + 'length-filter-max']),
                                    },
                                });

                                break;

                            case 'match_external_molecular_identifier':
                                paramOutput.push({
                                    'eMID_map': {
                                        'value_name': parameters[key + '-value-name'],
                                        'fasta_path': parameters[key + '-fasta-file'],
                                        'pairs_path': parameters[key + '-pairs-file'],
                                    },
                                });

                                break;

                            case 'match':
                                console.log("match sequence element params are: " + JSON.stringify(parameters));
                                console.log("key is: " + JSON.stringify(key));

                                var elementName = parameters[key];
                                var reverse = parameters[key + '-reverse-complement'];
                                var trimmed = parameters[key + '-trimmed'];

                                var elements = [];
                                for (var i = 0; i < parameters[key + '-elements'].length; i++) {
                                    var elementCounter = parameters[key + '-elements'][i];
                                    console.log("elementCounter is: " + JSON.stringify(elementCounter));

                                    var startPosition = parameters[key + '-' + elementCounter + '-element-start-position'];
                                    var startPositionLocation = parameters[key + '-' + elementCounter + '-element-start-position-location'];
                                    var startPositionLocationSequence = parameters[key + '-' + elementCounter + '-element-start-position-location-sequence'];

                                    var endPosition = parameters[key + '-' + elementCounter + '-element-end-position'];
                                    var endPositionLocation = parameters[key + '-' + elementCounter + '-element-end-position-location'];
                                    var endPositionLocationSequence = parameters[key + '-' + elementCounter + '-element-end-position-location-sequence'];

                                    var sequenceFile = parameters[key + '-' + elementCounter + '-element-sequence-file'];
                                    var csvSequencesFile = parameters[key + '-' + elementCounter + '-element-csv-path'];
                                    var csvSequencesColumn = parameters[key + '-' + elementCounter + '-element-csv-column-name'];
                                    var required = parameters[key + '-' + elementCounter + '-element-required'];
                                    var minScore = parameters[key + '-' + elementCounter + '-element-minimum-score'];
                                    var allowGaps = parameters[key + '-' + elementCounter + '-element-allow-gaps'];
                                    var minMatchLength = parameters[key + '-' + elementCounter + '-element-minimum-match-length'];
                                    var valueName = parameters[key + '-' + elementCounter + '-element-value-name'];
                                    var scoreName = parameters[key + '-' + elementCounter + '-element-score-name'];
                                    var identityName = parameters[key + '-' + elementCounter + '-element-identity-name'];
                                    var cutLowerLocation = parameters[key + '-' + elementCounter + '-element-cut-lower-location'];
                                    var cutLowerLocationSequence = parameters[key + '-' + elementCounter + '-element-cut-lower-location-sequence'];
                                    var cutUpperLocation = parameters[key + '-' + elementCounter + '-element-cut-upper-location'];
                                    var cutUpperLocationSequence = parameters[key + '-' + elementCounter + '-element-cut-upper-location-sequence'];

                                    var element = {};

                                    if (startPosition) {

                                        // Convert to int
                                        startPosition = parseInt(startPosition);

                                        element.start = {};
                                        element.start.pos = startPosition;

                                        if (startPositionLocation && startPositionLocationSequence) {
                                            if (startPositionLocation === 'before') {
                                                element.start.before = startPositionLocationSequence;
                                            }
                                            else if (startPositionLocation === 'after') {
                                                element.start.after = startPositionLocationSequence;
                                            }
                                        }
                                    }

                                    if (endPosition) {

                                        // Convert to int
                                        endPosition = parseInt(endPosition);

                                        element.end = {};
                                        element.end.pos = endPosition;

                                        if (endPositionLocation && endPositionLocationSequence) {
                                            if (endPositionLocation === 'before') {
                                                element.end.before = endPositionLocationSequence;
                                            }
                                            else if (endPositionLocation === 'after') {
                                                element.end.after = endPositionLocationSequence;
                                            }
                                        }
                                    }

                                    if (sequenceFile) {
                                        element.seq_file = sequenceFile;
                                    }

                                    if (csvSequencesColumn || csvSequencesFile) {

                                        element.csv_file = {};

                                        if (csvSequencesColumn) {
                                            element.csv_file.sequences_column = csvSequencesColumn;
                                        }

                                        if (csvSequencesFile) {
                                            element.csv_file.path = csvSequencesFile;
                                        }
                                    }

                                    if (required) {
                                        element.required = required;
                                    }

                                    if (minScore) {

                                        // Convert to int
                                        minScore = parseInt(minScore);

                                        element.min_score = minScore;
                                    }

                                    if (allowGaps) {
                                        element.allow_gaps = allowGaps;
                                    }

                                    if (minMatchLength) {

                                        // Convert to int
                                        minMatchLength = parseInt(minMatchLength);

                                        element.min_match_length = minMatchLength;
                                    }

                                    if (valueName) {
                                        element.value_name = valueName;
                                    }

                                    if (scoreName) {
                                        element.score_name = scoreName;
                                    }

                                    if (identityName) {

                                        element.identity_name = identityName;
                                    }

                                    if (cutLowerLocation && cutLowerLocationSequence) {

                                        // Convert to int
                                        cutLowerLocationSequence = parseInt(cutLowerLocationSequence);

                                        element.cut_lower = {};

                                        if (cutLowerLocation === 'before') {
                                            element.cut_lower.before = cutLowerLocationSequence;
                                        }
                                        else if (cutLowerLocation === 'after') {
                                            element.cut_lower.after = cutLowerLocationSequence;
                                        }
                                    }

                                    if (cutUpperLocation && cutUpperLocationSequence) {

                                        // Convert to int
                                        cutUpperLocationSequence = parseInt(cutUpperLocationSequence);

                                        element.cut_upper = {};

                                        if (cutUpperLocation === 'before') {
                                            element.cut_upper.before = cutUpperLocationSequence;
                                        }
                                        else if (cutUpperLocation === 'after') {
                                            element.cut_upper.after = cutUpperLocationSequence;
                                        }
                                    }

                                    console.log("element finished: " + JSON.stringify(element));
                                    elements.push(element);
                                }

                                var combinationObjects = [];
                                for (var i = 0; i < parameters[key + '-combination-objects'].length; i++) {

                                    var combinationObject = {};

                                    var objectCounter = parameters[key + '-combination-objects'][i];
                                    console.log("objectCounter is: " + JSON.stringify(objectCounter));

                                    var objectFile = parameters[key + '-' + objectCounter + '-combination-object-file'];
                                    var valueName = parameters[key + '-' + objectCounter + '-combination-object-value-name'];
                                    var valuesColumn = parameters[key + '-' + objectCounter + '-combination-object-values-column'];
                                    var namesColumn = parameters[key + '-' + objectCounter + '-combination-object-names-column'];

                                    console.log("obj file is: " + objectFile);
                                    console.log("obj value is: " + valueName);
                                    console.log("obj values2 is: " + valuesColumn);
                                    console.log("obj names is: " + namesColumn);

                                    if (objectFile && valuesColumn && namesColumn) {
                                        combinationObject.path = objectFile;
                                        combinationObject.values_column = valuesColumn;
                                        combinationObject.names_column = namesColumn;

                                        if (valueName) {
                                            combinationObject.value_name = valueName;
                                        }

                                        combinationObjects.push(combinationObject);
                                    }
                                }

                                var matchObject = {
                                    'match': {
                                        'reverse': reverse,
                                        'trimmed': trimmed,
                                        'elements': elements,
                                    },
                                };


/*
                                if (elements) {
                                    paramOutput.match.elements = {};
                                    paramOutput.match.elements = elements;
                                }
*/

                                if (combinationObjects) {
                                    matchObject.combinations = {};
                                    matchObject.combinations = combinationObjects;
                                }

                                paramOutput.push(matchObject);

                                break;

                            case 'merge_paired_reads':
                                paramOutput.push({
                                    'merge_paired': {
                                        'min_score': parseInt(parameters[key]),
                                    },
                                });

                                break;

                            case 'min_average_quality_filter':
                                paramOutput.push({
                                    'average_quality_filter': parseFloat(parameters[key]),
                                });

                                break;

                            case 'min_quality_filter':
                                paramOutput.push({
                                    'min_quality_filter': parseInt(parameters[key]),
                                });

                                break;

                            case 'min_quality_window_filter':
                                paramOutput.push({
                                    'min_quality_window_filter': {
                                        'min_quality': parseInt(parameters[key + '-min-quality']),
                                        'min_length': parseInt(parameters[key + '-min-length']),
                                    },
                                });

                                break;

                            case 'nucleotide_filter':
                                paramOutput.push({
                                    'character_filter': parameters[key],
                                });

                                break;

                            case 'quality_stats':
                                paramOutput.push({
                                    //'quality_stats': {'out_prefix': parameters[key]}
                                    'quality_stats': {'out_prefix': 'pre-'},
                                });

                                break;

                            case 'write_sequence':
                                paramOutput.push({
                                    'write_sequence': {
                                        'out_path': parameters[key + '-output-path'],
                                        'unset_value': parameters[key + '-unset-value'],
                                        'trimmed': parameters[key + '-trimmed'],
                                        'reverse_complemented': parameters[key + '-reverse-complemented'],
                                        'skip_empty': parameters[key + '-skip-empty'],
                                    },
                                });

                                break;

                            case 'write_value':

                                var writeValuesNames = parameters[key + '-names'];
                                writeValuesNames = writeValuesNames.split(',');

                                paramOutput.push({
                                    'write_value': {
                                        'names': writeValuesNames,
                                        'out_path': parameters[key + '-out-path'],
                                        'unset_value': parameters[key + '-unset-value'],
                                    },
                                });

                                break;

                            default:
                                break;
                        }
                    }
                }
            }

            for (var i = 0; i < fileMetadata.length; i++) {
                //console.log("values are: " + JSON.stringify(fileMetadata.at([i])));
                var value = fileMetadata.at([i]).get('value');

                if (value.isForwardRead) {
                    inputOutput.push({
                        'forward_seq': value.name
                    });
                }
            }

            //console.log("paramOutput is: " + JSON.stringify(paramOutput));
            //console.log("inputOutput is: " + JSON.stringify(inputOutput));

            outputConfig.input = inputOutput;
            outputConfig.single_read_pipe = paramOutput;

            console.log("outputConfig is: " + JSON.stringify(outputConfig));

            this.set('parameters', {
                'json': JSON.stringify(outputConfig),
            });
        },
        setFilesParameter: function(filePaths) {

            filePaths = filePaths.join(';');

            this.set('inputs', {
                'files': filePaths,
            });
        },
        setArchivePath: function(projectUuid) {
            var archivePath = '/projects/'
                            + projectUuid
                            + '/analyses/'
                            + moment().format('YYYY-MM-DD-HH-mm-ss-SS')
                            + '-' + this.getDirectorySafeName(this.get('name'));

            this.set('archivePath', archivePath);

            console.log("archivePath is: " + archivePath);
        },
        getDirectorySafeName: function(name) {
            console.log("name input is: " + name);
            return name.replace(/\s/g, '-').toLowerCase();
        },
        getRelativeArchivePath: function() {
            var fullArchivePath = this.get('archivePath');
            var archivePathSplit = fullArchivePath.split('/');
            var relativeArchivePath = archivePathSplit[4];

            return relativeArchivePath;
        },
        createArchivePathDirectory: function(projectUuid) {

            var relativeArchivePath = this.getRelativeArchivePath();

            console.log("relativeArchivePath is: " + relativeArchivePath);

            var jqxhr = $.ajax({
                data: 'action=mkdir&path=' + relativeArchivePath,
                headers: Backbone.Agave.oauthHeader(),
                type: 'PUT',
                url: Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/' + projectUuid + '/analyses',
            });

            return jqxhr;
        },
        createJobMetadata: function(projectUuid) {
            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/jobs/metadata',
            });

            return jqxhr;
        },
        shareJobWithProjectMembers: function(projectUuid) {
            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/jobs',
            });

            return jqxhr;
        },
    });

    Job.Workflow = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'vdjpipeWorkflow',
                    owner: '',
                    value: {
                        'config': '',
                        'workflowName': '',
                    },
                }
            );
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        setConfigFromFormData: function(formData) {

            var config = App.Models.Helpers.VdjPipeUtilities.SerializeVdjPipeConfig(formData);

            var workflowName = App.Models.Helpers.VdjPipeUtilities.GetWorkflowName(formData);

            this.set(
                'value', 
                {
                    'config': config,
                    'workflowName': workflowName,
                }
            )
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
});
