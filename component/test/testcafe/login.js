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

fixture('Login Page Test Cases')
    .page(config.url);

 const loginSelect = Selector("#login");
 const loginSuccessfulSelect = Selector("#loginSuccessful");
 const loginFailedSelect = Selector("#loginFailed");
 const emailSelector = Selector('a[href="mailto:vdjserver@utsouthwestern.edu?subject=Share my data in VDJServer"]');

 const loginButtonId = "#home-login";
 const loginSuccessfulString = "Welcome to your \"My Projects\" home page. Here, you'll find a listing of all of your projects.";
 const loginFailedString = "Login failed...";
 const loginString = "Welcome!";
 const emailString = "Email";
 const communityDataPortalLinkId = "#community-link";
 const airrDataCommonsLinkId = "#AIRRDC-link";
 const sendFeedbackLinkId = "#sendFeedback-link";
 const taccLinkId = "#TACC-link";
 const adcUrl = "https://docs.airr-community.org/en/stable/api/adc.html";
 const taccUrl = "https://tacc.utexas.edu";

 test('Check valid username and password', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);
  await t.expect(loginSuccessfulSelect.withExactText(loginSuccessfulString).exists).ok();
 });

 test('Check blank username', async t => {
  await login(t,'',config.password,'CLICK',loginButtonId);
  await t.expect(loginSelect.withExactText(loginString).exists).ok();
 });

 test('Check blank password', async t => {
  await login(t,config.username,'','CLICK',loginButtonId);
  await t.expect(loginSelect.withExactText(loginString).exists).ok();
 });

 test('Check valid username but invalid password', async t => {
  await login(t,config.username,config.password+Math.floor(Math.random()*100000),'CLICK',loginButtonId);
  await t.expect(loginFailedSelect.withExactText(loginFailedString).exists).ok();
 });

 test('Check invalid username', async t => {
  await login(t,config.username+Math.floor(Math.random()*100000),config.password,'CLICK',loginButtonId);
  await t.expect(loginFailedSelect.withExactText(loginFailedString).exists).ok();
 });

 test('Check username with only spaces', async t => {
  await login(t,'        ',config.password,'CLICK',loginButtonId);
  await t.expect(loginFailedSelect.withExactText(loginFailedString).exists).ok();
 });

 test('Check password with only spaces', async t => {
  await login(t,config.username,'        ','CLICK',loginButtonId);
  await t.expect(loginFailedSelect.withExactText(loginFailedString).exists).ok();
 });

 test('Check valid username and password with ENTER key to submit', async t => {
  await login(t,config.username,config.password,'ENTERKEY');
  await t.expect(loginSuccessfulSelect.withExactText(loginSuccessfulString).exists).ok();
 });

 /*test('Click "Forgot password?"', async t => {
  await login(t,'','','CLICK','#forgotPassword-link');
  await t.expect(Selector('#forgotPassword').innerText).contains('Forgot your password?');
 });*/

 /*test('Click "Verify account?"', async t => {
  await login(t,'','','CLICK','#verifyAccount-link');
  await t.expect(Selector('#verifyAccount').innerText).contains('Verify your new VDJServer account');
 });*/

 test('Click "Community Data Portal"', async t => {
  await t.click(communityDataPortalLinkId);
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  const subUrl = url.split("/");
  await t.expect(subUrl.slice(-1)[0]).eql('community');
 });

 test('Click "AIRR Data Commons"', async t => {
  await t.expect(Selector(airrDataCommonsLinkId).getAttribute('href')).eql(adcUrl);
  await t.click(airrDataCommonsLinkId);
  /*const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  await t.expect(url).eql(adcUrl);*/
 });

 test('Click "Send Feedback"', async t => {
  await t.click(sendFeedbackLinkId);
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  const subUrl = url.split("/");
  await t.expect(subUrl.slice(-1)[0]).eql('feedback');
 });

 /*test('Click "https://www.ireceptor-plus.com/"', async t => {
  //await login(t,'','','CLICK','#iReceptorPlus-link');
  await t.click('#iReceptorPlus-link');
  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  await t.expect(url).eql('https://www.ireceptor-plus.com/');
 });*/

 test('Click "TACC"', async t => {
  await t.expect(Selector(taccLinkId).getAttribute('href')).eql(taccUrl);
  await t.click(taccLinkId);
  /*const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();
  await t.expect(url).eql(taccUrl);*/
 });

 test('Click "Email"', async t => {
  await t.expect(Selector(emailSelector).exists).ok();
  await t.expect(Selector(emailSelector).withExactText(emailString).exists).ok();
 });

 /*test('Click "Create Account"', async t => {
  await login(t,'','','CLICK','#create-account');
  await t.expect(Selector('#createAccount').innerText).contains('Create a new VDJServer account.');
 });*/

//method is either ENTERKEY or CLICK
//clickItem is the id of the item (optional)
async function login(t,username,password,method,clickItem) {
    if(username!='') await t.typeText('#username', username);
    if(password!='') await t.typeText('#password', password);
        if(method == "ENTERKEY") await t.pressKey('enter');
        else if(method == 'CLICK') await t.click(Selector(clickItem));
        await t.wait(config.login_timeout);  //Wait to complete the login process
}
