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

const path = require('path');
const fs = require('fs');

const configpath = path.join(__dirname, "..", "..", "glasscord_config.json");
const defaultConfig = {
	windowProps: {
		frame: (process.platform == "linux" ? true : false),
	},
	modules: {}
};

class Utils{

	static loadConfig(){
		if(!this.config){
			try{
				this.config = require(configpath);
			}catch(e){
				Utils.saveConfig();
			}
		}
	}

	static saveConfig(){
		if(!this.config){
			this.config = {};
			Object.assign(this.config, defaultConfig);
		}
		fs.writeFileSync(configpath, JSON.stringify(this.config, undefined, 2));
	}

	static getConfigForModule(name){
		try{
			if (this.config.modules[name] && !this.config.modules[name].config) return this.config.modules[name].config = {};
			return this.config.modules[name].config;
		}catch(e){
			return {};
		}
	}
	
	static setConfigForModule(name, config){
		if(config && Object.keys(config).length !== 0){
			if(!this.config) Utils.loadConfig();
			if(!this.config.modules) this.config.modules = {};
			if(!this.config.modules[name]) this.config.modules[name] = {};
			this.config.modules[name].config = config;
		}else{
			try{
				delete this.config.modules[name].config;
			}catch(e){}
		}
	}
	
	static initializeModuleConfig(name, defaultConfig, isCore){
		if(!this.config.modules[name]){
			if(!isCore){
				this.config.modules[name] = {};
				this.config.modules[name].enabled = true;
			}
			Utils.setConfigForModule(name, defaultConfig);
		}
	}
	
	static isModuleEnabled(name){
		try{
			if(this.config.modules[name].enabled) return true;
		}catch(e){}
		return false;
	}
	
	static getWindowProperties(){
		try{
			return this.config.windowProps;
		}catch(e){
			return {};
		}
	}
	
	static setWindowProperties(windowProps){
		this.config.windowProps = windowProps;
	}

}

module.exports = Utils;

Utils.loadConfig();
