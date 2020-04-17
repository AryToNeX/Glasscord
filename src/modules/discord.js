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

const Module = require('../module.js')
const Utils = require('../utils');

module.exports = class Discord extends Module{
	static app = ['discord'];
	cssProps = ['--glasscord-titlebar'];
	hasInitialized = false;
	currentTitlebar = 'native';
	
	constructor(main){
		super(main);
		// KWin is buggy, hack around it for now PART 1 BEGIN
		if(process.platform == 'linux' && this.main.win.isNormal()){
			if (!this.config.titlebar || this.config.titlebar === 'native') return;
			this.main.getModule('Linux')._getXWindowManager().then(XWinMgr => {
				if(!XWinMgr || XWinMgr !== 'KWin') return;
				this.main.win.setSize(this.main.win.getSize()[0], ++this.main.win.getSize()[1]);
				this._KwinIsDumb = true;
			});
		}
		// KWin is buggy, hack around it for now PART 1 END
		this.main.win.webContents.on('dom-ready', () => {
			this.main._executeInRenderer(this._getWebpackModules);
		});

		this.main.win.webContents.on('did-finish-load', async () => {
			if (!this.config.titlebar || this.config.titlebar === 'native') return;
			const success = await this.main._executeInRenderer(this._changeTitlebar, this.config.titlebar);
			if (!success) return this.log('Something went wrong trying to change the titlebar.', 'error');
			this.currentTitlebar = this.config.titlebar;
			this.log('Titlebar successfully updated', 'info');
			this.main.win.blur();
			this.main.win.focus();
			
			// KWin is buggy, hack around it for now PART 2
			if(this._KwinIsDumb) this.main.win.setSize(this.main.win.getSize()[0], --this.main.win.getSize()[1]);
		});
	}
	
	async update(cssProp, value){
		if (cssProp === '--glasscord-titlebar') {
			// Ignore the initial null update
			if (!this.hasInitialized) return this.hasInitialized = true;

			const os = typeof(value) === 'string' ? value.toLowerCase() : 'native';
			if (os !== 'windows' && os !== 'osx' && os !== 'linux' && os !== 'native') return this.log(`Invalid OS passed: ${os}`, 'error');
			if (os === this.config.titlebar) return; // Already set

			// Update to new titlebar
			this.config.titlebar = os;
			const current = Utils.getWindowProperties();
			current.frame = os === 'linux';
			Utils.setWindowProperties(current);
			this.saveConfig();

			// Show modal, but pop previous in case of a late loading css
			if (os === this.currentTitlebar) this.main._executeInRenderer(this._popModal);
			else this.main._executeInRenderer(this._showConfirmationModal, 'Restart Needed', 'The theme you are using makes use of a custom titlebar that requires a restart to take effect. Would you like to restart now?')
		}
	}


	// Renderer Methods
	_getWebpackModules(){
		if (!window.GlasscordApi) return; // In case something went wrong.
		window.GlasscordApi.findModule = (() => {
			const req = webpackJsonp.push([[], {__extra_id__: (module, exports, req) => module.exports = req}, [['__extra_id__']]]);
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
		if (!os) return console.error('Something went horribly wrong.');
		const titleBarComponent = window.GlasscordApi.findModule(module => {
			if (!module || !module.default) return false;
			const moduleString = module.default.toString([]);
			if (moduleString.includes('macOSFrame')) return true;
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
	
		const appMount = document.getElementById('app-mount');
		appMount.classList.remove('platform-win');
		appMount.classList.remove('platform-osx');
		appMount.classList.remove('platform-linux');
		
		const className = os == 'windows' ? 'win' : os;
		appMount.classList.add(`platform-${className}`);
		return true;
	}

	_showConfirmationModal(title, content) {
		const ModalStack = window.GlasscordApi.findModule(module => module.push && module.update && module.pop && module.popWithKey);
		const Markdown = window.GlasscordApi.findModule(module => module && module.displayName && module.displayName === 'Markdown');
		const ConfirmationModal = window.GlasscordApi.findModule(m => m.defaultProps && m.key && m.key() == 'confirm-modal');
		const React = window.GlasscordApi.findModule(m => m.createElement && m.PureComponent);
		if (!ModalStack || !ConfirmationModal || !Markdown || !React) return console.error('Could not show restart modal');

		if (!Array.isArray(content)) content = [content];
		content = content.map(c => typeof(c) === 'string' ? React.createElement(Markdown, null, c) : c);
		ModalStack.push(function(props) {
			return React.createElement(ConfirmationModal, Object.assign({
				header: title,
				children: content,
				red: false,
				confirmText: 'Okay',
				cancelText: 'Cancel',
				onConfirm: () => {
					const app = require('electron').remote.app;
					app.relaunch();
					app.exit();
				}
			}, props));
		});
	}

	_popModal() {
		const ModalStack = window.GlasscordApi.findModule(module => module.push && module.update && module.pop && module.popWithKey);
		if (!ModalStack) return console.error('Could not pop the modal');
		ModalStack.pop();
	}
}
 
