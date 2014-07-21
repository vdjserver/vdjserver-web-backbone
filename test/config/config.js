'use strict';

require.config({
    baseUrl: '../app/scripts/',
    deps: ['runner'],
    paths: {
        spec: '../../test/spec',
        runner: '../../test/config/runner',
        appConfig: 'requirejs-config'
    },
    shim: {
        runner: ['appConfig']
    }
});
