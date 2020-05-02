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
const fs = require("fs");
const path = require("path");
const Utils = require("./utils.js");
const pak = require("../package.json");

// Zack's doing
function isEmpty(obj) {
  if (obj == null || obj == undefined || obj == "") return true;
  if (typeof(obj) !== "object") return false;
  if (Array.isArray(obj)) return obj.length == 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

module.exports = class Main{
	constructor(){
		// Let's register our event listeners now.
		this._eventListener();
		
		// Let's read our modules now
		this._loadModules();
		
		// This is a Singleton
		Main.prototype._instance = this;
	}
	
	static getInstance(){
		if(typeof Main.prototype._instance === "undefined")
			new Main();
		return Main.prototype._instance;
	}
	
	getModule(name){
		return this.modules[name] || undefined;
	}
	
	// Methods for private use -- don't call them from outside, please
	
	/**
	 * This is the event listener. Every fired event gets listened here.
	 */
	_eventListener(){
		// Expose event listeners for controller plugins
		electron.ipcMain.on("glasscord_refresh", (e) => {
			const win = electron.BrowserWindow.fromWebContents(e.sender);
			if(typeof win === "undefined" || win === null) return;
			this.constructor._log(win.webContents, "IPC requested update");
			this._updateVariables(win);
		});
		// Everything else can be controlled via CSS styling
	}
	
	_loadModules(){
		this.modules = {};
		let dirFiles = fs.readdirSync(path.join(__dirname, "modules"));
		for(let file of dirFiles){
			if(file.endsWith(".js")){
				let module = require(path.join(__dirname, "modules", file));
				if(!isEmpty(module)){
					if(module.platformExclude.includes(process.platform)) continue;
					if(!isEmpty(module.platform) && !module.platform.includes(process.platform)) continue;
					if(module.appExclude.includes(electron.app.name)) continue;
					if(!isEmpty(module.app) && !module.app.includes(electron.app.name)) continue;
					
					if(!isEmpty(module.defaultConfig))
						Utils.initializeModuleConfig(module.prototype.constructor.name, module.defaultConfig, module.isCore);
					else
						Utils.initializeModuleConfig(module.prototype.constructor.name, null, module.isCore);
					
					if(!module.isCore && !Utils.isModuleEnabled(module.prototype.constructor.name)) continue;
					this.modules[module.prototype.constructor.name] = new module();
				}
			}
		}
		Utils.saveConfig();
	}
	
	/**
	 * This is the method that gets called whenever a variable update is requested.
	 * It is DARN IMPORTANT to keep ALL the variables up to date!
	 * This function is a void that runs async code, so keep that in mind!
	 */
	_updateVariables(win){
		let promises = [];
		
		for(let moduleName in this.modules){
			if(this.modules[moduleName].cssProps && this.modules[moduleName].cssProps.length != 0){
				for(let prop of this.modules[moduleName].cssProps){
					promises.push(this.constructor._getCssProp(win.webContents, prop).then(value => this.modules[moduleName].update(win, prop, value)));
				}
			}
		}
		
		Promise.all(promises).then(res => {
			this.constructor._log(win.webContents, "Updated!", 'log');
		});
	}
	
	_emitWindowInit(win){
		for(let moduleName in this.modules){
			this.modules[moduleName].windowInit(win);
		}
	}
	
	/**
	 * Another handy method to log directly to DevTools
	 */
	static _log(webContents, message, level = "log"){
		return this._executeInRenderer(webContents,
			// RENDERER CODE BEGIN
			function(message, level){
				console[level](...message);
			}
			// RENDERER CODE END
		, this._formatLogMessage(message), level);
	}
	
	static _logGlobal(message, level = "log"){
		console[level](...this._formatLogMessage(message, "cli"));
		for(let webContents of electron.webContents.getAllWebContents())
			this._log(webContents, message, level);
		return true;
	}
	
	static _formatLogMessage(message, type = "devtools"){
		const ansi_escape_code = "\x1b";
		if(type === "cli") return [ansi_escape_code + "[95m[Glasscord]" + ansi_escape_code + "[0m " + message];
		return ["%c[Glasscord] %c" + message, "color:#ff00ff;font-weight:bold", "color:inherit;font-weight:normal;"];
	}
	
	/**
	 * General method to get CSS properties from themes.
	 * Hacky but it does the job.
	 */
	static _getCssProp(webContents, propName){
		return this._executeInRenderer(webContents,
			// RENDERER CODE BEGIN
			function(propName){
				let flag = getComputedStyle(document.documentElement).getPropertyValue(propName);
				if(flag) return flag.trim().replace('"','');
			}
			// RENDERER CODE END
		, propName).then(res => {
			if(res) return res;
			return null;
		});
	}
	
	// stolen from zack senpai
	static _executeInRenderer(webContents, method, ...params) {
		if(method.name.length !== 0)
			method = method.toString().replace(method.name, "function").replace("function function", "function");
		else method = method.toString();
		return webContents.executeJavaScript(`(${method})(...${JSON.stringify(params)});`);
	}
	
}
