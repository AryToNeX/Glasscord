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

const Utils = require("./utils.js");
const Main = require("./main.js");

module.exports = class Module{
	static isCore = false;
	static platform = [];
	static platformExclude = [];
	
	static app = [];
	static appExclude = [];
	
	static defaultConfig = {};
	
	cssProps = [];
	
	constructor(){
		this.config = Utils.getConfigForModule(this.constructor.name, this.constructor.defaultConfig);
		this.logGlobal("Module loaded!");
	}
	
	windowInit(win){}
	
	update(win, cssProp, value){}
	
	saveConfig(){
		Utils.setConfigForModule(this.constructor.name, this.config);
		Utils.saveConfig();
	}

	log(webContents, message, level = "log"){
		message = `[${this.constructor.name}] ${message}`;
		return Main._log(webContents, message, level);
	}

	logGlobal(message, level = "log") {
		message = `[${this.constructor.name}] ${message}`;
		return Main._logGlobal(message, level);
	}

	static isApplicable(){
		if(
			this.platformExclude.includes(process.platform) ||
			(!Utils.isEmpty(this.platform) && !this.platform.includes(process.platform)) ||
			this.appExclude.includes(Utils.getRootAppName()) ||
			(!Utils.isEmpty(this.app) && !this.app.includes(Utils.getRootAppName()))
		) return false;
		return true;
	}


}
