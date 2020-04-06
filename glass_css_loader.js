const Plugin = require('../plugin');
const path = window.require('path');
const fs = window.require('fs');

module.exports = new Plugin({
    name: 'CSS Loader + Glasscord Integration',
    author: 'Joe 🎸#7070 + AryToNeX',
    description: 'Loads and hot-reloads CSS.',
    preload: true, //load this before Discord has finished starting up
    color: 'blue',

    config: {
        path: {
            default: './plugins/style.css',
            parse: function(filePath) {
                if (!filePath || !filePath.endsWith('.css')) {
                    return false;
                }
                if (path.isAbsolute(filePath)) {
                    if (!fs.existsSync(filePath)) {
                        return false;
                    }
                    return path.relative(process.env.injDir, filePath);
                } else {
                    const p = path.join(process.env.injDir, filePath);
                    if (!fs.existsSync(p)) {
                        return false;
                    }
                    return path.relative(process.env.injDir, p);
                }
            }
        }
    },

    load: async function() {
        function readFile(path, encoding = 'utf-8') {
            return new Promise((resolve, reject) => {
                fs.readFile(path, encoding, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
        }
        const cssPath = path.join(process.env.injDir, this.settings.path || this.config.path.default);

        readFile(cssPath).then(css => {
            if (!window.customCss) {
                window.customCss = document.createElement('style');
                document.head.appendChild(window.customCss);
            }
            window.customCss.innerHTML = css;
            this.info('Custom CSS loaded!', window.customCss);
            window.require('electron').ipcRenderer.send('glasscord_refresh_variables');

            if (window.cssWatcher == null) {
                window.cssWatcher = fs.watch(cssPath, { encoding: 'utf-8' },
                eventType => {
                    if (eventType == 'change') {
                        readFile(cssPath).then(newCss => {
                            window.customCss.innerHTML = newCss;
                            window.require('electron').ipcRenderer.send('glasscord_update');
                        });
                    }
                });
            }
        }).catch(() => console.info('Custom CSS not found. Skipping...'));
    },
    unload: function() {
        if (window.customCss) {
            document.head.removeChild(window.customCss);
            window.customCss = null;
        }
        if (window.cssWatcher) {
            window.cssWatcher.close();
            window.cssWatcher = null;
        }
    },
    generateSettings: function() {
        const d = window.ED.classMaps.description;
        const b = window.ED.classMaps.buttons;
        const id = window.EDApi.findModule('inputDefault');
        const m = window.EDApi.findModule('marginTop8');

        const result = `<div class="${d.description} ${d.modeDefault}">Custom CSS Path<br>This can be relative to the EnhancedDiscord directory (e.g. <code class="inline">./big_gay.css</code>) or absolute (e.g. <code class="inline">C:/theme.css</code>.)</div><input type="text" class="${id.inputDefault}" value="${this.settings.path || this.config.path.default}" maxlength="2000" placeholder="${this.config.path.default}" id="custom-css-path"><button type="button" id="save-css-path" class="${b.button} ${b.lookFilled} ${b.colorBrand} ${m.marginTop8} ${m.marginBottom8}" style="height:24px;margin-right:10px;"><div class="${b.contents}">Save</div></button>`;
        return result;
    },
    settingListeners: [
        {
            el: '#save-css-path',
            type: 'click',
            eHandler: function() {
                //console.log(this, e.target);
                const pathInput = document.getElementById('custom-css-path');
                if (!pathInput) return;
                if (pathInput.value && module.exports.config.path.parse(pathInput.value) == false) {
                    const cont = this.firstElementChild;
                    cont.innerHTML = 'Invalid file.';
                    setTimeout(() => {
                        try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                    }, 3000);
                    return;
                }
                const newPath = module.exports.config.path.parse(pathInput.value) || module.exports.config.path.default;
                const s = module.exports.settings;
                if (s.path == newPath) {
                    const cont = this.firstElementChild;
                    cont.innerHTML = 'Path was already saved.';
                    setTimeout(() => {
                        try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                    }, 3000);
                    return;
                }
                s.path = newPath;
                module.exports.settings = s;
                module.exports.unload();
                module.exports.load();
                const cont = this.firstElementChild;
                cont.innerHTML = 'Saved!';
                setTimeout(() => {
                    try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                }, 3000);
            }
        }
    ]

});
