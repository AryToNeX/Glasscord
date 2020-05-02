/*
   Copyright 2020 AryToNeX

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
'use strict';

const asar = require('asar');
const glob = require('glob');
const dest = 'glasscord.asar';
const src = '.';
const filenames = ['package.json', 'LICENSE', ...glob.sync('src/**'), 'node_modules', ...glob.sync('node_modules/glasstron/**')];

asar.createPackageFromFiles(src, dest, filenames).then(() => console.log('done')).catch(e => console.log("Something went wrong: " + e));
