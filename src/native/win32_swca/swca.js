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

const os = require("os");
const path = require("path");
const execFile = require("util").promisify(require("child_process").execFile);
const Utils = require("../../utils.js");

module.exports = class SWCA{

	constructor(win){
		this.hwnd = win.getNativeWindowHandle()["readInt32" + os.endianness]();
		if(!Utils.isInPath("glasscord_swca.exe"))
			Utils.copyToPath(path.join(__dirname, "swca.exe"), "glasscord_swca.exe");
		
		this.swca = Utils.getSavedPath("glasscord_swca.exe");
	}
	
	setWindowCompositionAttribute(mode, tint){
		return execFile(this.swca, [this.hwnd, mode, tint]);
	}

	disable(){
		return this.setWindowCompositionAttribute(0, 0);
	}

	setGradient(tint){
		return this.setWindowCompositionAttribute(1, tint);
	}

	setTransparentGradient(tint){
		return this.setWindowCompositionAttribute(2, tint);
	}

	setBlurBehind(tint){
		return this.setWindowCompositionAttribute(3, tint);
	}

	setAcrylic(tint){
		return this.setWindowCompositionAttribute(4, tint);
	}

};