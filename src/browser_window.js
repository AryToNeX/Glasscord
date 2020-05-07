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
const Main = require("./main.js");
const Utils = require("./utils.js");

/*
 * The BrowserWindow override class
 */
class BrowserWindow extends electron.BrowserWindow {
	constructor(options) {
		if(process.platform != "win32") options.transparent = true;
		options.backgroundColor = "#00000000";
		options.webPreferences.contextIsolation = false; // enforce it
		let _preload = null;
		if(typeof options.webPreferences.preload !== "undefined")
			_preload = options.webPreferences.preload;
		options.webPreferences.preload = path.join(__dirname, "preload.js");
		Object.assign(options, Utils.getWindowProperties());
		// We do not call super to get an actual BrowserWindow from electron and not mess with native casts (broke GTK modals)
		const window = new electron.BrowserWindow(options);
		window.webContents._preload = _preload;
		Main.getInstance()._emitWindowInit(window);
		return window;
	}
}

/*
 * Preload querying is handled by this piece of code
 */
electron.ipcMain.on("_preload", function waitForPreload(e){
	if(typeof e.sender._preload !== "undefined")
		e.returnValue = e.sender._preload;
	else
		setTimeout(waitForPreload, 50);
});

Object.assign(BrowserWindow, electron.BrowserWindow); // Retains the original functions
module.exports = BrowserWindow;
