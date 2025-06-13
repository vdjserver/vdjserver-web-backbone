//
// login.js
// Login Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
//
// Author: Ryan C. Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: November 2023 - November 2024
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
import { ClientFunction } from 'testcafe';

const { Login } = require('./pages');
const login = new Login();

fixture('Login Page Test Cases')
    .page(config.url);

test('Check Login with JWT (login expected)', async t => {
    await login.login(t,config.username,config.password);
    await t.expect(login.loginSuccessfulSelect.withExactText(login.loginSuccessfulString).exists).ok();
});

test('Check blank username (no login expected)', async t => {
    await login.login(t,'',config.password);
    await t.expect(login.loginSuccessfulSelect.exists).notOk();
});

test('Check blank JWT (no login expected)', async t => {
    await login.login(t,config.username,'');
    await t.expect(login.loginSuccessfulSelect.withExactText(login.loginString).exists).notOk();
});

test('Check valid username but invalid JWT  (no login expected)', async t => {
    await login.login(t,config.username,config.password+Math.floor(Math.random()*100000));
    await t.expect(login.loginSelect.withExactText(login.loginString).exists).ok();
    await t.expect(login.loginSuccessfulSelect.withExactText(login.loginString).exists).notOk();
});

//  test('Check invalid username', async t => {
//   await login.login(t,config.username+Math.floor(Math.random()*100000),config.password,'CLICK',login.loginButtonId);
//   await t.expect(login.loginFailedSelect.withExactText(login.loginFailedString).exists).ok();
//  });

//  test('Check username with only spaces', async t => {
//   await login.login(t,'        ',config.password,'CLICK',login.loginButtonId);
//   await t.expect(login.loginFailedSelect.withExactText(login.loginFailedString).exists).ok();
//  });

//  test('Check password with only spaces', async t => {
//   await login.login(t,config.username,'        ','CLICK',login.loginButtonId);
//   await t.expect(login.loginFailedSelect.withExactText(login.loginFailedString).exists).ok();
//  });

//  test('Check valid username and password with ENTER key to submit', async t => {
//   await login.login(t,config.username,config.password,'ENTERKEY');
//   await t.expect(login.loginSuccessfulSelect.withExactText(login.loginSuccessfulString).exists).ok();
//  });

//  /*test('Click "Forgot password?"', async t => {
//   await login.login(t,'','','CLICK','#forgotPassword-link');
//   await t.expect(Selector('#forgotPassword').innerText).contains('Forgot your password?');
//  });*/

//  /*test('Click "Verify account?"', async t => {
//   await login.login(t,'','','CLICK','#verifyAccount-link');
//   await t.expect(Selector('#verifyAccount').innerText).contains('Verify your new VDJServer account');
//  });*/

test('Click "Community Data Portal"', async t => {
    await t.click(login.communityDataPortalLinkId);
    const getPageUrl = ClientFunction(() => window.location.href);
    const url = await getPageUrl();
    const subUrl = url.split("/");
    await t.expect(subUrl.slice(-1)[0]).eql('community');
});

test('Click "AIRR Data Commons"', async t => {
    await t.expect(Selector(login.airrDataCommonsLinkId).getAttribute('href')).eql(login.adcUrl);
    await t.click(login.airrDataCommonsLinkId);
    /*const getPageUrl = ClientFunction(() => window.location.href);
    const url = await getPageUrl();
    await t.expect(url).eql(login.adcUrl);*/
});

test('Click "Send Feedback"', async t => {
    await t.click(login.sendFeedbackLinkId);
    const getPageUrl = ClientFunction(() => window.location.href);
    const url = await getPageUrl();
    const subUrl = url.split("/");
    await t.expect(subUrl.slice(-1)[0]).eql('feedback');
});

//  /*test('Click "https://www.ireceptor-plus.com/"', async t => {
//   //await login.login(t,'','','CLICK','#iReceptorPlus-link');
//   await t.click('#iReceptorPlus-link');
//   const getPageUrl = ClientFunction(() => window.location.href);
//   const url = await getPageUrl();
//   await t.expect(url).eql('https://www.ireceptor-plus.com/');
//  });*/

//  test('Click "TACC"', async t => {
//   //await t.expect(click(taccLinkId)).ok();
//   await t.expect(Selector(login.taccLinkId).getAttribute('href')).eql(login.taccUrl);
//   await t.click(login.taccLinkId);
//   /*const getPageUrl = ClientFunction(() => window.location.href);
//   const url = await getPageUrl();
//   await t.expect(url).eql(login.taccUrl);*/
//  });

test('Click "Email"', async t => {
    await t.expect(Selector(login.emailSelector).exists).ok();
    await t.expect(Selector(login.emailSelector).withExactText(login.emailString).exists).ok();
});

//  /*test('Click "Create Account"', async t => {
//   await login.login(t,'','','CLICK','#create-account');
//   await t.expect(Selector('#createAccount').innerText).contains('Create a new VDJServer account.');
//  });*/
