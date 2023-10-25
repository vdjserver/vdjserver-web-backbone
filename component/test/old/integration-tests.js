//
// integration-tests.js
// Integration tests using mocha-loader
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


import setup from './integration/setup-tests.js';
import account from './integration/account-tests.js';
import project from './integration/project-tests.js';
import file from './integration/file-tests.js';
import metadata from './integration/metadata-tests.js';
import job from './integration/job-tests.js';

describe('VDJServer-Agave Integration Tests', function() {
  describe('Setup tests', setup.bind(this));
  describe('Account tests', account.bind(this));
  describe('Project tests', project.bind(this));
  describe('File tests', file.bind(this));
  describe('Metadata tests', metadata.bind(this));
  describe('Job tests', job.bind(this));
});
