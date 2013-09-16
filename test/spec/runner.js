define([
    'spec/test'
], function() {
    'use strict';

    window.console = window.console || function() {};
    window.notrack = true;
    window.mocha.run();
});
