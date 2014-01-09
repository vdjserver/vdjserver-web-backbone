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

                clearTimeout(warn);
                clearTimeout(error);

                var token = App.Agave.token();

                if (token.isActive()) {

                    window.localStorage.setItem('Agave.Token', JSON.stringify(token.toJSON()));

                    warn = setTimeout(function() {

                        // TODO: RENEW TOKEN HERE BY SAVING MODEL

                        console.log("token.expires is: " + token.get('expires'));
                        //console.log("date now madness is: " + Date.now() / 1000);

                        if (token.expiresIn() > 300) {
                            console.log("token expire renew");

                            // it was renewed, rewatch token
                            watchToken();
                        }

                    }, Math.max(0, token.get('expires') - 300));
                    error = setTimeout(function() {
                        alert('Your Session has expired.  You have been logged out.');
                        App.Agave.destroyToken();
                        window.localStorage.removeItem('Agave.Token');
                        App.router.navigate('', {'trigger':true});
                    }, Math.max(0, token.get('expires')));
                }
            };
            App.listenTo(App.Agave, 'Agave:tokenChanged', watchToken, this);
            App.listenTo(App.Agave, 'Agave:tokenDestroy', watchToken, this);
            watchToken();


            // initialize router, views, data and layouts
            App.Layouts.header = new App.Views.AppViews.HeaderLayout({
                el: '#header',
                views: {
                    '': [
                        new App.Views.AppViews.Nav({model: App.Agave.token()})
                    ]
                }
            });

            App.Layouts.main = new App.Views.AppViews.MainLayout({
                el: '#main'
            });

            App.Layouts.footer = new App.Views.AppViews.FooterLayout({
                el: '#footer',
                views: {
                    '': new App.Views.AppViews.Footer()
                }
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

            var timeout = timeout || 5000;

            (function(msg, t) {
                var m = $(msg).appendTo('.alerts');
                setTimeout(function() {
                    m.fadeOut(function() {
                        m.remove();
                    });
                }, t);
            })(message, timeout);


            console.log("message set");
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
        Views:       {},
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
