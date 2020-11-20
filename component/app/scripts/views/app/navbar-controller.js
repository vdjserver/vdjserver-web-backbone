//
// navbar-controller.js
// Manages the navigation bar for public/private
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

// We use a single navigation bar template that is customized by handlebars
// 1. public page, not logged in
// 2. public page, logged in
// 3. private page, logged in
import navbar_template from 'Templates/app/navigation-bar.html';

// This is the navigation bar
var NavigationBarView = Marionette.View.extend({
    template: Handlebars.compile(navbar_template),

    initialize: function(parameters) {
        this.public_bar = true;
        this.active_token = App.Agave.token().isActive();

        if (parameters) {
            if (parameters.public_bar != undefined)
                this.public_bar = parameters.public_bar;
        }
    },

    templateContext() {
        return {
            public_bar: this.public_bar,
            active_token: this.active_token,
            admin_account: App.Agave.token().isAdmin()
        };
    },
});

// Navigation bar controller
//
// This manages the navigation bar with public options
// and after the user logs in
import navregion_template from 'Templates/app/navigation-region.html';
export default Marionette.View.extend({
    template: Handlebars.compile(navregion_template),

    // one region for the navigation bar
    // one region for the announcement/message bar
    // one region for the first tool bar
    // one region for the second tool bar
    regions: {
        navigationRegion: '#navbar-region',
        messageRegion: '#navmessage-region',
        toolbar1Region: '#toolbar1-region',
        toolbar2Region: '#toolbar2-region'
    },

    events: {
        'click #logout': 'logout',
        'click .open-filter': 'emptyToolbarBar',
        'click .closed-filter': 'showToolbarBar',
    },

    initialize(options) {
        console.log('Initialize');
    },

    showPublicNavigation() {
        this.showChildView('navigationRegion', new NavigationBarView({public_bar: true}));
    },

    showPrivateNavigation() {
        this.showChildView('navigationRegion', new NavigationBarView({public_bar: false}));
    },

    showMessageBar(view) {
        this.showChildView('messageRegion', view);
    },

    emptyMessageBar() {
        this.getRegion('messageRegion').empty();
    },

    showToolbar1Bar(view) {
        this.showChildView('toolbar1Region', view);
    },

    emptyToolbar1Bar() {
        this.getRegion('toolbar1Region').empty();
    },

    showToolbar2Bar(view) {
        this.showChildView('toolbar2Region', view);
    },

    emptyToolbar2Bar() {
        this.getRegion('toolbar2Region').empty();
    },

    emptyToolbarBar() {
        this.getRegion('toolbar1Region').empty();
        this.getRegion('toolbar2Region').empty();

        $(".open-filter").toggleClass("open-filter closed-filter");
        $("#close-filter-icon").toggleClass("fa-chevron-down fa-chevron-up");
    },

    showToolbarBar(view) {
        this.showChildView('toolbar1Region', view);
        this.showChildView('toolbar2Region', view);
    },

    logout(e) {
        e.preventDefault();

        // route to home page
        App.router.navigate('auth/logout', {trigger: true});
    }
});
