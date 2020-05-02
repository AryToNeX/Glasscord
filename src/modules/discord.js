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

const Module = require("../module.js");
const Utils = require("../utils.js");
const Main = require("../main.js");

module.exports = class Discord extends Module{
	static app = ["discord"];
	static defaultConfig = {titlebar: "native", startupToleranceMs: 5000};
	cssProps = ["--glasscord-titlebar"];
	
	currentTitlebars = {};
	deferredUpdates = {};
	timeouts = {};
	
	windowInit(win){
		// KWin is buggy, hack around it for now BEGIN
		if(process.platform == "linux"){
			if(this.config.titlebar !== "native" && this.config.titlebar !== "linux"){
				Main.getInstance().getModule("Linux")._getXWindowManager().then(XWinMgr => {
					if(!XWinMgr || XWinMgr !== "KWin") return;
					let _maximized = false;
					win.on("maximize", () => {_maximized = true;});
					win.on("unmaximize", () => {if(win.isVisible()) _maximized = false;});
					win.on("hide", () => {
						if(!_maximized) win.setSize(win.getSize()[0], --win.getSize()[1]);
					});
					win.on("show", () => {
						if(win.isMaximized()) return;
						setTimeout(() => win.setSize(win.getSize()[0], ++win.getSize()[1]), 500);
					});
				});
			}
		}
		// KWin is buggy, hack around it for now END

		win.webContents.on("dom-ready", () => {
			Main._executeInRenderer(win.webContents, this._getWebpackModules);
		});

		win.webContents.on("did-finish-load", async () => {
			if(
				!this.config.titlebar ||
				this.config.titlebar === "native" ||
				this.config.titlebar === Discord._getNativeTitlebar()
			) return this.currentTitlebars[win.id] = Discord._getNativeTitlebar();

			const success = await Main._executeInRenderer(win.webContents, this._changeTitlebar, this.config.titlebar);
			if(!success)
				return this.log(win.webContents, "Something went wrong trying to change the titlebar.", "error");

			this.currentTitlebars[win.id] = this.config.titlebar;
			this.log(win.webContents, "Titlebar successfully updated", "info");

			// Little timeout to prevent popup modals in reasonably-fast-loading CSS (will be used below)
			this.timeouts[win.id] = true;
			setTimeout(() => {delete this.timeouts[win.id];}, this.config.startupToleranceMs || 5000);

			if(typeof this.deferredUpdates[win.id] !== "undefined"){
				this._update(win, this._getLastDeferredUpdate(win));
			}

			win.blur();
			win.focus();
		});
	}

	update(win, cssProp, value){
		return this._update(win, value);
	}

	async _update(win, value){
		// Parse the OS string
		let os = typeof(value) === "string" ? value.toLowerCase() : "native";
		if(!["windows", "osx", "linux", "native"].includes(os)){
			this.log(win.webContents, `Invalid OS passed: ${os}`, "error");
			return;
		}
		os = (os === "native" ? Discord._getNativeTitlebar() : os);
		
		// Add the update to a queue for the window if it's not fully initialized
		if(typeof this.currentTitlebars[win.id] === "undefined"){
			if(typeof this.deferredUpdates[win.id] === "undefined")
				this.deferredUpdates[win.id] = [];
			this.deferredUpdates[win.id].push(os);
			return;
		}
		
		// Now that we can assume the window IS fully initialized, we can also
		// assume that one call was maybe made by the "deferred resolver".
		this.logGlobal("win id " + win.id + " with current os being " + os + " and current titlebar being " + this.currentTitlebars[win.id]);
		
		// We'll try to figure out if our final value was already set
		if(os === this.config.titlebar){
			this.logGlobal("same values?? win id " + win.id);
			return;
		}

		// We can now update the config file if it wasn't
		this.config.titlebar = os;
		const current = Utils.getWindowProperties();
		current.frame = (os === "linux" || (os === "native" && process.platform === "linux"));
		Utils.setWindowProperties(current);
		this.saveConfig();
		
		// Check if the window has just initialized
		if(this.timeouts[win.id]){
			this.logGlobal("there's still a timeout on win id " + win.id);
			return;
		}

		// If it hasn't, show the modal or pop the previous one in case CSS loading was horribly late
		if (os === this.currentTitlebars[win.id]) Main._executeInRenderer(win.webContents, this._popModal);
		else Main._executeInRenderer(win.webContents, this._showConfirmationModal, "Restart needed", "The theme you are using makes use of a custom titlebar that requires a restart to take effect. Would you like to restart now?")
	}

	_getLastDeferredUpdate(win){
		const last = this.deferredUpdates[win.id].pop(); // return the last deferred update
		delete this.deferredUpdates[win.id];
		return last;
	}

	static _getNativeTitlebar(){
		switch(process.platform){
			case "win32": return "windows";
			case "darwin": return "osx";
			case "linux": default: return "linux";
		}
	}


	// Renderer Methods
	_getWebpackModules(){
		if (!window.GlasscordApi) return; // In case something went wrong.
		window.GlasscordApi.findModule = (() => {
			const req = webpackJsonp.push([[], {__extra_id__: (module, exports, req) => module.exports = req}, [["__extra_id__"]]]);
			delete req.m.__extra_id__;
			delete req.c.__extra_id__;
			return (filter) => {
				for (const i in req.c) {
					if (req.c.hasOwnProperty(i)) {
						const m = req.c[i].exports;
						if (m && m.__esModule && m.default && filter(m.default)) return m.default;
						if (m && filter(m))	return m;
					}
				}
				return null;
			};
		})();
	}

	_changeTitlebar(os){
		if (!os) return console.error("Something went horribly wrong.");
		const titleBarComponent = window.GlasscordApi.findModule(module => {
			if (!module || !module.default) return false;
			const moduleString = module.default.toString([]);
			if (moduleString.includes("macOSFrame")) return true;
			return false;
		});
	
		if (!titleBarComponent) return false;

		const originalRender = titleBarComponent.default.__original || titleBarComponent.default;
		titleBarComponent.default = function(props) {
			props.type = os.toUpperCase();
			return Reflect.apply(originalRender, this, arguments);
		};
		titleBarComponent.default.__original = originalRender;
		titleBarComponent.default.toString = function() {return originalRender.toString();};

		const appMount = document.getElementById("app-mount");
		appMount.classList.remove("platform-win");
		appMount.classList.remove("platform-osx");
		appMount.classList.remove("platform-linux");

		const className = os == "windows" ? "win" : os;
		appMount.classList.add(`platform-${className}`);
		return true;
	}

	_showConfirmationModal(title, content) {
		const ModalStack = window.GlasscordApi.findModule(module => module.push && module.update && module.pop && module.popWithKey);
		const Markdown = window.GlasscordApi.findModule(module => module && module.displayName && module.displayName === "Markdown");
		const ConfirmationModal = window.GlasscordApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
		const React = window.GlasscordApi.findModule(m => m.createElement && m.PureComponent);
		if (!ModalStack || !ConfirmationModal || !Markdown || !React) return console.error("Could not show restart modal");

		if (!Array.isArray(content)) content = [content];
		content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c);
		ModalStack.push(function(props) {
			return React.createElement(ConfirmationModal, Object.assign({
				header: title,
				children: content,
				red: false,
				confirmText: "Okay",
				cancelText: "Cancel",
				onConfirm: () => {
					const app = require("electron").remote.app;
					app.relaunch();
					app.quit();
				}
			}, props));
		});
	}

	_popModal() {
		const ModalStack = window.GlasscordApi.findModule(module => module.push && module.update && module.pop && module.popWithKey);
		if (!ModalStack) return console.error("Could not pop the modal");
		ModalStack.pop();
	}
}
 
