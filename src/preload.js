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

function _watchdog(node){
	const {ipcRenderer} = _GlasscordApi.require("electron");
	ipcRenderer.send("glasscord_refresh");
	const callback = function(mutationsList, observer){
		let shouldUpdate = false;
		for(let mutation of mutationsList){
			if(mutation.target.nodeName.toLowerCase() == "style"){ // text in style has changed!
				shouldUpdate = true;
				break;
			}

			if(mutation.addedNodes.length != 0){ // some nodes were added!
				for(let addedNode of mutation.addedNodes){
					if(addedNode.nodeName.toLowerCase() == "style"){
						shouldUpdate = true;
						break;
					}
				}
			}

			if(shouldUpdate) break; // don't spend other time iterating

			if(mutation.removedNodes.length != 0){ // some nodes were removed!
				for(let removedNode of mutation.removedNodes){
					if(removedNode.nodeName.toLowerCase() == "style"){
						shouldUpdate = true;
						break;
					}
				}
			}
		}

		if(shouldUpdate) ipcRenderer.send("glasscord_refresh");
	}
	const observer = new MutationObserver(callback);
	observer.observe(node, {childList: true, subtree: true});
}

process.once("loaded", () => {
	global.GlasscordApi = Object.assign({}, _GlasscordApi);
});

window.addEventListener('DOMContentLoaded', (event) => {
	_watchdog(document.head);
});

const _preload = electron.ipcRenderer.sendSync("_preload");
if(typeof _preload == "string") // it exists!
	_GlasscordApi.require(_preload);
