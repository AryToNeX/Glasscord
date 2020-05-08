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

const Utils = require("./utils.js");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const URL = "https://api.github.com/repos/AryToNeX/Glasscord-Modules/git/trees/";
const FilePattern = "https://raw.githubusercontent.com/AryToNeX/Glasscord-Modules/{SHA}/{PATH}";
const options = {headers: {"user-agent": "glasscord"}};
const modulePath = path.join(Utils.getSavePath(), "modules");

var appName = Utils.getRootAppName();

module.exports = function(){
	var masterSha;

	console.log("Fetching featured Glasscord modules for application: " + appName);
	Utils.httpsGet(URL + "master", options, result => {

		if(result.statusCode != 200){
			console.log("[Glasscord Featured Modules] Error while querying GitHub API: status code is " + result.statusCode);
			return;
		}

		let data = JSON.parse(result.data);

		masterSha = data.sha;

		let sha;
		for(let tree of data.tree){
			if(tree.path === "featured" && tree.type === "tree"){
				sha = tree.sha;
				break;
			}
		}

		return Utils.httpsGet(URL + sha, options, result => {

			if(result.statusCode != 200){
				console.log("[Glasscord Featured Modules] Error while querying GitHub API: status code is " + result.statusCode);
				return;
			}

			let data = JSON.parse(result.data);

			let sha;
			for(let tree of data.tree){
				if(tree.path === appName && tree.type === "tree"){
					sha = tree.sha;
					break;
				}
			}

			if(typeof sha === "undefined")
				return console.log("[Glasscord Featured Modules] No featured modules available for this app.");

			return Utils.httpsGet(URL + sha, options, result => {

				if(result.statusCode != 200){
					console.log("[Glasscord Featured Modules] Error while querying GitHub API: status code is " + result.statusCode);
					return;
				}

				let data = JSON.parse(result.data);

				let blobs = {};
				for(let blob of data.tree){
					if(blob.type === "blob" && path.extname(blob.path) === ".js")
						blobs["featured/" + appName + "/" + blob.path] = blob.sha;
				}

				for(let blob in blobs){ // blobs[blob] is the blob sha
					const blobBaseName = path.basename(blob);
					if(fs.existsSync(path.join(modulePath, blobBaseName))){
						const file = fs.readFileSync(path.join(modulePath, blobBaseName));
						const fileHash = Utils.hash("sha1", "blob " + file.length + "\0" + file); // Search: how Git calculates SHA-1 checksums of blobs

						if(blobs[blob] === fileHash)
							return console.log("[Glasscord Featured Modules] Matching files for " + blob + ".");
					}

					console.log("[Glasscord Featured Modules] Downloading " + blobBaseName + "...");
					Utils.httpsGet(FilePattern.replace("{SHA}", masterSha).replace("{PATH}", blob), options, result => {
						if(result.statusCode != 200){
							console.log("[Glasscord Featured Modules] Error while downloading " + blobBaseName + ": status code is " + result.statusCode);
							return;
						}
						fs.writeFileSync(path.join(modulePath, blobBaseName), result.data);
						console.log("[Glasscord Featured Modules] Downloaded " + blobBaseName + ".");
					});
				}
			});
		});
	});

};
