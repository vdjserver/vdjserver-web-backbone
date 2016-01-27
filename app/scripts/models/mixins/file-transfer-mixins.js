define([
    'app',
], function(App) {

    'use strict';

    var FileTransferMixins = {};

    FileTransferMixins.downloadUrlByPostit = function(url) {
        var jqxhr = $.ajax({
            headers: _.extend(
                {},
                Backbone.Agave.oauthHeader(),
                {
                    'Content-Type': 'application/json',
                }
            ),
            type:    'POST',
            url:     EnvironmentConfig.agave.host
                        + '/postits'
                        + '/v2'
                        ,
            data: JSON.stringify({
                'url': url,
                'method': 'GET',
                'maxUses': 1,
                'lifetime': 3600,
                'noauth': false,
            }),
        })
        .then(function(response) {
            response = JSON.parse(response);

            window.open(response.result._links.self.href);
        })
        ;

        return jqxhr;
    };

    App.Mixins.FileTransferMixins = FileTransferMixins;
    return FileTransferMixins;
});
