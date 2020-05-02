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

const glasstron = require("../glasstron_wrapper.js");
const Module = require("../module.js");

module.exports = class Linux extends Module{
	static isCore = true;
	static platform = ["linux"];
	cssProps = ["--glasscord-linux-blur"];
	
	update(win, cssProp, value){
		value = (typeof value === "string" && value.toLowerCase() === "true");
		glasstron.update(win, {linux: {requestBlur: value}});
	}
	
	_getXWindowManager(){
		return glasstron.getPlatform()._getXWindowManager();
	}
}
