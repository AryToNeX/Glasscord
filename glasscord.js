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

const electron = require('electron');
const path = require('path');

if(process.platform == 'win32'){
	try{
		var ewc = require('./ewc.asar');
	} catch (e) {
		electron.dialog.showMessageBoxSync({
			type: 'error',
			title: 'Glasscord',
			message: 'The ewc.asar file is either missing, corrupt or not placed in the correct folder!',
			buttons: ['Alexa, play Despacito']
		});
		process.exit(1);
	}
}
/**
 * Debounce function
 * Might come in handy, given all those bouncy events!
 */
function debounce(func, wait, immediate){
	var timeout;
	return function() {
		var context = this, args = arguments;
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
		if (callNow) func.apply(context, args);
	};
}

/*
 * The BrowserWindow override class
 * This is the core of Glasscord.
 */
class BrowserWindow extends electron.BrowserWindow {
	
	/**
	 * Glasscord hook main constructor
	 * This sets up most of the things
	 * Notice, however, that a lot of code is split into methods.
	 */
	constructor(originalOptions) {
		if (!originalOptions || !originalOptions.webPreferences || !originalOptions.title)
			return super(originalOptions);

		if(process.platform != 'win32')
			originalOptions.transparent = true;

		let bgColor;
		if(originalOptions.backgroundColor)
			bgColor = originalOptions.backgroundColor.replace('#','');
		else
			bgColor = 'FFFFFFFF'; // Assume Electron's default color, which is white

		let tintRaw;
		if(bgColor.length == 6)
			tintRaw = BrowserWindow._glasscord_RGBHexStringToARGBColorArray(bgColor);
		else
			tintRaw = BrowserWindow._glasscord_ARGBHexStringToColorArray(bgColor);

		super(originalOptions);
		// Now we can use 'this', so we'll set object properties from now on
		this._glasscord_exposeToDevTools();
		
		this._glasscord_enabled = false;
		
		this._glasscord_tint_stock_opaque = BrowserWindow._glasscord_ARGBcolorArrayToHexString(BrowserWindow._glasscord_opacify(tintRaw, 255));

		// we should preserve transparency if it's there; otherwise we can just make the color fully transparent
		this._glasscord_tint_stock_transparent = BrowserWindow._glasscord_ARGBcolorArrayToHexString(
			tintRaw[0] == 255 ? BrowserWindow._glasscord_opacify(tintRaw, 0) : tintRaw
		);

		this._glasscord_tint = this._glasscord_tint_stock_transparent;
		
		if(process.platform == 'win32'){
			// Windows-only properties
			this._glasscord_win32_type = 'acrylic'; // acrylic, blurbehind, transparent
			this._glasscord_win32_performance_mode = true;
		}
		
		if(process.platform == 'linux'){
			// Linux-only properties
			this._glasscord_linux_blur = true; // true, false
		}
		
		if(process.platform == 'darwin'){
			// Mac-only properites
			this._glasscord_macos_vibrancy = null; // Vibrancy
		}
		
		this.invokedOptions = originalOptions;
		
		// Let's register our event listeners now.
		this._glasscord_eventListener();
	}

	/**
	 * We have to hook into setBackgroundColor so we can provide transparency
	 *   when Glasscord is enabled. This method does the job.
	 */
	setBackgroundColor(backgroundColor){
		this._glasscord_log('Initial background color: ' + backgroundColor, 'log');
		// strip the hash char
		backgroundColor = backgroundColor.replace('#','');
		let wasRgb = false;
		// check if the color is RGB; if it is, use the special function
		if(backgroundColor.length == 6){
			backgroundColor = BrowserWindow._glasscord_RGBHexStringToARGBColorArray(backgroundColor);
			wasRgb = true;
		}else
			backgroundColor = BrowserWindow._glasscord_ARGBHexStringToColorArray(backgroundColor);
		
		// For some reason, on Linux, if your tint is fully opaque and you come
		// from a fully transparent one, a black opaque tint is applied in every
		// case. A workaround is applying the same color with opacity 99% before
		// cranking this one up to 100%.
		if(process.platform == 'linux'){
			if(backgroundColor[0] == 255){
				let fixupBgColor = Array.from(backgroundColor);
				fixupBgColor[0] = 254;
				super.setBackgroundColor(BrowserWindow._glasscord_ARGBcolorArrayToHexString(fixupBgColor));
			}
		}
		
		if(this._glasscord_enabled){
			if(wasRgb){
				// we will proceed to append stuff now
				let currentTint = BrowserWindow._glasscord_ARGBHexStringToColorArray(this._glasscord_tint);
				backgroundColor[0] = currentTint[0];
			}
		}
		
		backgroundColor = BrowserWindow._glasscord_ARGBcolorArrayToHexString(backgroundColor, false);
		// append the hash char again
		backgroundColor = '#' + backgroundColor;
		this._glasscord_log('Final background color: ' + backgroundColor, 'log');
		super.setBackgroundColor(backgroundColor);
		
		// It seems that Electron is retarded also on macOS. Since it won't update the background
		// unless someone causes the window to refresh, let's refresh it with a lame trick
		if(process.platform == 'darwin'){
			let bounds = this.getBounds();
			bounds.width += 1;
			this.setBounds(bounds);
			bounds.width -= 1;
			this.setBounds(bounds);
		}
	}

	/**
	 * We have to hook into show and showInactive to blur the background if it's needed.
	 */
	show(){
		super.show();
		this._glasscord_showHook();
	}

	showInactive(){
		super.showInactive();
		this._glasscord_showHook();
	}
	
	/**
	 * This method enables Glasscord.
	 * It then calls the update method to apply transparency and blurriness
	 */
	glasscord_enable(){
		this._glasscord_log("Enabled!", 'log');
		
		this._glasscord_enabled = true;
		
		this.glasscord_update();
	}
	
	/**
	 * This method updates Glasscord's perks according to the current properties
	 */
	glasscord_update(){
		if(!this._glasscord_enabled) return;
		this._glasscord_log("Updated!", 'log');
		
		if(process.platform == 'win32'){
			this.setBackgroundColor('#00000000');
			this._glasscord_win32();
			return;
		}
		
		if(process.platform == 'darwin')
			this.setVibrancy(this._glasscord_macos_vibrancy);
		
		if(process.platform == 'linux')
			this._glasscord_linux_requestBlur(this._glasscord_linux_blur);
		
		this.setBackgroundColor(this._glasscord_tint);
	}
	
	/**
	 * This method disables Glasscord and reverts blurriness and transparency
	 */
	glasscord_disable(){
		this._glasscord_log("Disabled!", 'log');
		this._glasscord_enabled = false;
		
		if(process.platform == 'win32'){
			ewc.disable(this, parseInt(this._glasscord_tint_stock.replace('#', ''), 16));
		}
		
		if(process.platform == 'darwin')
			this.setVibrancy(null);
		
		if(process.platform == 'linux')
			this._glasscord_linux_requestBlur(false);
		
		this.setBackgroundColor(this._glasscord_tint_stock_opaque);
	}
	
	// Methods for private use -- don't call them from outside, please
	
	/**
	 * Useful method to dump what Glasscord is storing.
	 */
	_glasscord_dumpvars(){
		let dumpMessage = "Properties: " + JSON.stringify(
			{
				enabled: this._glasscord_enabled,
				tint_stock_opaque: this._glasscord_tint_stock_opaque,
				tint_stock_transparent: this._glasscord_tint_stock_transparent,
				tint: this._glasscord_tint,
				win32_type: this._glasscord_win32_type || null,
				win32_performance_mode: this._glasscord_win32_performance_mode || null,
				linux_blur: this._glasscord_linux_blur || null,
				macos_vibrancy: this._glasscord_macos_vibrancy || null
			}
		);
		this._glasscord_log(dumpMessage, 'log');
	}
	
	/**
	 * Glasscord's show hook method
	 * It will just call the variable update routine, ideally to get variables from the CSS theme.
	 * So it is async.
	 */
	_glasscord_showHook(){
		this._glasscord_variableUpdate();
		this._glasscord_watchdog();
	}
	
	/**
	 * This is Glasscord's event listener. Every fired event gets listened here.
	 */
	_glasscord_eventListener(){
		// Expose event listeners for controller plugins
		electron.ipcMain.on('glasscord_on', () => { this.glasscord_enable(); });
		electron.ipcMain.on('glasscord_off', () => { this.glasscord_disable(); });
		electron.ipcMain.on('glasscord_refresh_view', () => {this.glasscord_update(); });
		electron.ipcMain.on('glasscord_refresh_variables', () => {this._glasscord_variableUpdate(); });
		// Everything else can be controlled via CSS styling
		
		// Work around an Electron(?) bug that only happens on Linux/Mac
		this.webContents.on('devtools-closed', () => {
			this.setBackgroundColor("#01000000");
			this.glasscord_update();
		});
		
		// Windows' performance mode toggle
		if(process.platform == 'win32'){
			const lessCostlyBlurWin = debounce(() => {ewc.setBlurBehind(this, 0x01000000)}, 50, true);
			const moreCostlyBlurWin = debounce(() => {this._glasscord_win32()}, 50);
			this.on('move', () => {
				if(this._glasscord_win32_type == 'acrylic' && this._glasscord_win32_performance_mode){
					lessCostlyBlurWin();
					moreCostlyBlurWin();
				}
			});
			this.on('resize', () => {
				if(this._glasscord_win32_type == 'acrylic' && this._glasscord_win32_performance_mode){
					lessCostlyBlurWin();
					moreCostlyBlurWin();
				}
			});
		}
	}
	
	/**
	 * Method to spawn a watchdog in the Discord window
	 * This way we can watch for style changes and update Glasscord accordingly
	 */
	_glasscord_watchdog(){
		this.webContents.executeJavaScript(`(function(){
			const options = {attributes: true, attributeOldValue: true, childList: true, subtree: true};
			const targetNode = document.head;
			const callback = function(mutationsList, observer){
				let shouldUpdateGlasscord = false;
				for(let mutation of mutationsList){
					if(mutation.addedNodes.length != 0){ // some nodes were added!
						for(let addedNode of mutation.addedNodes){
							if(addedNode.nodeName.toLowerCase() == 'style'){
								shouldUpdateGlasscord = true;
								break;
							}
						}
					}
					
					if(shouldUpdateGlasscord) break; // don't spend other time iterating
				
					if(mutation.removedNodes.length != 0){ // some nodes were removed!
						for(let removedNode of mutation.removedNodes){
							if(removedNode.nodeName.toLowerCase() == 'style'){
								shouldUpdateGlasscord = true;
								break;
							}
						}
					}
					
					if(shouldUpdateGlasscord) break; // don't spend other time iterating
				
					if(mutation.target.nodeName.toLowerCase() == 'style' &&
						mutation.attributeName == 'innerText' &&
						mutation.oldValue != mutation.target.innerText
					) shouldUpdateGlasscord = true;
				}
			
				if(shouldUpdateGlasscord){
					window.require('electron').ipcRenderer.send('glasscord_refresh_variables');
				}
			}
			
			const observer = new MutationObserver(callback);
			observer.observe(targetNode, options);
		}())`);
	}
	
	/**
	 * This is the method that gets called whenever a variable update is requested.
	 * It is DARN IMPORTANT to keep ALL the variables up to date!
	 * This function is a void that runs async code, so keep that in mind!
	 * Also, keep in mind it calls enable() or disable() at its end!
	 */
	_glasscord_variableUpdate(){
		let promises = [];
		
		promises.push(this._glasscord_getCssProp('--glasscord-tint').then(tint => {
			if(tint != null){
				this._glasscord_CssColorToARGB(tint).then(argb => {
					this._glasscord_tint = BrowserWindow._glasscord_ARGBcolorArrayToHexString(argb, true);
				});
				return;
			}
			this._glasscord_tint = this._glasscord_tint_stock_transparent;
		}));
		
		if(process.platform == 'win32'){
			promises.push(this._glasscord_getCssProp('--glasscord-win-blur').then(blurType => {
				if(blurType != null){
					this._glasscord_win32_type = blurType;
					return;
				}
				this._glasscord_win32_type = 'acrylic';
			}));
		
			promises.push(this._glasscord_getCssProp('--glasscord-win-performance-mode').then(mode => {
				if(mode){
					switch(mode){
						case "true":
						default:
							this._glasscord_win32_performance_mode = true;
							break;
						case "false":
							this._glasscord_win32_performance_mode = false;
							break; 
						}
					return;
				}
				this._glasscord_win32_performance_mode = true;
			}));
		}
		
		if(process.platform == 'darwin'){
			promises.push(this._glasscord_getCssProp('--glasscord-macos-vibrancy').then(vibrancy => {
				if(vibrancy != null){
					if(vibrancy == "none") this._glasscord_macos_vibrancy = null;
					else this._glasscord_macos_vibrancy = vibrancy;
					return;
				}
				this._glasscord_macos_vibrancy = null;
			}));
		}
		
		if(process.platform == 'linux'){
			promises.push(this._glasscord_getCssProp('--glasscord-linux-blur').then(mode => {
				if(mode){
					switch(mode){
						case "true":
						default:
							this._glasscord_linux_blur = true;
							break;
						case "false":
							this._glasscord_linux_blur = false;
							break; 
					}
					return;
				}
				this._glasscord_linux_blur = true;
			}));
		}
		
		Promise.all(promises).then(res => {
			// this one will get checked last for __tactical advantage__
			this._glasscord_getCssProp('--glasscord-enable').then(
				mode => {
					if(mode != null){
						switch(mode){
						case "true":
						default:
							this.glasscord_enable();
							break;
						case "false":
							this.glasscord_disable();
							break; 
						}
						return;
					}
					// DEBUG: if Mode is undefined, enable it
					//this.glasscord_enable();
				}
			);
		});
	}
	
	/**
	 * This method handles blur and transparency on Windows.
	 * There's nothing special about it, really.
	 */
	_glasscord_win32(){
		let win32_tint = parseInt(this._glasscord_tint.replace('#',''), 16);
		switch(this._glasscord_win32_type){
			case 'acrylic':
				if(win32_tint >>> 24 == 0)
					win32_tint |= 0x01000000; // FUCK WINDOWS.
				ewc.setAcrylic(this, win32_tint);
				break;
			case 'blurbehind':
				ewc.setBlurBehind(this, win32_tint);
				break;
			case 'transparent':
				ewc.setTransparentGradient(this, win32_tint);
				break;
		}
	}
	
	_glasscord_linux_requestBlur(mode){
		if(mode && process.env.XDG_SESSION_TYPE != 'x11'){
			electron.dialog.showMessageBoxSync({
				type: 'warning',
				title: 'Glasscord',
				message: 'You are not on an X11 session, therefore Glasscord can\'t request the frosted glass effect!',
				buttons: ['Alexa, play Despacito']
			});
			return;
		}
		
		if(process.env.XDG_SESSION_TYPE == 'x11'){
			let execFile = require('child_process').execFile;
			let xprop;
			execFile('which', ['xprop'], (error,stdout,stderr) => {
				if(error){
					electron.dialog.showMessageBoxSync({
					type: 'error',
					title: 'Glasscord',
					message: 'Your system is missing the xprop tool. Please install it to be able to request the frosted glass effect!',
					buttons: ['Ahoy!']
					});
					return;
				}
				xprop = stdout.trim();
				
				const shCommand = `${xprop} -id $(xprop -root -notype | awk '$1=="_NET_SUPPORTING_WM_CHECK:"\{print $5\}') -notype -f _NET_WM_NAME 8t | grep "_NET_WM_NAME = " | cut --delimiter=' ' --fields=3 | cut --delimiter='"' --fields=2`;
				execFile('sh', ['-c',shCommand], (error,stdout,stderr) => {
					if(error) return;
					switch(stdout.trim()){
						case 'KWin':
							this._glasscord_linux_kwin_requestBlur(mode);
							break;
						default:
							if(mode)
								this._glasscord_log("You are not running a supported window manager. Blur won't be available via Glasscord.", 'log');
							break;
					}
				});
			});
		}
	}
	
	/**
	 * This method handles blurring on KWin
	 * Sorry, Wayland users (for now) :C
	 */
	_glasscord_linux_kwin_requestBlur(mode){
		if(process.env.XDG_SESSION_TYPE != 'x11') return;
		
		const xid = this.getNativeWindowHandle().readUInt32LE().toString(16);
		const remove = 'xprop -f _KDE_NET_WM_BLUR_BEHIND_REGION 32c -remove _KDE_NET_WM_BLUR_BEHIND_REGION -id 0x' + xid;
		const request = 'xprop -f _KDE_NET_WM_BLUR_BEHIND_REGION 32c -set _KDE_NET_WM_BLUR_BEHIND_REGION 0 -id 0x' + xid;
		
		let sys = require('sys')
		let exec = require('child_process').exec;
		exec(mode ? request : remove);
	}
	
	/**
	 * Handy method to expose this object to the window.
	 * It is basically a shorthand for require('electron').remote. yadda yadda
	 */
	_glasscord_exposeToDevTools(){
		this.webContents.executeJavaScript("window.glasscord = window.require('electron').remote.getCurrentWindow();");
	}
	
	/**
	 * Another handy method to log directly to DevTools
	 */
	_glasscord_log(message, level){
		this.webContents.executeJavaScript("console." + level + "('%c[Glasscord] %c" + message + "', 'color:#ff00ff;font-weight:bold', 'color:initial;font-weight:normal;');");
	}
	
	/**
	 * General method to get CSS properties from themes.
	 * Hacky but it does the job.
	 */
	_glasscord_getCssProp(propName){
		return this.webContents.executeJavaScript(`(function(){
			let flag = getComputedStyle(document.documentElement).getPropertyValue('${propName}');
			if(flag)
				return flag.trim().replace('"','');
		}())`).then(res => {
			if(res) return res;
			return null;
		});
	}
	
	/**
	 * CSS color parsing method
	 * taken straight from StackOverflow
	 * modified a bit tho
	 */
	_glasscord_CssColorToRGBA(col){
		return this.webContents.executeJavaScript(`(function(){
		let col = \`${col}\`;
		let canvas = document.createElement('canvas');
		canvas.width = canvas.height = 1;
		let ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, 1, 1);
		// In order to detect invalid values,
		// we can't rely on col being in the same format as what fillStyle is computed as,
		// but we can ask it to implicitly compute a normalized value twice and compare.
		ctx.fillStyle = '#000';
		ctx.fillStyle = col;
		let computed = ctx.fillStyle;
		ctx.fillStyle = '#fff';
		ctx.fillStyle = col;
		if (computed !== ctx.fillStyle) return; // invalid color
		ctx.fillRect(0, 0, 1, 1);
		return [ ... ctx.getImageData(0, 0, 1, 1).data ];
		}())`);
	}
	
	/**
	 * Shorthand to get an ARGB color from a CSS value
	 */
	_glasscord_CssColorToARGB(col){
		return this._glasscord_CssColorToRGBA(col).then(res => {
			res.unshift(res.pop());
			return res;
		});
	}
	
	/**
	 * Simple color array to hex string converter
	 */
	static _glasscord_ARGBcolorArrayToHexString(col, prependHash = true){
		return (prependHash ? '#' : '') + ((
			(col[0] << 24 >>> 0) |
			(col[1] << 16 >>> 0) |
			(col[2] << 8 >>> 0) |
			(col[3] >>> 0)
		) >>> 0).toString(16).padStart(8, '0');
	}
	
	static _glasscord_ARGBHexStringToColorArray(col){
		let colRaw = parseInt(col.replace('#',''), 16);
		return [
			(colRaw & 0xff000000) >>> 24,
			(colRaw & 0x00ff0000) >>> 16,
			(colRaw & 0x0000ff00) >>> 8,
			(colRaw & 0x000000ff)
		];
	}
	
	static _glasscord_RGBHexStringToARGBColorArray(col){
		let colRaw = parseInt(col.replace('#',''), 16);
		return [
			255,
			(colRaw & 0xff0000) >>> 16,
			(colRaw & 0x00ff00) >>> 8,
			(colRaw & 0x0000ff)
		];
	}
	
	static _glasscord_opacify(col, opacity){
		let newCol = Array.from(col);
		newCol[0] = opacity;
		return newCol;
	}

}

// from EnhancedDiscord -- thanks folks!
const electron_path = require.resolve('electron');
Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones
if (electron.deprecate && electron.deprecate.promisify) {
	const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
	electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check
}
const newElectron = Object.assign({}, electron, {BrowserWindow});
delete require.cache[electron_path].exports;
require.cache[electron_path].exports = newElectron;
