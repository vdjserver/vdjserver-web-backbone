import config from '../test-config';
console.log(config);
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

var tapisV2 = require('vdj-tapis-js/tapis');
var tapisV3 = require('vdj-tapis-js/tapisV3');
var tapisIO = null;
if (config.tapis_version == 2) tapisIO = tapisV2;
if (config.tapis_version == 3) tapisIO = tapisV3;

fixture('Getting Started')
    .page('http://localhost:9001/project');

 test('Create a Project and Check Backend Values', async t => {
  const studyId = "Test Study ID TC1";
  //append random number less than 1,000,000 to studyTitle
  const studyTitle = "Test Study Title TC1_" + Math.floor(Math.random()*1000000);
  const studyDesc = "Test Study Description";
  const incExcCriteria = "Criteria";
  const grants = "1234";
  //keywords need to be tested but are not working
  const studyTypeSelect = Selector('#dropdownOntology');
  const studyTypeOption = studyTypeSelect.find('option');
  const pubs = "1;2;3;4";

  const labName = "UTSW";
  const labAddr = "11 S. Main St";

  const cName = "Joe";
  const cEmail = "joe@email.com";
  const cAddr = Math.floor(Math.random()*100) + " N. Main St";
  
  const sName = "Jim";
  const sEmail = "jim@email.com";
  const sAddr = "13 W. Main St";

  await t
    .typeText('#username', process.env.vdjl)
    .typeText('#password', process.env.vdjp)
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

  await new Promise(r => setTimeout(r, 5000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout: 14000}));

  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();

  const uuid = url.split("/")[4];
  console.log("uuid: " + uuid);
  var token = await tapisV2.getToken({username: process.env.vdjl, password: process.env.vdjp});
  console.log(token);

  var m = await tapisV2.getProjectMetadata(token.access_token, uuid);
  console.log(m);
  console.log(m["value"]["study_id"]);
  console.log(m["value"]["study_title"]);

  await t
    .expect(m["value"]["study_id"]).eql(studyId)
    .expect(m["value"]["study_title"]).eql(studyTitle)
    .expect(m["value"]["study_description"]).eql(studyDesc)
    .expect(m["value"]["inclusion_exclusion_criteria"]).eql(incExcCriteria)
    .expect(m["value"]["grants"]).eql(grants)
    .expect(m["value"]["study_type"]["id"]).eql("NCIT:C16084")
    .expect(m["value"]["pub_ids"]).eql(pubs)
    .expect(m["value"]["lab_name"]).eql(labName)
    .expect(m["value"]["lab_address"]).eql(labAddr)
    .expect(m["value"]["collected_by"].split(", ")[0]).eql(cName)
    .expect(m["value"]["collected_by"].split(", ")[1]).eql(cEmail)
    .expect(m["value"]["collected_by"].split(", ")[2]).eql(cAddr)
    .expect(m["value"]["submitted_by"].split(", ")[0]).eql(sName)
    .expect(m["value"]["submitted_by"].split(", ")[1]).eql(sEmail)
    .expect(m["value"]["submitted_by"].split(", ")[2]).eql(sAddr)

  await t
    .click(Selector('#project-subjects-add', {timeout: 14000}))
    .click(Selector('#project-subjects-new-subject', {timeout: 14000}))
    .typeText('input[name="subject_id"]', '1234');
  await new Promise(r => setTimeout(r, 5000));
    await t.click(Selector('#project-subjects-save-changes', {timeout: 14000}));

  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(Selector('#project-subjects-details-summary', {timeout:10000}))
    .expect(Selector('input[name="subject_id"]').value).contains('1234', {timeout:14000});

  await new Promise(r => setTimeout(r, 5000));

 });

