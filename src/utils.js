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

const path = require("path");
const fs = require("fs");
const electron = require("electron");
const https = require("https");
const crypto = require("crypto");
const rootApps = require("./root_applications.json");

<<<<<<< HEAD
const savepath = path.join(electron.app.getPath('appData'), 'glasscord');
const sysconfigpath = path.join('/etc/', 'glasscord');
const globalconfigpath = path.join(savepath, 'GlobalConfiguration.json');
const globalconfigsyspath = path.join(sysconfigpath, 'GlobalConfiguration.json');
const configpath = path.join(savepath, 'config_' + electron.app.name + '.json');
const configsyspath = path.join(sysconfigpath, 'config_' + electron.app.name + '.json');
=======
const savepath = path.join(electron.app.getPath("appData"), "glasscord");
const globalconfigpath = path.join(savepath, "GlobalConfiguration.json");
const configpath = path.join(savepath, "config_" + electron.app.name + ".json");
>>>>>>> c3688cf... 0.2.0: Glasstron-centric changes; read description
const defaultGlobalConfig = {
	autoUpdate: true
};
const defaultConfig = {
	disableGlasstronApi: true,
	windowProps: {},
	modules: {}
};

class Utils{

	static loadConfig(){
		if(!this.config){
			try{
				this.config = Object.assign({}, defaultConfig, require(configpath));
			}catch(e){
				try {
					if (process.platform !== "win32") this.config = require(configsyspath);
					else throw e;
				}
				catch(e){
					Utils.saveConfig();
				}
			}
		}
	}

	static loadGlobalConfig(){
		if(!this.globalConfig){
			try{
				this.globalConfig = Object.assign({}, defaultGlobalConfig, require(globalconfigpath));
			}catch(e){
				try{
					if (process.platform !== "win32") this.globalConfig = require(globalconfigsyspath);
					else throw e;
				}
				catch(e){
					Utils.saveGlobalConfig();
				}
			}
		}
	}

	static saveConfig(){
		if(!this.config){
			this.config = {};
			Object.assign(this.config, defaultConfig);
		}
		if(!fs.existsSync(savepath)) fs.mkdirSync(savepath);
		fs.writeFileSync(configpath, JSON.stringify(this.config, undefined, 2));
	}

	static saveGlobalConfig(){
		if(!this.globalConfig){
			this.globalConfig = {};
			Object.assign(this.globalConfig, defaultGlobalConfig);
		}
		if(!fs.existsSync(savepath)) fs.mkdirSync(savepath);
		fs.writeFileSync(globalconfigpath, JSON.stringify(this.globalConfig, undefined, 2));
	}

	static getGlobalConfig(name){
		try{
			return this.globalConfig["name"];
		}catch(e){
			return null;
		}
	}

	static setGlobalConfig(name, value){
		if(!this.globalConfig) Utils.loadGlobalConfig();
		this.globalConfig[name] = value;
	}

	static getConfigForModule(name, _defaultConfig = {}){
		try{
			if(this.config.modules[name] && !this.config.modules[name].config)
				return this.config.modules[name].config = Object.assign({}, _defaultConfig);
			return Object.assign({}, _defaultConfig, this.config.modules[name].config);
		}catch(e){
			return Object.assign({}, _defaultConfig);
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

	static getSavePath(){
		return savepath;
	}

	static getSavedPath(filename){
		return path.join(savepath, filename);
	}

	static copyToPath(innerFile, outerFilename = null, flags = fs.constants.COPYFILE_EXCL){
		if(!fs.existsSync(savepath)) fs.mkdirSync(savepath);
		return fs.copyFileSync(innerFile, Utils.getSavedPath(outerFilename || path.basename(innerFile)), flags);
	}

	static removeFromPath(filename){
		return fs.unlinkSync(Utils.getSavedPath(filename));
	}

	static isInPath(filename){
		return fs.existsSync(Utils.getSavedPath(filename));
	}

	static isEmpty(obj) {
		if (obj == null || obj == undefined || obj == "") return true;
		if (typeof(obj) !== "object") return false;
		if (Array.isArray(obj)) return obj.length == 0;
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) return false;
		}
		return true;
	}

	static httpsGet(url, options, callback){
		https.get(url, options, result => {
			if(result.statusCode == 301 || result.statusCode == 302){
				get(result.headers.location, options, callback);
				return;
			}
			let data = "";
			result.on("data", chunk => data += chunk);
			result.on("end", () => {
				result.data = data;
				callback(result);
			});
		});
	}

	static hash(algo, value){
		return crypto.createHash(algo).update(value).digest('hex');
	}

	// https://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
	static versionCompare(v1, v2, options) {
		var lexicographical = options && options.lexicographical,
			zeroExtend = options && options.zeroExtend,
			v1parts = v1.split("."),
			v2parts = v2.split(".");

		function isValidPart(x) {
			return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
		}

		if(!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) return NaN;

		if(zeroExtend) {
			while (v1parts.length < v2parts.length) v1parts.push("0");
			while (v2parts.length < v1parts.length) v2parts.push("0");
		}

		if (!lexicographical) {
			v1parts = v1parts.map(Number);
			v2parts = v2parts.map(Number);
		}

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length == i) return 1;
			if (v1parts[i] == v2parts[i]) continue;
			else if (v1parts[i] > v2parts[i]) return 1;
			else return -1;
		}

		if (v1parts.length != v2parts.length) return -1;

		return 0;
	}

	static getRootAppName(){
		for(let rootAppName in rootApps)
			for(let possibleCurrentApp of rootApps[rootAppName])
				if(electron.app.name === possibleCurrentApp) return rootAppName;
		return electron.app.name;
	}

}

Utils.loadConfig();
Utils.loadGlobalConfig();

module.exports = Utils;
