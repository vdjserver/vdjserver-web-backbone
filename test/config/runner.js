define([

    '../../test/spec/app-tests',
    
    // Agave
    '../../test/spec/vendor/agave-tests',

    // Models
    '../../test/spec/models/agave-account-tests',
    '../../test/spec/models/agave-io-tests',
    '../../test/spec/models/agave-profile-tests',
    '../../test/spec/models/agave-project-tests',

    // Collections
    '../../test/spec/collections/agave-projects-tests'

], function() {
    'use strict';

    window.console = window.console || function() {};
    window.notrack = true;
    window.mocha.run();
});
