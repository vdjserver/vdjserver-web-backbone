/**
  * Backbone Agave I/O
  * Version 0.1
  *
  */
(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    var _ = window._;

    var Agave = Backbone.Agave;

    var IO = Agave.IO = {};

    IO.File = Agave.Model.extend({
        defaults: {
            'owner': null,
            'path': null
        },
        idAttribute: 'path',
        urlRoot: '/io-v1/io',
        url: function() {
            return '/io-v1/io' + this.id;
        },
        modelUrl: function() {
            return '/io-v1/io' + this.id;
        },
        downloadUrl: function() {
            return Agave.agaveApiRoot + '/io-v1/io' + this.id;
        },
        directoryPath: function() {
            var path = this.get('path');
            if (this.get('type') === 'dir') {
                if (path.lastIndexOf('/') !== path.length - 1) {
                    path += '/';
                }
            } else {
                path = path.substring(0, path.lastIndexOf('/') + 1);
            }
            return path;
        },
        parentDirectoryPath: function() {
            var path = this.directoryPath().substring(0, this.directoryPath().lastIndexOf('/'));
            return path.substring(0, path.lastIndexOf('/'));
        },
        // canRead: function() {
        //   return ['READ','READ_WRITE','READ_EXECUTE','ALL','OWN'].indexOf(this.get('permissions')) >= 0;
        // },
        // canWrite: function() {
        //   return ['READ_WRITE','WRITE','WRITE_EXECUTE','ALL','OWN'].indexOf(this.get('permissions')) >= 0;
        // },
        // canExecute: function() {
        //   return ['READ_EXECUTE','WRITE_EXECUTE','EXECUTE','ALL','OWN'].indexOf(this.get('permissions')) >= 0;
        // },
        // isOwner: function() {
        //   return this.get('permissions') === 'OWN';
        // },
        parse: function(resp) {
           
            var result = resp;
            if (resp.result) {
                result = resp.result;
            }
            if (_.isArray(result)) {
                return result[0];
            } else {
                return result;
            }
            
        }
    });


    IO.FilePermissions = Agave.Model.extend({
        idAttribute: 'path',
        url: function() {
            return '/files/pems/' + this.id;
        }
    });


    IO.Listing = Agave.Collection.extend({
        model: IO.File,
        initialize: function(models, options) {
            this.path = options.path;
            //console.log('IO.Listing options are: ' + JSON.stringify(options));
        },
        url: function() {
            return '/files/listings/' + this.path;
        },
        comparator: function(model) {
            return [model.get('type'), model.get('name')];
        }
    });

    IO.Share = Agave.Model.extend({
        initialize: function(attributes, options) {
            this.file = options.file;
        },
        url: function() {
            var owner = this.file.get('owner'),
                path = this.file.get('path');
            if (owner && path) {
                return '/io-v1/io/share/' + owner + '/' + path;
            }
        },
        shareLink: function() {
            if (this.isPublic()) {
                return Agave.agaveApiRoot + '/io-v1/io/download/' + this.file.get('owner') + this.file.get('path');
            }
        }
    });

    return IO;
})(this);
