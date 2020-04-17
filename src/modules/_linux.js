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

const Module = require('../module.js');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

module.exports = class Linux extends Module{
	static isCore = true;
	static platform = ['linux'];
	cssProps = ["--glasscord-linux-blur"];
	
	update(cssProp, value){
		if(value){
			this._getXWindowManager().then(res => {
				switch(res){
					case 'KWin':
						this._kwin_requestBlur(value);
						break;
					default:
						if(value)
							this.log("You are not running a supported window manager. Blur won't be available via Glasscord.");
						break;
				}
			});
		}
	}
	
	/**
	 * This method returns us the current X window manager used
	 */
	_getXWindowManager(){
		if(process.env.XDG_SESSION_TYPE == 'x11'){
			let xprop;
			return execFile('which', ['xprop']).then(res => {
				if(res.error){
					this.log("Your system is missing the xprop tool (perhaps we're in a Snap/Flatpak container?). Please make it available to Discord!");
					return null;
				}
				xprop = res.stdout.trim();
				
				const shCommand = `${xprop} -id $(xprop -root -notype | awk '$1=="_NET_SUPPORTING_WM_CHECK:"\{print $5\}') -notype -f _NET_WM_NAME 8t | grep "_NET_WM_NAME = " | cut --delimiter=' ' --fields=3 | cut --delimiter='"' --fields=2`;
				return execFile('sh', ['-c',shCommand]).then(res => {
					if(res.error) return null;
					return res.stdout.trim();
				});
			});
		}
		this.log("It seems you're not in an X.Org session!");
		return Promise(null);
	}
	
	/**
	 * This method handles blurring on KWin
	 * Sorry, Wayland users (for now) :C
	 */
	_kwin_requestBlur(mode){
		if(process.env.XDG_SESSION_TYPE != 'x11') return;
		
		const xid = this.main.win.getNativeWindowHandle().readUInt32LE().toString(16);
		const remove = 'xprop -f _KDE_NET_WM_BLUR_BEHIND_REGION 32c -remove _KDE_NET_WM_BLUR_BEHIND_REGION -id 0x' + xid;
		const request = 'xprop -f _KDE_NET_WM_BLUR_BEHIND_REGION 32c -set _KDE_NET_WM_BLUR_BEHIND_REGION 0 -id 0x' + xid;
		
		let sys = require('sys')
		let exec = require('child_process').exec;
		exec(mode ? request : remove);
	}
}
