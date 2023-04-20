//
// navbar-controller.js
// Manages the navigation bar
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
import navbar_template from 'Templates/app/navigation-bar.html';

// This is the navigation bar
var NavigationBarView = Marionette.View.extend({
    template: Handlebars.compile(navbar_template),

    initialize: function(parameters) {
        this.active_token = App.Agave.token().isActive();

        //if (parameters) {
        //}
    },

    templateContext() {
        let display_name = App.Agave.token().get('username');
        //Display priority: first and last; first only; last only; username only
        if (App.AppController.userProfile) { //make sure the profile is not null
            let value = App.AppController.userProfile.get('value');
            if (value['firstName'] && value['firstName'].length != 0) {
                display_name = value['firstName'];
                if (value['lastName'] && value['lastName'].length != 0) {
                    display_name = display_name + ' ' + value['lastName'];
                }
            } else if (value['lastName'] && value['lastName'].length != 0) {
                    display_name = value['lastName'];
            }
        }

        return {
            active_token: this.active_token,
            admin_account: App.Agave.token().isAdmin(App.AppController.userProfile),
            display_name: display_name,
            location: window.location
        };
    },
});

// This is the toolbar footer
import navbar_footer from 'Templates/app/navigation-footer.html';
var NavigationFooterView = Marionette.View.extend({
    template: Handlebars.compile(navbar_footer),
    initialize(options) {
    }

});

// Navigation bar controller
//
// This manages the navigation bar
// and after the user logs in
import navregion_template from 'Templates/app/navigation-region.html';
export default Marionette.View.extend({
    template: Handlebars.compile(navregion_template),

    // one region for the navigation bar
    // one region for the announcement/message bar
    // one region for the filter bar
    // one region for the tool bar
    regions: {
        navigationRegion: '#navbar-region',
        messageRegion: '#navbar-message-region',
        filterRegion: '#navbar-filter-region',
        toolRegion: '#navbar-tool-region',
        footerRegion: '#navbar-footer-region'
    },

    events: {
        'click #logout': 'logout',
        'click #navbar-filter-icon': 'toggleFilterBar',
    },

    initialize(options) {
        console.log('Initialize');
        this.navbar_filter = true; //navbar filter is open by default
    },

    showNavigation() {
        this.emptyFilterBar();
        this.emptyToolBar();
        this.showChildView('navigationRegion', new NavigationBarView());
        this.showFooter();
    },

    showMessageBar(view) {
        this.showChildView('messageRegion', view);
        this.showFooter();
    },

    emptyMessageBar() {
        this.getRegion('messageRegion').empty();
        this.showFooter();
    },

    showFilterBar(view) {
        // console.log(view);
        this.showChildView('filterRegion', view);
        $("#navbar-filter-icon").removeClass("nav-button-inactive");
        $("#navbar-filter-icon").addClass("nav-button-active");
        this.showFooter();
    },

    emptyFilterBar() {
        this.getRegion('filterRegion').empty();
        this.showFooter();
    },

    showToolBar(view) {
        this.showChildView('toolRegion', view);
        this.showFooter();
    },

    emptyToolBar() {
        this.getRegion('toolRegion').empty();
        this.showFooter();
    },

    showFooter() {
        // If any toolbar being shown, show footer
        if (this.getChildView('messageRegion')) {
            this.showChildView('footerRegion', new NavigationFooterView());
            return;
        }
        if (this.getChildView('filterRegion')) {
            this.showChildView('footerRegion', new NavigationFooterView());
            return;
        }
        if (this.getChildView('toolRegion')) {
            this.showChildView('footerRegion', new NavigationFooterView());
            return;
        }
        // otherwise empty
        this.emptyFooter();
    },

    emptyFooter() {
        this.getRegion('footerRegion').empty();
    },

    toggleFilterBar(e) {
        console.log(this.navbar_filter);
        e.preventDefault();  //don't do default browser action of following link
        if (!this.navbar_filter) {
            this.getRegion('filterRegion').$el.show();
            this.getRegion('toolRegion').$el.show();
            this.showFooter();

            $("#navbar-filter-icon").removeClass("nav-button-inactive");
            $("#navbar-filter-icon").addClass("nav-button-active");
            this.navbar_filter = true;
        } else {
            this.getRegion('filterRegion').$el.hide();
            this.getRegion('toolRegion').$el.hide();
            this.emptyFooter();

            $("#navbar-filter-icon").removeClass("nav-button-active");
            $("#navbar-filter-icon").addClass("nav-button-inactive");
            this.navbar_filter = false;
        }
    },

    logout(e) {
        e.preventDefault();

        // route to home page
        App.router.navigate('auth/logout', {trigger: true});
    }
});
