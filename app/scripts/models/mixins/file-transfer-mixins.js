define([
    'app',
    'chance',
], function(
    App,
    Chance
) {

    'use strict';

    var FileTransferMixins = {};

    FileTransferMixins.downloadUrlByPostit = function(url) {

        url += '?force=true';

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

            var targetUrl = response.result._links.self.href;

            return targetUrl;
        })
        /*
            Create an invisible link on the DOM, and programmatically click it

            I realize that this seems like something that the view controller should do,
            but I feel like this is worth handling in the model because:

            * we're only using it for file downloads
            * it has no visible effect on the DOM
            * it's temporary
            * it is only concerned with initiating data transfer, which is what the user is trying to do anyway
        */
        .then(function(targetUrl) {

            var chance = new Chance();
            var guid = chance.guid();

            var postitDownloadSelector = 'postit-download-' + guid;

            var link = document.createElement('a');
            link.setAttribute('download', null);
            link.setAttribute('href', targetUrl);
            link.style.display = 'none';
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        })
        ;

        return jqxhr;
    };

    App.Mixins.FileTransferMixins = FileTransferMixins;
    return FileTransferMixins;
});
