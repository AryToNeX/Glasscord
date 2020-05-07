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

const asar = require("asar");
const glob = require("glob");
const path = require("path");
const src = ".";

let filenames = [
	path.resolve("package.json"),
	path.resolve("LICENSE"),
	...glob.sync(path.join(path.resolve("src"), "**")),
	path.resolve("node_modules")
];

// Optimize package size by removing unneeded garbage from the node modules folder
const blacklistFilenames = [
	path.resolve("node_modules", "x11", "test-runner.js"),
	...glob.sync(path.join(path.resolve("node_modules", "x11", "test"), "**")),
	...glob.sync(path.join(path.resolve("node_modules", "x11", "examples"), "**")),
	...glob.sync(path.join(path.resolve("node_modules", "x11", "autogen"), "**"))
];

traverseDeps(src, undefined, filenames);

asar.createPackageFromFiles(src, "glasscord.asar", filenames.filter(x => !blacklistFilenames.includes(x)))
	.then(() => console.log("Packaging done"))
	.catch(e => console.log("Something went wrong: " + e));

// Functions

function traverseDeps(startPath, dependency = undefined, filenames = []){
	let pak, pathToBackup;
	if(typeof dependency !== "undefined"){
		pak = require(path.resolve(startPath, "node_modules", dependency, "package.json"));
		pathToBackup = path.resolve(startPath, "node_modules", dependency, "**")
	}else
		pak = require(path.resolve(startPath, "package.json"));
	
	if(typeof pathToBackup !== "undefined") filenames.push(...glob.sync(pathToBackup));
	
	for(let dependency in pak.dependencies){
		console.log("Including dependency: " + dependency);
		traverseDeps(startPath, dependency, filenames);
	}
}
