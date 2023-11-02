//
// login.js
// login page test cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
//
// Author: Ryan Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: Nov 1, 2023
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

var tapisV2 = require('vdj-tapis-js/tapis');
var tapisV3 = require('vdj-tapis-js/tapisV3');
var tapisIO = null;
if (config.tapis_version == 2) tapisIO = tapisV2;
if (config.tapis_version == 3) tapisIO = tapisV3;

fixture('Login Page Test Cases')
    .page('http://localhost:9001/project');

 test('Check valid username and password', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');
  await t.expect(Selector('#loginSuccessful').innerText).contains('Welcome to your "My Projects"', {timeout:14000});
 });

 test('Check blank username', async t => {
  await login(t,'',config.password,'CLICK','#home-login');
  await t.expect(Selector('#login').innerText).contains('Welcome!', {timeout:14000});
 });

 test('Check blank password', async t => {
  await login(t,config.username,'','CLICK','#home-login');
  await t.expect(Selector('#login').innerText).contains('Welcome!', {timeout:14000});
 });

 test('Check valid username but invalid password', async t => {
  await login(t,config.username,config.password+Math.floor(Math.random()*100000),'CLICK','#home-login');
  await t.expect(Selector('#loginFailed').innerText).contains('Login failed', {timeout:14000});
 });

 test('Check invalid username', async t => {
  await login(t,config.username+Math.floor(Math.random()*100000),config.password,'CLICK','#home-login');
  await t.expect(Selector('#loginFailed').innerText).contains('Login failed', {timeout:14000});
 });

 test('Check username with only spaces', async t => {
  await login(t,'        ',config.password,'CLICK','#home-login');
  await t.expect(Selector('#loginFailed').innerText).contains('Login failed', {timeout:14000});
 });

 test('Check password with only spaces', async t => {
  await login(t,config.username,'        ','CLICK','#home-login');
  await t.expect(Selector('#loginFailed').innerText).contains('Login failed', {timeout:14000});
 });

 test('Check valid username and password with ENTER key to submit', async t => {
  await login(t,config.username,config.password,'ENTERKEY');
  await t.expect(Selector('#loginSuccessful').innerText).contains('Welcome to your "My Projects"', {timeout:14000});
 });

 test('Click "Forgot password?"', async t => {
  await login(t,'','','CLICK','#forgotPassword-link');
  await t.expect(Selector('#forgotPassword').innerText).contains('Forgot your password?', {timeout:14000});
 });

 test('Click "Verify account?"', async t => {
  await login(t,'','','CLICK','#verifyAccount-link');
  await t.expect(Selector('#verifyAccount').innerText).contains('Verify your new VDJServer account', {timeout:14000});
 });

 test('Click "Community Data Portal"', async t => {
  await login(t,'','','CLICK','#community-link');
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  const subUrl = url.split("/");
  await t.expect(subUrl.slice(-1)[0]).eql('community', {timeout:14000});
 });

 test('Click "AIRR Data Commons"', async t => {
  await login(t,'','','CLICK','#AIRRDC-link');
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  await t.expect(url).eql('https://docs.airr-community.org/en/stable/api/adc.html', {timeout:14000});
 });

 test('Click "Send Feedback"', async t => {
  await login(t,'','','CLICK','#sendFeedback-link');
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  const subUrl = url.split("/");
  await t.expect(subUrl.slice(-1)[0]).eql('feedback', {timeout:14000});
 });

 test('Click "https://www.ireceptor-plus.com/"', async t => {
  await login(t,'','','CLICK','#iReceptorPlus-link');
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  await t.expect(url).eql('https://www.ireceptor-plus.com/', {timeout:14000});
 });

 test('Click "TACC"', async t => {
  await login(t,'','','CLICK','#TACC-link');
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  await t.expect(url).eql('https://tacc.utexas.edu/', {timeout:14000});
 });

 test('Click "Email"', async t => {
  await t.expect(Selector('a[href="mailto:vdjserver@utsouthwestern.edu?subject=Share my data in VDJServer"]').getAttribute('href')).eql('mailto:vdjserver@utsouthwestern.edu?subject=Share my data in VDJServer', {timeout:14000});
 });

 test('Click "Create Account"', async t => {
  await login(t,'','','CLICK','#create-account');
  await t.expect(Selector('#createAccount').innerText).contains('Create a new VDJServer account.', {timeout:14000});
 });

//method is either ENTERKEY or CLICK
//clickItem is the id of the item (optional)
async function login(t,username,password,method,clickItem) {
  if(username!='') await t.typeText('#username', username);
  if(password!='') await t.typeText('#password', password);
    if(method == "ENTERKEY") {
      await t.pressKey('enter');
    } else if(method == 'CLICK') {
      await t.click(Selector(clickItem, {timeout: 14000}));
    }
}
