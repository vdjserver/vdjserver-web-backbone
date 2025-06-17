//
// check-setup.js
// various test setup checks
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: Oct 25, 2023
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

import config from '../test-config';
import { Selector } from 'testcafe';

const { Login } = require('./pages');
const login = new Login();

var tapisV2 = require('vdj-tapis-js/tapis');
var tapisV3 = require('vdj-tapis-js/tapisV3');
var tapisIO = null;
if (config.tapis_version == 2) tapisIO = tapisV2;
if (config.tapis_version == 3) tapisIO = tapisV3;

fixture('Check Setup')
    .page(config.url);

test('Verify first user account', async t => {
    console.log('Using Tapis version ', config.tapis_version);
    
    // check login
    await login.login(t, config.username, config.password);
    await t.expect(Selector('#loginSuccessful').innerText).contains('Welcome to your "My Projects"', {timeout:config.timeout});
    
    var token = await login.getTokenFromLocalStorage();
    await t.expect(token).ok('Logged in with no token?');

    // check logout
    await login.logout(t);
    token = await login.getTokenFromLocalStorage();
    await t.expect(token).notOk('Token still in local storage after logout?');
});

/*test('Verify second user account', async t => {
    // check login
    // TODO: what to check to verify that login worked?
    await t
        .typeText('#username', config.username2)
        .typeText('#password', config.password2)
        .click('#home-login');

    // check logout

    // check getting token
    var token = await tapisV2.getToken({username: config.username2, password: config.password2});
    console.log(token);

});*/

