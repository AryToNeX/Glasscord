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

const __glasstron = Object.assign({}, require("glasstron"));
const glasstronPath = require.resolve("glasstron");
const utils = require("./utils.js");

class GlasstronWrapper{
	static _glasscord_disableGlasstron(){
		delete require.cache[glasstronPath].exports;
		require.cache[glasstronPath].exports = {
			init(){},
			update(values){},
			getPlatformClass(){
				return class Dummy{update(v){}}
			}
		};
	}
	
	static _glassscord_enableGlasstron(){
		delete require.cache[glasstronPath].exports;
		require.cache[glasstronPath].exports = Object.assign({}, __glasstron);
	}
	
	static init(){
		return __glasstron.init();
	}
	
	static update(win, values){
		return __glasstron.update(win, values);
	}
	
	static getPlatform(){
		return __glasstron.getPlatform();
	}
}

if(typeof utils.config.disableGlasstronApi === "undefined" || utils.config.disableGlasstronApi)
	GlasstronWrapper._glasscord_disableGlasstron();

module.exports = GlasstronWrapper;
