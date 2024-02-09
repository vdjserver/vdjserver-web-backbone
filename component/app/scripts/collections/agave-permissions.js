
'use strict';

//
// agave-permissions.js
// Backbone collection for permissions
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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

import { Agave } from 'Scripts/backbone/backbone-agave';
import Permission from 'Scripts/models/agave-permission';

export default Agave.Collection.extend({
    initialize: function(models, parameters) {

        Agave.Collection.prototype.initialize.apply(this, [models, parameters]);

        if (parameters && parameters.uuid) {
            this.uuid = parameters.uuid;
        }
    },
    comparator: 'username',
    model: Permission,
    url: function() {
        return '/meta/v2/data/' + this.uuid + '/pems';
    },
    parse: function(response) {

        var pems = [];

        if (response.result) {
            for (var i = 0; i < response.result.length; i++) {

                var userPems = {
                    username: response.result[i].username,
                    permission: response.result[i].permission,
                    uuid: this.uuid
                };

                pems.push(userPems);
            }
        }

        return pems;
    },
    getUserCount: function() {
        if (this.length === 1) {
            return 1;
        }
        else {
            return this.length - 1;
        }
    },
});
