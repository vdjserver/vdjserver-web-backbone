import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

import { EnvironmentConfig } from './environment-config.js';
import Backbone from 'backbone';
import { Agave,Auth } from './backbone-agave.js';

fixture('Getting Started')
    .page('http://localhost:9001/project');

test('Create a Project and Check Backend Values', async t => {
  var studyId = "Test Study ID TC1";
  var studyTitle = "Test Study Title TC1";
  var studyDesc = "Test Study Description";
  var incExcCriteria = "Criteria";
  var grants = "1234";
  //keywords
  const studyTypeSelect = Selector('#dropdownOntology');
  const studyTypeOption = studyTypeSelect.find('option');
  var pubs = "1;2;3;4";
  
  var labName = "UTSW";
  var labAddr = "11 S. Main St";

  var cName = "Joe";
  var cEmail = "joe@email.com";
  var cAddr = "12 N. Main St";
  
  var sName = "Jim";
  var sEmail = "jim@email.com";
  var sAddr = "13 W. Main St";

  await t
    .typeText('#username', 'rck')
    .typeText('#password', process.env.selenium)
    .click('#home-login');

  await t.click(Selector('#create-project', {timeout: 14000}));

  await t
    .typeText('#NCBI', studyId)
    .typeText('#study_title', studyTitle)
    .typeText('#description', studyDesc)
    .typeText('#criteria', incExcCriteria)
    .typeText('#grants', grants)
    //.click('#contains_single_cell') //Keywords
    .click(studyTypeSelect) //Study Type
    .click('a[name="NCIT:C16084"]')
    .typeText('#publications', pubs)
    .typeText('#lab_name', labName)
    .typeText('#lab_address', labAddr)
    .typeText('#collectedby_name', cName)
    .typeText('#collectedby_email', cEmail)
    .typeText('#collectedby_address', cAddr)
    .typeText('#submittedby_name', sName)
    .typeText('#submittedby_email', sEmail)
    .typeText('#submittedby_address', sAddr)
    .click('#create-new-project');

  await t.expect(Selector('.modal-body > p:nth-child(1)').innerText).contains('successfully', 'Project successfully created', {timeout:14000});

  await t.click(Selector('#cancel-message-button', {timeout: 14000}));

  await t
    .scrollIntoView(Selector('.fa-user-alt'))
    .click('.fa-user-alt');

const getPageUrl = ClientFunction(() => window.location.href);
const url = await getPageUrl();

const uuid = url.split("/")[4];
console.log("uuid: " + uuid);

//var agave = new Agave({token: null});
var agave = new Agave({token: {}});
var token = new Agave.Auth.Token({ username: "rck", password: ""});
await token.save();
console.log(token);

  await t
    .click('#project-subjects-add')
    .click('#project-subjects-new-subject')
    .typeText('input[name="subject_id"]', '1234')
    .click('#project-subjects-save-changes');

await new Promise(r => setTimeout(r, 5000));

  await t
    .click(Selector('#project-subjects-details-summary', {timeout:10000}))
    .expect(Selector('input[name="subject_id"]').value).contains('124', {timeout:14000});
});

