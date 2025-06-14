//
// .testcaferc.js
// TestCafe Configuration File
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Ryan C. Kennedy
// Date: November 2024
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

module.exports = {
    browsers: ["chrome"], // Browsers (Multiple can be specified, but it causes concurrency
                           // issues and is not recommended. Instead, run tests in sequence.)
    "selectorTimeout": 25000,
    "assertionTimeout": 25000,
    "pageLoadTimeout": 25000,
    "disableNativeAutomation": true
}

