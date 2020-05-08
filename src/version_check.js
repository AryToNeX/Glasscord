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
const Utils = require("./utils.js");
const options = {headers: {"user-agent": "glasscord"}};

module.exports = function(){
	if(!Utils.getGlobalConfig("autoUpdate")) return console.log("Glasscord autoupdate is disabled!");
	
	if(path.extname(path.join(__dirname, "..")) == ".asar"){ // Are we inside an asar?
		console.log("You are running a packaged Glasscord installation!"); // Yes.
		let asarName = path.join(path.dirname(__dirname), path.basename(__dirname, ".asar")); // result is whatever-the-dir/glasscord (without the .asar at the end)
		// CALL TO THE GITHUB RELEASES API
		Utils.httpsGet("https://api.github.com/repos/AryToNeX/Glasscord/releases/latest", options, result => {
			// Let's check the error
			if(result.statusCode != 200){
				console.log("Error while querying GitHub API (releases/latest): status code is " + result.statusCode);
				return;
			}

			data = JSON.parse(result.data);

			// If there's no new version, return here.
			if(Utils.versionCompare(pak.version, data.tag_name.substring(1), {zeroExtend: true}) >= 0) return;

			console.log("A new Glasscord update was found! Downloading...");

			// Let's traverse the assets array to find our object!
			let url;
			for(let asset of data.assets){
				if(asset.name == "glasscord.asar"){
					url = asset.browser_download_url;
					break;
				}
			}

			// Let's download it!
			Utils.httpsGet(url, options, result => {
				// Again, let's check for errors
				if(result.statusCode != 200){
					console.log("Error while querying GitHub API (releases/download): status code is " + result.statusCode);
					return;
				}

				// We may want to save the data in a file with a .new extension for now.
				let newName = asarName + ".new";
				fs.writeFileSync(newName, result.data);
				// Let's rename files now
				try{
					fs.renameSync(asarName + ".asar", asarName + ".old"); // Our current .asar becomes .old
					fs.renameSync(newName, asarName + ".asar"); // The .new file becomes our .asar
				}catch(e){
					console.log("Glasscord update failed upon file renaming!");
				}
				// We finished! The next time Discord is opened, it will have the new version up and running, which is enough.
				console.log("Glasscord update downloaded!");
			});
		});
	}
}

