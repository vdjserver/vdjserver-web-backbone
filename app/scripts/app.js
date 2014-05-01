define(['handlebars', 'backbone', 'layoutmanager'], function(Handlebars) {

    'use strict';

    var App = {
        root: '/',
        init: function() {
            var JST = window.JST = window.JST || {};

            // Configure LayoutManager with Backbone Boilerplate defaults.
            Backbone.Layout.configure({
                // Allow LayoutManager to augment Backbone.View.prototype.
                manage: true,

                prefix: 'templates/',

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

            var watchToken = function() {
                var warn;
                var error;

                var saveMutex = false;

                clearTimeout(warn);
                clearTimeout(error);

                var token = App.Agave.token();

                var refreshInterval = token.expiresIn() - 1000;

                console.log("refresh interval is: " + refreshInterval);

                if (token.isActive()) {

                    // Necessary for browser refresh...
                    window.localStorage.setItem('Agave.Token', JSON.stringify(token.toJSON()));

                    console.log("token is: " + JSON.stringify(token));

                    warn = setTimeout(function() {
                        console.log("timeout running");

                        /*
                            If the expiration time is below a certain
                            threshold, then we should try to refresh.


                            This function fires on pageload as well, so this
                            condition will stop it from refreshing too early
                            with a new token.
                        */
                        if (token.expiresIn() - 1000 < 1500) {

                            if (saveMutex === false) {

                                saveMutex = true;

                                console.log("pre token update!");

                                token.save()
                                    .done(function() {
                                        // it was renewed, rewatch token
                                        console.log("token renewed. token is: " + JSON.stringify(token));
                                        window.localStorage.setItem('Agave.Token', JSON.stringify(token.toJSON()));
                                        App.Agave.token(token);
                                        watchToken();
                                    })
                                    .fail(function() {
                                        console.log("tokenSave fail");
                                        App.Agave.destroyToken();
                                        window.localStorage.removeItem('Agave.Token');
                                        App.router.navigate('', {'trigger':true});
                                    });
                            }
                        }

                    }, Math.max(0, (token.expiresIn() - 1000 * 1000)));

                    error = setTimeout(function() {
                        alert('Your Session has expired.  You have been logged out.');
                        App.Agave.destroyToken();
                        window.localStorage.removeItem('Agave.Token');
                        App.router.navigate('', {'trigger':true});
                    }, Math.max(0, (token.expiresIn() * 1000)));
                }
            };
            App.listenTo(App.Agave, 'Agave:tokenChanged', watchToken, this);
            App.listenTo(App.Agave, 'Agave:tokenDestroy', watchToken, this);
            watchToken();


            // initialize router, views, data and layouts
            /*
            App.Layouts.header = new App.Views.AppViews.HeaderLayout({
                el: '#header',
                views: {
                    '': [
                        new App.Views.AppViews.Nav({model: App.Agave.token()})
                    ]
                }
            });
            */

            App.Layouts.main = new App.Views.AppViews.MainLayout({
                el: '#main'
            });

            _.each(App.Layouts, function(layout) {
                layout.render();
            });

            App.router = new App.Routers.DefaultRouter();
            App.router.navigate('');

            App.Datastore = {};
            App.Datastore.Model = {};
            App.Datastore.Collection = {};
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
            Backbone.history.start({pushState: true, root: App.root});
            $(document).on('click', 'a[href]:not([data-bypass])', function(evt) {
                var href = { prop: $(this).prop('href'), attr: $(this).attr('href') };
                var root = location.protocol + '//' + location.host + App.root;
                if (href.prop.slice(0, root.length) === root) {
                    evt.preventDefault();
                    Backbone.history.navigate(href.attr, true);
                }
            });
        },
        Layouts:     {},
        Views:       {
            HandlebarsHelpers: {}
        },
        Models:      {},
        Collections: {},
        Routers:     {}
    };
    return _.extend(App, {
        isLoggedIn: function() {
            return this.Agave.token().isActive();
        }
    }, Backbone.Events);
});
