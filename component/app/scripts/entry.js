//
// entry.js
// Webpack entry point for main application
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

// SASS/CSS
import '../styles/main.scss'

// Images
import logo_image from 'Images/vdjserver-logo.png';
import genomics_image from 'Images/10xgenomics-logo.png';
import ireceptor_image from 'Images/ireceptor-logo.png';

// main application
import { Agave } from 'Scripts/backbone/backbone-agave';
import Application from 'Scripts/app';

// need this here so that it extends jQuery
import bootstrap from 'bootstrap';
import bootstrap_autocomplete from 'bootstrap-autocomplete';

document.addEventListener('DOMContentLoaded', () => {
  // the global application object
  global.App = new Application();
  // start the application
  App.start();
});

// Custom jQuery
import './_custom.js';
