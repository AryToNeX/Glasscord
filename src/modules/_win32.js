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

module.exports = class Win32 extends Module{
	static isCore = true;
	static platform = ["win32"];
	cssProps = ["--glasscord-win-blur", "--glasscord-win-performance-mode"];
	
	update(win, cssProp, value){
		switch(cssProp){
			case "--glasscord-win-blur":
				if(typeof value === "undefined" || value === null)
					value = "none";
				glasstron.update(win, {windows: {blurType: value}});
				break;
			case "--glasscord-win-performance-mode":
				value = (typeof value === "string" && value.toLowerCase() === "true");
				glasstron.update(win, {windows: {performanceMode: value}});
				break;
		}
	}
}
