#! /usr/bin/env node

if(process.argv.length < 3) {
	console.log('compcreate must be passed in a path for a new component.');
	console.log(`Example: compcreate /path/to/desired/component`);
	process.exit(1);
}

const fs = require('fs-extra');
const path = require('path');

const templateFiles = ['template.js','template.stateless.js'];

let getFileNameFromPath = (dirPath) => {
	let splitPath = dirPath.split(path.sep);

	if(splitPath.length > 0)
		return splitPath[splitPath.length - 1];
	else
		return '';
};

let copyTemplate = (dirPath, filename) => {
	return new Promise((resolve, reject) => {
		fs.copy(`${__dirname + path.sep}template`, `${dirPath}`, (err) => {
			if (err)
				reject(err);
			else
				resolve();
		});
	});
};

let renameFile = (templateName,dirPath,filename) => {
	let fname = filename + templateName.slice(8);
	return new Promise((resolve, reject) => {
		fs.move(`${dirPath + path.sep + templateName}`,`${dirPath + path.sep + fname}`, (err) => {
			if (err) 
				reject(err);
			else
				resolve();
		});
	});
};

let replaceTemplateParams = (fname, dirPath, filename) => {
	return new Promise((resolve, reject) => {
		fs.readFile(`${dirPath + path.sep + fname}`, 'utf8', (err, data) => {
			if(err) {
				reject(err);
				return;
			}

			let className = `${filename.slice(0,1).toUpperCase()}${filename.slice(1)}`;
			let newData = data.replace(/CLASSNAME/g, className);

			fs.writeFile(`${dirPath + path.sep + fname}`, newData, (err) => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	});
};

let createScssFile = (dirPath, filename) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(`${dirPath + path.sep + filename}.scss`, '', (err) => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

let createReactComponentFiles = async (dirPath) => {
	try {
		let filename = getFileNameFromPath(dirPath);
		let files = [...templateFiles.map( (fname) => `${filename + fname.slice(8)}`), 'index.js'];

		await copyTemplate(dirPath, filename);
		for (let fname of templateFiles)
			await renameFile(fname,dirPath,filename);
		for (let fname of files)
			await replaceTemplateParams(fname,dirPath,filename);
		await createScssFile(dirPath, filename);

		console.log(`${dirPath} component created.`);
	}
	catch(err) {
		console.error(`Could not create directory: ${err}`);
	}
};

for(let dirPath of process.argv.slice(2)) {
	createReactComponentFiles(dirPath);
}
