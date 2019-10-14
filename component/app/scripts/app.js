
//import 'handlebars';
//import 'backbone';
//import 'layoutmanager';

define([
    'handlebars',
    'backbone',
    'layoutmanager',
], function(
    Handlebars
) {

    'use strict';

    var App = {
        root: '/',
        templatePrefix: 'templates/',
        init: function() {

            var JST = window.JST = window.JST || {};

            // Configure LayoutManager with Backbone Boilerplate defaults.
            Backbone.Layout.configure({
                // Allow LayoutManager to augment Backbone.View.prototype.
                manage: true,

                prefix: App.templatePrefix,

                fetchTemplate: function(path) {

                    // Concatenate the file extension.
                    path = path + '.html';

                    // If cached, use the compiled template.
                    if (JST[path]) {
                        return JST[path];
                    }

                    // Put fetch into `async-mode`.
                    var done = this.async();

                    // Seek out the template asynchronously.
                    $.get(App.root + path, function(contents) {
                        done(JST[path] = Handlebars.compile(contents));
                    });

                },
                renderTemplate: function(tmpl, context) {
                    return tmpl(context);
                }
            });

            // setup agave
            App.Agave = new Backbone.Agave({token: JSON.parse(window.localStorage.getItem('Agave.Token'))});

            if (EnvironmentConfig.debug.console) {
                console.log('token is: ' + JSON.stringify(App.Agave.token()));
            }

            App.listenTo(
                App.Agave.token(),
                'change',
                function() {
                    // Necessary for browser refresh...
                    window.localStorage.setItem('Agave.Token', JSON.stringify(App.Agave.token().toJSON()));
                }
            );

            App.listenTo(
                App.Agave.token(),
                'destroy',
                function() {
                    App.Agave.token().clear();
                    window.localStorage.removeItem('Agave.Token');
                    App.router.navigate('', {'trigger': true});
                }
            );

            // initialize router, views, data and layouts
            App.Layouts.main = new App.Views.Layouts.MainLayout();
            App.Layouts.sidebar = new App.Views.Layouts.SidebarLayout();
            App.Layouts.content = new App.Views.Layouts.ContentLayout();

            App.router = new App.Routers.DefaultRouter();
            App.router.navigate('');

            App.Datastore = {};
            App.Datastore.Collection = {};
            App.Datastore.Model = {};
            App.Datastore.Notifications = new App.Collections.Notifications();
        },
        setMessage: function(message, timeout) {

            timeout = timeout || 5000;

            (function(msg, t) {
                var m = $(msg).appendTo('.alerts');
                setTimeout(function() {
                    m.fadeOut(function() {
                        m.remove();
                    });
                }, t);
            })(message, timeout);

            return this;
        },
        setStandardErrorMessage: function(message) {

            message = '<div class="alert-error">' + message + '</div>';

            return App.setMessage(message);
        },
        clearMessage: function() {
            $('.alerts').empty();
            return this;
        },
        start: function() {
            App.init();
            App.Instances.WebsocketManager = new App.Utilities.WebsocketManager();

            Backbone.history.start({pushState: true, root: App.root});

            $(document).on('click', 'a[href]:not([data-bypass])', function(evt) {
                var href = {
                    prop: $(this).prop('href'),
                    attr: $(this).attr('href')
                };

                var root = location.protocol + '//' + location.host + App.root;

                if (href.prop.slice(0, root.length) === root) {
                    evt.preventDefault();
                    Backbone.history.navigate(href.attr, true);
                }
            });
        },
        // Properties
        Collections: {},
        Instances: {},
        Layouts: {},
        Mixins: {},
        Models:  {},
        Routers: {},
        Utilities: {
            Vdjpipe: {},
        },
        Views: {
            Generic: {},
            HandlebarsHelpers: {},
            Helpers: {},
        },
        Websockets: {},
    };

    //module.exports = App;
    return _.extend(
        App,
        {},
        Backbone.Events
    );
});
