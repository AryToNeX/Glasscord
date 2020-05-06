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
"use strict";

const electron = require("electron");
const path = require("path");
const fs = require("fs");
const Module = require("module");
const BrowserWindow = require("./browser_window.js");

// Require our version checker
require("./version_check.js")();

overrideEmit();
onReady();
module.exports = {isGlasscord: true};
if(require.main.exports.isGlasscord) // we can assume we're injecting
	injectFromResources();
module.exports = {};

// ------------------------------------------------------------- FUNCTIONS

function onReady(){
	// Switches and configs that can be toggled on directly
	if(!electron.app.commandLine.hasSwitch("enable-transparent-visuals"))
		electron.app.commandLine.appendSwitch("enable-transparent-visuals"); // ALWAYS enable transparent visuals

	// Replacing of BrowserWindow with ours
	Object.assign(BrowserWindow, electron.BrowserWindow); // Assign the new chrome-specific functions
	const electronPath = require.resolve("electron");
	const newElectron = Object.assign({}, electron, {BrowserWindow}); // Create new electron object

	delete require.cache[electronPath].exports; // Delete exports
	require.cache[electronPath].exports = newElectron; // Assign the exports as the new electron

	if(require.cache[electronPath].exports !== newElectron)
		console.log("Something's wrong! Glasscord can't be injected properly!");
}

function overrideEmit(){ // from Zack, blame Electron
	const originalEmit = electron.app.emit;
	electron.app.emit = function(event, ...args) {
		if (event !== "ready") return Reflect.apply(originalEmit, this, arguments);
		setTimeout(() => {
			electron.app.emit = originalEmit;
			electron.app.emit("ready", ...args);
		}, 1000);
	};
}

function injectFromResources(){
	// Use the app's original info to run it
	const probablePkgs = [
		path.join(electron.app.getAppPath(), "package.original.json"),
		path.join(electron.app.getAppPath(), "..", "app.original", "package.json"),
		path.join(electron.app.getAppPath(), "..", "app.asar", "package.json")
	];
	let pkgDir;
	let basePath;
	for(let _pkgDir of probablePkgs){
		if(!fs.existsSync(_pkgDir)) continue;
		pkgDir = _pkgDir;
		basePath = path.dirname(_pkgDir);
		break;
	}
	if(!pkgDir) throw "There's no package.json to load!";
	const pkg = require(pkgDir);
	//electron.app.setPath('userData', path.join(electron.app.getPath('appData'), pkg.name));
	electron.app.setAppPath(basePath);
	electron.app.name = pkg.name;
	Module._load(path.join(basePath, pkg.main), null, true);
}
