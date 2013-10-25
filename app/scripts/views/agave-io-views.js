define(['app', 'fileSaver'], function(App){

    'use strict';

    var AgaveIO = {}, UtilViews = App.Views.Util;


    AgaveIO.Browser = Backbone.View.extend({
        template: 'io/browser',
        initialize: function() {

            if (App.Agave.token().isValid()) {

                this.collection.fetch({reset:true});

                this.setView('.io-files', new UtilViews.Alert({
                    model: new App.Models.MessageModel({body:'Loading your files...'}),
                    type: 'info'
                }));

                this.collection.on('reset', function() {

                    //this.collection.removeDotDirectory();
                    //console.log('collection reset. collection is: ' + JSON.stringify(this.collection));

                    this.setView('.io-files', new AgaveIO.FileList({collection: this.collection}));

                    var perms = new Backbone.Agave.IO.FilePermissions({path: this.collection.at(0).id});
                    perms.on('change', function() {

                        var currentDirectory = this.collection.where({name: '.'});
                        currentDirectory = currentDirectory[0];

                        var view = new AgaveIO.ListActions({model: perms, file: currentDirectory});
                        this.setView('.actions', view);
                        view.render();
                    }, this);
                    perms.fetch();


                    this.render();

/*
                        var view = new AgaveIO.ListActions({model: {url: "/"}, file: this.collection.at(0)});
                        this.setView('.actions', view);
                        view.render();
*/
                }, this);

            }
            else {
                this.setView('.io-files', new UtilViews.Alert({
                    model: new App.Models.MessageModel({body:'You must be logged in to view your Data.'}),
                    type: 'error'
                }));
            }

        },
        serialize: function() {
            if (this.collection.size() > 0) {

                var path  = this.collection.path;
                var parts = path.split('/');
                var pathParts = [];

                var url = '';
                for (var i = 0; i < parts.length; i++) {
                    url += '/' + parts[i];
                    pathParts.push({
                        url: url,
                        name: parts[i]
                    });
                }

                console.log('pathParts is: ' + JSON.stringify(pathParts));

                return { path: { parts: pathParts } };
            }
            else {
                return { path: '' };
            }
        }
    });

    AgaveIO.FileList = Backbone.View.extend({
        initialize: function() {
            this.collection.on('add', this.render, this);
            this.collection.on('remove', this.render, this);
        },
        beforeRender: function() {
            this.collection.each(function(listing) {
                if (listing.get('name') !== '..') {
                    this.insertView(new AgaveIO.File({model:listing}));
                }
            }, this);
        }
    });

    AgaveIO.ListActions = Backbone.View.extend({
        tagName: 'span',
        initialize: function() {

            console.log('listActions init ok. this options is: ' + JSON.stringify(this.options));

            var type  = this.options.file.get('format');
            var perms = this.model.get('permissions');
            var perm  = _.findWhere(perms, {'username':'you'});

            console.log("type is: " + JSON.stringify(type));
            console.log("perms is: " + JSON.stringify(perms));
            console.log("perm is: " + JSON.stringify(perm));
            console.log("this model is: " + JSON.stringify(this.model));

            if (perm.permission.read && type === 'file') {
                this.insertView(new AgaveIO.IOAction({
                    model: this.options.file,
                    'action': 'download',
                    'label': 'Download file',
                    'tagName': 'span',
                    'button': true
                }));
            }

            if (perm.permission.write && type === 'folder') {
                console.log('pre listAction insertView. this.options is: ' + JSON.stringify(this.options));
                console.log('listAction insertView. model is: ' + JSON.stringify(this.model));

                this.insertView(new AgaveIO.IOAction({
                    model:     this.options.file,
                    'action':  'upload',
                    'label':   'Upload file',
                    'tagName': 'span',
                    'button':  true
                }));
                this.insertView(new AgaveIO.IOAction({
                    model:     this.options.file,
                    'action':  'create-dir',
                    'label':   'Create directory',
                    'tagName': 'span',
                    'button':  true
                }));
            }
        }
    });

    AgaveIO.IOAction = Backbone.View.extend({
        template: 'io/action',
        events: {
            'click .io-action':'doAction'
        },
        serialize: function() {
            return {
                'action':this.options.action,
                'label': this.options.label,
                'button':this.options.button ? 'btn' : false
            };
        },
        doAction: function(e) {
            e.preventDefault();
            console.log('ioAction options are: ' + JSON.stringify(this.options));

            switch (this.options.action) {
                case 'create-dir':
                    var dirName = prompt('Please provide a name for the new directory.');
                    if (dirName) {
                        var that = this;
                        var dir = new Backbone.Agave.IO.File({
                            path:  dirName,
                            owner: App.Agave.token().get('username'),
                            name:  dirName,
                            type:  'dir'
                        });
                        dir.save({}, {
                            success: function() {
                                //dir.fetch();
                                console.log("that model is: " + JSON.stringify(that.model));
                                that.model.collection.add(dir);
                            },
                            //url: this.model.modelUrl(),
                            type: 'PUT',
                            emulateJSON: true,
                            data: {
                                path:   dirName,
                                action: 'mkdir'
                            }
                        });
                    }
                    break;

                case 'download':
                    var file = this.model;
                    var xhr = new XMLHttpRequest();
                    xhr.open('get', this.model.downloadUrl());
                    xhr.responseType = 'blob';
                    xhr.setRequestHeader('Authorization', 'Basic ' + App.Agave.token().getBase64());
                    xhr.onload = function() {
                        if (this.status === 200) {
                            saveAs(new Blob([this.response]), file.get('name'));
                        }
                    };
                    xhr.send();
                    break;

                case 'upload':
                    console.log('upload view ok. model is: ' + JSON.stringify(this.model));
                    var view = new UtilViews.ModalView({model: new App.Models.MessageModel({header:'Upload file'})}),
                        form = new AgaveIO.UploadForm({model: this.model});
                    form.cleanup = function() {
                        view.close();
                    };
                    view.insertView('.child-view', form);
                    view.$el.on('hidden', function() {
                        view.remove();
                        view = null;
                    });
                    view.render();
                    break;

                case 'delete':
                    var message = 'Are you sure you want to delete the ' + this.model.get('type') +' "' + this.model.get('name') + '"? This operation cannot be undone.';
                    if (this.model.get('type') === 'dir') {
                        message += ' Any files in this dir will also be deleted!';
                    }
                    if (confirm(message)) {
                        this.model.collection.remove(this.model);
                        this.model.destroy({url:this.model.modelUrl()});
                    }
                    break;
            }
            return false;
        }
    });

    AgaveIO.UploadForm = Backbone.View.extend({
        template: 'io/upload',
        initialize: function() {
            console.log('uploadForm init ok');
        },
        tagName: 'form',
        events: {
            'click .btn-upload': 'doUpload',
            'click .btn-cancel': 'cancelUpload'
        },
        doUpload: function(e) {
            e.preventDefault();
            if (this.el.fileToUpload.files.length > 0) {
                var formData = new FormData();
                var fileToUpload = this.el.fileToUpload.files[0];
                formData.append('fileToUpload', fileToUpload);
                var xhr = new XMLHttpRequest();
                var url = this.model.downloadUrl();
                xhr.open('POST', url , true);
                xhr.setRequestHeader('Authorization', 'Basic ' + App.Agave.token().getBase64());
                var that = this;
                xhr.onload = function() {
                    if (this.status === 200) {
                        that.remove();
                        var responseJson = JSON.parse(this.response);

                        var file = new Backbone.Agave.IO.File(responseJson.result);

                        console.log("file is: " + JSON.stringify(file));
                        that.model.collection.add(file);
                    }
                };
                xhr.send(formData);
            }
            return false;
        },
        cancelUpload: function(e) {
            e.preventDefault();
            this.remove();
            return false;
        }
    });

    AgaveIO.File = Backbone.View.extend({
        template: 'io/listing',
        initialize: function() {
            //console.log('agaveIO.file init. model is: ' + JSON.stringify(this.model));
        },
        attributes: function() {
            var that = this;
            return {
                'class': function() {
                    var classes = [
                        'io-listing',
                        'io-' + that.model.get('type'),
                        'io-' + that.model.get('format')
                    ];
                    if (that.model.get('name') === '..') {
                        classes.push('io-previous');
                    }
                    return classes.join(' ');
                }
            };
        },
        events: {
            'click .io-actions': 'showActions'
        },
        showActions: function() {

            console.log('showActions model is: ' + JSON.stringify(this.model));

            if (! this.permissions) {
                this.permissions = new Backbone.Agave.IO.FilePermissions({'path':this.model.id});

                console.log('permissions are: ' + JSON.stringify(this.permissions));

                this.permissions.on('change', function() {

                    console.log('post fetch permissions are: ' + JSON.stringify(this.permissions));

                    var perms = _.findWhere(this.permissions.get('permissions'), {'username':'you'});
                    var type  = this.model.get('type');

                    console.log('post fetch perms are: ' + JSON.stringify(perms));
                    console.log('post fetch type  is:  ' + JSON.stringify(type));

                    console.log('post fetch perm permission is: ' + JSON.stringify(perms.permission));

                    this.$el.find('.dropdown-menu').empty();
                    if (perms.permission.read) {
                        if (type === 'file') {
                            console.log('type match. insert will happen.');
                            this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'download',label:'Download file',tagName:'li'}));
                        }
                    }

                    if (perms.permission.write) {
                        if (type === 'dir') {
                            // new directory
                            this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'create-dir',label:'Create directory',tagName:'li'}));
                        }
                        // rename
                        // this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'rename',label:'Rename',tagName:'li'}));
                        // // move
                        // this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'move',label:'Move',tagName:'li'}));
                        // // copy
                        // this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'copy',label:'Copy',tagName:'li'}));
                        // delete
                        this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'delete',label:'Delete',tagName:'li'}));
                    }

                    if (perms.username === 'you' || perms.username === App.Agave.token().get('username')) {
                        // share
                        // this.insertView('.dropdown-menu', new AgaveIO.IOAction({model:this.model, action:'share',label:'Share',tagName:'li'}));
                    }
                    this.getViews('.dropdown-menu').each(function(view) { view.render(); });
                }, this);
                this.permissions.fetch();
            }
        },
        serialize: function() {
            var model = this.model;
            var json  = model.toJSON();

            json.lastModified = moment(json.lastModified, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYY-MM-DD hh:mm:ss');
            //console.log("json is: " + JSON.stringify(json));


            return json;
        }
    });

    AgaveIO.FileChooser = App.Views.FormViews.Field.extend({
        template: 'io/filechooser',
        events: {
            'click .btn-choose-file': 'chooseFile'
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        chooseFile: function(e) {
            e.preventDefault();
            var view = this, chooser = new UtilViews.ModalView({model: new App.Models.MessageModel({
                header: 'Choose ' + this.model.get('label'),
                body: this.model.get('help')
            })});

            var dialog = new AgaveIO.FileChooserDialog();
            dialog.cleanup = function() {
                chooser.close();
                view.model.set('defaultValue', dialog.selection);
            };
            chooser.setView('.child-view', dialog);
            chooser.render();
            chooser.$el.on('hidden', function() {
                chooser.remove();
            });
            return false;
        }
    });

    AgaveIO.FileChooserDialog = Backbone.View.extend({
        initialize: function() {
            this.collection = new Backbone.Agave.IO.Listing([], {path: App.Agave.token().get('username')});
            this.listenTo(this.collection, 'reset', this.render);
            this.collection.fetch({reset:true});
        },
        beforeRender: function() {
            if (this.collection.size() === 0 && ! this.__manager__.hasRendered) {
                this.insertView(new UtilViews.Alert({model: new App.Models.MessageModel({body: 'Loading your files...'})}));
            } else {
                this.template = 'io/filechooser-dialog';
                this.collection.each(function(item) {
                    this.insertView('.io-chooser', new AgaveIO.FileChooserItem({model: item}));
                }, this);
                this.insertView('.io-chooser-actions', new AgaveIO.FileChooserActions());
            }
        },
        events: {
            'click .io-chooser-item': function(e) {
                var item = $(e.currentTarget);
                this.currentModel = this.collection.at(item.index());
                item.addClass('active').siblings().removeClass('active');
                var actions = this.getView('.io-chooser-actions');
                actions.model = this.currentModel;
                actions.render();
            },
            'click .btn-browse': function() {
                var path = this.currentModel.get('path');
                if (this.currentModel.get('name') === '..') {
                    path = path.slice(0, path.lastIndexOf('/'));
                }
                this.collection.path = path.slice(1);
                this.collection.fetch({reset: true});
            },
            'click .btn-choose': function() {
                this.selection = this.currentModel.get('path');
                this.remove();
            },
            'click .btn-cancel': function() {
                this.remove();
            }
        }
    });

    AgaveIO.FileChooserActions = Backbone.View.extend({
        template: 'io/filechooser-actions',
        serialize: function() {
            var json = {model: typeof this.model !== 'undefined'};
            if (json.model) {
                json.directory = this.model.get('type') === 'dir';
            }
            return json;
        }
    });

    AgaveIO.FileChooserItem = Backbone.View.extend({
        template: 'io/filechooser-item',
        className: 'io-chooser-item',
        serialize: function() {
            return this.model.toJSON();
        }
    });

    App.Views.AgaveIO = AgaveIO;
    return AgaveIO;
});
