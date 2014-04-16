(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var FileMetadata = {};

    FileMetadata = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'projectFile',
                    owner: '',
                    value: {
                        'projectUuid': '',
                        'fileCategory': ''
                    }
                }
            );
        },
        initialize: function() {
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        syncMetadataPermissionsWithProjectPermissions: function() {

            var value = this.get('value');

            var jxhr = $.ajax({
                data: {
                    projectUuid: value.projectUuid,
                    uuid: this.get('uuid')
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + Backbone.Agave.instance.token().get('access_token'))
                },
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/metadata'
            });

            return jxhr;
        }

    });

    Backbone.Agave.Model.FileMetadata = FileMetadata;
    return FileMetadata;
})(this);
