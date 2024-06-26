//
// test-config.js
// test configuration settings
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

export default {
    'timeout': parseInt(process.env.TEST_TIMEOUT),
    'tapis_version': process.env.TAPIS_VERSION,
    'url': process.env.TEST_URL,
    'username': process.env.TEST_USERNAME,
    'password': process.env.TEST_PASSWORD,
    'username2': process.env.TEST_USERNAME2,
    'password2': process.env.TEST_PASSWORD2,
    'api': process.env.TEST_API
};
