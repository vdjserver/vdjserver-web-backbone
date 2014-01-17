(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    var _ = window._;

    var Agave = Backbone.Agave;

    var IO = {};

    IO.File = Agave.Model.extend({
        defaults: {
            'owner': null,
            'path': null
        },
        idAttribute: 'path',
        urlRoot: function() {
            //console.log("returning urlRoot");
            return '/files/v2/media/';
        },
        url: function() {
            //console.log("returning url");
            return '/files/v2/media/' + this.agaveToken.get('username');
        },
        modelUrl: function() {
            //console.log("returning modelUrl");
            return '/files/v2/media/' + this.id;
        },
        downloadUrl: function() {
            //console.log("returning downloadUrl");
            return Agave.agaveApiRoot + '/files/v2/media/' + this.id;
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

            //console.log("IO.file return path is: " + JSON.stringify(path));
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
            return '/files/v2/pems/' + this.id;
        }
    });


    IO.Listing = Agave.Collection.extend({
        model: IO.File,
        initialize: function(models, options) {
            if (options && options.path) {
                this.path = options.path;
            }
            //console.log('IO.Listing options are: ' + JSON.stringify(options));
        },
        url: function() {
            return '/files/v2/listings/' + this.path;
        },
        comparator: function(model) {
            return [model.get('type'), model.get('name')];
        },
        removeDotDirectory: function() {

            /*
                Basically, Agave v2 seems to be returning a '.' file (unix style)
                to show the current directory. For the purposes of this app
                that isn't really necessary, so we remove it here.
             */
            var dotDirectory = this.where({name: '.'});
            this.remove(dotDirectory);
        }
    });

/*
    IO.Share = Agave.Model.extend({
        initialize: function(attributes, options) {
            if (options && options.file) {
                this.file = options.file;
            }
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
*/

    Agave.IO = IO;
    return IO;
})(this);
