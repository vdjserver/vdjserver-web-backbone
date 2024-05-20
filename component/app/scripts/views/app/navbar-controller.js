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
    // one region for the stats bar
    // one region for the button bar
    regions: {
        navigationRegion: '#navbar-region',
        messageRegion: '#navbar-message-region',
        filterRegion: '#navbar-filter-region',
        statsRegion: '#navbar-stats-region',
        buttonRegion: '#navbar-button-region'
    },

    events: {
        'click #logout': 'logout',
        'click #navbar-filter-icon': 'toggleFilterBar',
        'click #navbar-stats-icon': 'toggleStatisticsBar',
        'click #navbar-charts-icon': 'toggleCharts',
    },

    initialize(options) {
        console.log('Initialize');
        this.message_controller = null;
        this.filter_controller = null;
        this.filter_show = true;
        this.stats_controler = null;
        this.stats_show = true;
        this.button_controler = null;
        this.button_show = true;
    },

    // base display with just the top nav bar
    showNavigation() {
        this.emptyFilterBar();
        this.emptyStatisticsBar();
        this.emptyButtonsBar();
        this.showChildView('navigationRegion', new NavigationBarView());
    },

    getNavigationRect() {
        let f = document.getElementById("navigation");
        return f.getBoundingClientRect();
    },

    //
    // message bar
    //

    showMessageBar(view) {
        this.showChildView('messageRegion', view);
    },

    emptyMessageBar() {
        this.getRegion('messageRegion').empty();
    },

    //
    // filter bar
    //

    setFilterBar(view, controller, status) {
        this.filter_controller = controller;
        if (view) this.showChildView('filterRegion', view);
        this.setFilterBarStatus(status);
    },

    emptyFilterBar() {
        this.getRegion('filterRegion').empty();
        this.filter_controller = null;
        this.setFilterBarStatus(false);
    },

    setFilterBarStatus(status) {
        this.filter_show = status;
        if (this.filter_show) {
            if (this.getRegion('filterRegion').hasView())
                this.getRegion('filterRegion').$el.show();

            $("#navbar-filter-icon").removeClass("nav-button-inactive");
            $("#navbar-filter-icon").addClass("nav-button-active");
        } else {
            if (this.getRegion('filterRegion').hasView())
                this.getRegion('filterRegion').$el.hide();

            $("#navbar-filter-icon").removeClass("nav-button-active");
            $("#navbar-filter-icon").addClass("nav-button-inactive");
        }
    },

    toggleFilterBar(e) {
        // toggle only if controller says yes
        e.preventDefault();
        if (this.filter_controller) {
            let status = this.filter_controller.shouldToggleFilterBar();
            if (status) {
                this.setFilterBarStatus(!this.filter_show);
                this.filter_controller.didToggleFilterBar(this.filter_show);
            }
        }
    },

    //
    // statistics bar
    //

    setStatisticsBar(view, controller, status) {
        this.stats_controller = controller;
        if (view) this.showChildView('statsRegion', view);
        this.setStatisticsBarStatus(status);
    },

    emptyStatisticsBar() {
        this.getRegion('statsRegion').empty();
        this.stats_controller = null;
        this.setStatisticsBarStatus(false);
    },

    setStatisticsBarStatus(status) {
        this.stats_show = status;
        if (this.stats_show) {
            if (this.getRegion('statsRegion').hasView())
                this.getRegion('statsRegion').$el.show();

            $("#navbar-stats-icon").removeClass("nav-button-inactive");
            $("#navbar-stats-icon").addClass("nav-button-active");
        } else {
            if (this.getRegion('statsRegion').hasView())
                this.getRegion('statsRegion').$el.hide();

            $("#navbar-stats-icon").removeClass("nav-button-active");
            $("#navbar-stats-icon").addClass("nav-button-inactive");
        }
    },

    toggleStatisticsBar(e) {
        // toggle only if controller says yes
        e.preventDefault();
        if (this.stats_controller) {
            let status = this.stats_controller.shouldToggleStatisticsBar();
            if (status) {
                this.setStatisticsBarStatus(!this.stats_show);
                this.stats_controller.didToggleStatisticsBar(this.stats_show);
            }
        }
    },

    //
    // button bar
    //

    showButtonsBar(view) {
        this.showChildView('buttonRegion', view);
    },

    emptyButtonsBar() {
        this.getRegion('buttonRegion').empty();
    },


    toggleCharts(e) {
        // toggle only if controller says yes
        e.preventDefault();
        if (this.controller) {
            let status = this.controller.shouldToggleFilterBar();
            if (status) {
                this.setFilterBarStatus(null, !this.navbar_filter);
                this.controller.didToggleFilterBar(this.navbar_filter);
            }
        }
    },

    logout(e) {
        e.preventDefault();

        // route to home page
        App.router.navigate('auth/logout', {trigger: true});
    }
});
