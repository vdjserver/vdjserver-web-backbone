define([

    '../../test/spec/app-tests',

    // Agave
    '../../test/spec/vendor/agave-tests',

    // Models
    '../../test/spec/models/agave-profile-tests',
    '../../test/spec/models/agave-project-tests',
    '../../test/spec/models/agave-job-tests',

    // Collections
    '../../test/spec/collections/agave-projects-tests'

], function() {
    'use strict';

    /*
    window.console = window.console || function() {};
    window.notrack = true;
    window.mocha.run();
    */
    mocha.run();
});
