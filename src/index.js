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

const Main = require('./main.js');
const Utils = require('./utils.js');
const electron = require('electron');
const path = require('path');

// Require our version checker
require('./version_check.js')();

/*
 * The BrowserWindow override class
 */
class BrowserWindow extends electron.BrowserWindow {
	constructor(options) {
		if(process.platform != 'win32') options.transparent = true;
		options.backgroundColor = '#00000000';
		options.webPreferences.nodeIntegration = true;
		Object.assign(options, Utils.getWindowProperties());
		super(options);
		new Main(this);
	}

	/**
	 * Let's stub setBackgroundColor because it's way too buggy. Use the CSS 'body' selector instead.
	 */
	setBackgroundColor(backgroundColor){
		return;
	}
}

// from Zack
const originalEmit = electron.app.emit;
electron.app.emit = function(event, ...args) {
	if (event !== "ready") return Reflect.apply(originalEmit, this, arguments);
	setTimeout(() => {
		electron.app.emit = originalEmit;
		electron.app.emit("ready", ...args);
	}, 500);
};

// from Zack's BBD
Object.assign(BrowserWindow, electron.BrowserWindow); // Retains the original functions

if (electron.deprecate && electron.deprecate.promisify) {
    const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
    electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check
}

const onReady = () => {
	if(!electron.app.commandLine.hasSwitch('enable-transparent-visuals'))
		electron.app.commandLine.appendSwitch('enable-transparent-visuals'); // ALWAYS enable transparent visuals

	Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific functions
	const electronPath = require.resolve("electron");
	const newElectron = Object.assign({}, electron, {BrowserWindow}); // Create new electron object

	do{
		try{
			require.cache[electronPath].exports = newElectron; // Try to assign the exports as the new electron
			if (require.cache[electronPath].exports === newElectron) break; // If it worked, break the loop
			else throw 'Zack is not cool';
		}catch(e){
			delete require.cache[electronPath].exports; // If it didn't work, try to delete existing
		}
	}while(true);
};

// Do the electron assignment
if (process.platform == "win32" || process.platform == "darwin") electron.app.once("ready", onReady);
else onReady();

// Use the app's original info to run it
let basePath = path.join(__dirname, "..", "..", "app.original"); // assume we moved the app path
if(!require('fs').existsSync(basePath)) // if that path doesn't exist
	basePath = path.join(__dirname, "..", "..", "app.asar"); // move our target to app.asar
const pkg = require(path.join(basePath, "package.json"));
electron.app.setAppPath(basePath);
electron.app.setName(pkg.name);
require('module')._load(path.join(basePath, pkg.main), null, true);
