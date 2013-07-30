define(['handlebars', 'backbone', 'layoutmanager'], function(Handlebars) {
    App = {
        root: '/',
        init: function() {
            var JST = window.JST = window.JST || {};
            // Configure LayoutManager with Backbone Boilerplate defaults.
            Backbone.Layout.configure({
                // Allow LayoutManager to augment Backbone.View.prototype.
                manage: true,

                prefix: 'templates/',

                fetch: function(path) {
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
                render: function(tmpl, context) {
                    return tmpl(context);
                }
            });

            // setup agave
            App.Agave = new Backbone.Agave({token: JSON.parse(window.localStorage.getItem('Agave.Token'))});
            var watchToken = function() {
                clearTimeout(this.warn);
                clearTimeout(this.error);
                var token = App.Agave.token(), logoutWarningDialog;
                if (token.isValid()) {

                    window.localStorage.setItem('Agave.Token', JSON.stringify(token.toJSON()));
                    this.warn = setTimeout(function() {
                        console.log("this.warn is running");
                        logoutWarningDialog = new App.Views.Util.ModalView({
                            model: new App.Models.MessageModel({header:'Your login session is about to expire!'})
                        }),
                        renewView = new App.Views.AgaveAuth.RenewTokenForm({
                            model: App.Agave.token()
                        });
                        renewView.cleanup = function() {
                            logoutWarningDialog.close();
                            if (token.expiresIn() > 300000) {

                                console.log("weird token if statement");
                                // it was renewed, rewatch token
                                watchToken();
                            }
                        };
                        logoutWarningDialog.setView('.child-view', renewView);
                        logoutWarningDialog.$el.on('hidden', function() {
                            logoutWarningDialog.remove();
                            logoutWarningDialog = null;
                        });
                        console.log("about to render logoutWarning");
                        logoutWarningDialog.render();
                        console.log("finished rendering logoutWarning");
                    }, Math.max(0, token.expiresIn() - 300000));
                    this.error = setTimeout(function() {
                            console.log("token.expiresIn is: " + token.expiresIn());
                            console.log("token expires math function is: " + Math.max(0, token.expiresIn()));
                        if (logoutWarningDialog) {
                            console.log("logoutWarning close");
                            logoutWarningDialog.close();
                        }
                        alert('Your Session has expired.  You have been logged out.');
                        App.Agave.destroyToken();
                        window.localStorage.removeItem('Agave.Token');
                        App.router.navigate('', {'trigger':true});
                    }, Math.max(0, token.expiresIn()));
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
                        new App.Views.AppViews.Nav(),
                        new App.Views.AppViews.Header({model: App.Agave.token()})
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
        },
        start: function() {
            App.init();
            // Backbone.history.start();
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
            return this.Agave.token().isValid();
        }
    }, Backbone.Events);
});
