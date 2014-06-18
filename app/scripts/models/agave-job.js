define(['backbone'], function(Backbone) {

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

            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open('get', this.get('_links').self.href);
            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));

            xhr.onload = function() {
              if (this.status === 200 || this.status === 202) {
                window.saveAs(new Blob([this.response]), that.get('name'));
              }
            };
            xhr.send();

            return xhr;
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
                            case 'quality-stats':
                                paramOutput.push({
                                    //'quality_stats': {'out_prefix': parameters[key]}
                                    'quality_stats': {'out_prefix': 'pre-'}
                                });
                                break;

                            case 'composition-stats':
                                paramOutput.push({
                                    //'composition_stats': {'out_prefix': parameters[key]}
                                    'composition_stats': {'out_prefix': 'pre-'}
                                });
                                break;

                            case 'nucleotide-filter':
                                paramOutput.push({
                                    'character_filter': parameters[key]
                                });
                                break;

                            case 'length-filter':
                                paramOutput.push({
                                    'length_filter': {
                                        'min': parameters[keyCounter + 'length-filter-min'],
                                        'max': parameters[keyCounter + 'length-filter-max']
                                    }
                                });
                                break;

                            case 'homopolymer-filter':
                                paramOutput.push({
                                    'homopolymer_filter': parameters[key]
                                });
                                break;

                            case 'minimal-quality-filter':
                                paramOutput.push({
                                    'min_quality_filter': parameters[key]
                                });
                                break;

                            case 'minimal-average-quality-filter':
                                paramOutput.push({
                                    'average_quality_filter': parameters[key]
                                });
                                break;

                            case 'minimal-quality-window-filter':
                                paramOutput.push({
                                    'min_quality_window_filter': {
                                        'min_quality': parameters[key + '-min-quality'],
                                        'min_length': parameters[key + '-min-length']
                                    }
                                });
                                break;

                            case 'average-quality-window-filter':
                                paramOutput.push({
                                    'average_quality_window_filter': {
                                        'min_quality': parameters[key + '-min-quality'],
                                        'window_length': parameters[key + '-window-length'],
                                        'min_length': parameters[key + '-min-length']
                                    }
                                });
                                break;

                            case 'ambiguous-nucleotide-window-filter':
                                paramOutput.push({
                                    'ambiguous_window_filter': {
                                        'min_length': parameters[key + '-min-length'],
                                        'max_ambiguous': parameters[key + '-max-ambiguous']
                                    }
                                });
                                break;

                            case 'histogram':
                                paramOutput.push({
                                    'histogram': {
                                        'name': parameters[key],
                                        'out_path': 'TODO'
                                    }
                                });
                                break;

                            case 'find-unique-sequences':
                                paramOutput.push({
                                    'find_unique': {
                                        'min_length': parameters[key + '-min-length'],
                                        'ignore_ends': parameters[key + '-ignore-ends'],
                                        'fraction_match': parameters[key + '-fraction-match'],
                                       // Could add out_path_fasta or out_path_duplicates
                                    }
                                });
                                break;

                            case 'match-sequence-element':
                                console.log("match sequence element params are: " + JSON.stringify(parameters));
                                //console.log("key is: " + JSON.stringify(key));

                                var elementName = parameters[key];
                                //console.log("elementName is: " + elementName);
                                var reverse = parameters[key + '-reverse-complement'];
                                var trimmed = parameters[key + '-trimmed'];

                                var elements = [];
                                for (var i = 0; i < parameters[key].length; i++) {
                                    var elementCounter = parameters[key][i];
                                    console.log("elementCounter is: " + elementCounter);

                                    var startPosition = parameters[key + '-' + elementCounter + '-start-position'];
                                    var startPositionLocation = parameters[key + '-' + elementCounter + '-start-position-location'];
                                    var startPositionLocationSequence = parameters[key + '-' + elementCounter + '-start-position-location-sequence'];

                                    var endPosition = parameters[key + '-' + elementCounter + '-end-position'];
                                    var endPositionLocation = parameters[key + '-' + elementCounter + '-end-position-location'];
                                    var endPositionLocationSequence = parameters[key + '-' + elementCounter + '-end-position-location-sequence'];

                                    var sequenceFile = parameters[key + '-' + elementCounter + '-sequence-file'];
                                    var csvSequencesFile = parameters[key + '-' + elementCounter + '-csv-path'];
                                    var csvSequencesColumn = parameters[key + '-' + elementCounter + '-csv-column-name'];
                                    var required = parameters[key + '-' + elementCounter + '-required'];
                                    var minScore = parameters[key + '-' + elementCounter + '-minimum-score'];
                                    var allowGaps = parameters[key + '-' + elementCounter + '-allow-gaps'];
                                    var minMatchLength = parameters[key + '-' + elementCounter + '-minimum-match-length'];
                                    var valueName = parameters[key + '-' + elementCounter + '-value-name'];
                                    var scoreName = parameters[key + '-' + elementCounter + '-score-name'];
                                    var identityName = parameters[key + '-' + elementCounter + '-identity-name'];
                                    var cutLowerLocation = parameters[key + '-' + elementCounter + '-cut-lower-location'];
                                    var cutLowerLocationSequence = parameters[key + '-' + elementCounter + '-cut-lower-location-sequence'];
                                    var cutUpperLocation = parameters[key + '-' + elementCounter + '-cut-upper-location'];
                                    var cutUpperLocationSequence = parameters[key + '-' + elementCounter + '-cut-upper-location-sequence'];

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

                                paramOutput.push({
                                    'match': {
                                        'reverse': reverse,
                                        'trimmed': trimmed,
                                        'elements': elements,
                                    }
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
        createArchivePathDirectory: function(projectUuid) {

            var fullArchivePath = this.get('archivePath');
            var archivePathSplit = fullArchivePath.split('/');
            var relativeArchivePath = archivePathSplit[4];

            console.log("relativeArchivePath is: " + relativeArchivePath);

            var jxhr = $.ajax({
                data: 'action=mkdir&path=' + relativeArchivePath,
                headers: Backbone.Agave.oauthHeader(),
                type: 'PUT',
                url: Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/' + projectUuid + '/analyses',
            });

            return jxhr;
        },
        createJobMetadata: function(projectUuid) {
            var jxhr = $.ajax({
                data: {
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                },
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/jobs/metadata',
            });

            return jxhr;
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
});
