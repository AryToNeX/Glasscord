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
const pak = require("../package.json");

const _GlasscordApi = {
	require: module.require,
	version: pak.version
};

process.once("loaded", () => {
	global.GlasscordApi = Object.assign({}, _GlasscordApi);
});

const _preload = electron.ipcRenderer.sendSync("_preload");
if(typeof _preload == "string") // it exists!
	_GlasscordApi.require(_preload);
