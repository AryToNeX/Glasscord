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

const Utils = require('./utils.js');

module.exports = class Module{
	static isCore = false;
	static platform = [];
	static platformExclude = [];
	
	static app = [];
	static appExclude = [];
	
	static defaultConfig = {};
	
	cssProps = [];
	
	constructor(main){
		this.main = main;
		this.config = Utils.getConfigForModule(this.constructor.name);
		this.log("Module loaded!");
	}
	
	update(cssProp, value){}
	
	saveConfig(){
		Utils.setConfigForModule(this.constructor.name, this.config);
		Utils.saveConfig();
	}

	log(message, level = 'log') {
		this.main._log(`[${this.constructor.name}] ${message}`, level);
	}
}
