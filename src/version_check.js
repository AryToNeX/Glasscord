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
const https = require("https");
const fs = require("fs");
const Utils = require("./utils.js");
const pak = require("../package.json");

// why bother requiring the "request" module????
function httpsGetRecursive(url, options, callback){
	https.get(url, options, result => {
		if(result.statusCode == 301 || result.statusCode == 302){
			https.get(result.headers.location, options, callback);
			return;
		}
		callback(result);
	});
}

// https://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split("."),
        v2parts = v2.split(".");

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

module.exports = function(){
	if(!Utils.getGlobalConfig("autoUpdate")) return;
	
	if(path.extname(__dirname) == ".asar"){ // Are we inside an asar?
		console.log("You are running a packaged Glasscord installation!"); // Yes.
		let asarName = path.join(path.dirname(__dirname), path.basename(__dirname, ".asar")); // result is whatever-the-dir/glasscord (without the .asar at the end)
		// CALL TO THE GITHUB RELEASES API
		https.get("https://api.github.com/repos/AryToNeX/Glasscord/releases/latest", {headers: {"user-agent": "glasscord-updater-" + pak.version}}, result => {
			// Let's check the error
			if(result.statusCode != 200){
				console.log("Error while querying GitHub API (releases/latest): status code is " + result.statusCode);
				return;
			}
			
			// Let's now get the data
			let data = "";
			result.on("data", chunk => data += chunk);
			
			// Now we want to work with the data, right?
			result.on("end", () => {
				data = JSON.parse(data);
				
				// If there's no new version, return here.
				if(versionCompare(pak.version, data.tag_name.substring(1), {zeroExtend: true}) >= 0) return;
				
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
				httpsGetRecursive(url, {headers: {"user-agent": "glasscord-updater-" + pak.version}}, result => {
					// Again, let's check for errors
					if(result.statusCode != 200){
						console.log("Error while querying GitHub API (releases/download): status code is " + result.statusCode);
						return;
					}
					
					// We may want to save the data in a file with a .new extension for now.
					let newName = asarName + ".new";
					let fd = fs.openSync(newName, "a");
					result.on("data", chunk => fs.appendFileSync(fd, chunk));
					
					// We reached the end, let's close and rename the files.
					result.on("end", () => {
						fs.closeSync(fd); // Let's close the file
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
			});
		});
	}
};
