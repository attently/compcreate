#! /usr/bin/env node

if(process.argv.length < 3) {
	console.log('compcreate must be passed in a path for a new component.');
	console.log(`Example: compcreate /path/to/desired/component`);
	process.exit(1);
}

const fs = require('fs');
const path = require('path');

let isDirectory = (dirPath) => {
	return new Promise((resolve, reject) => {
		fs.stat(dirPath, (err, stats) => {
			if(err) {
				if(err.code == 'ENOENT')
					resolve(false);
				else
					reject(err);
			}
			else
				resolve(stats.isDirectory());
		});
	});
};

let createDirectory = (dirPath) => {
	return new Promise(async (resolve, reject) => {
		try {
			let exists = await isDirectory(dirPath);

			if(!exists) {
				fs.mkdir(dirPath, (err) => {
					if(err)
						reject(err);
					else
						resolve();
				});
			}
			else
				reject('Directory already exists');
		}
		catch(err) {
			reject(err);
		}
	});
};

let getFileNameFromPath = (dirPath) => {
	let splitPath = dirPath.split(path.sep);

	if(splitPath.length > 0)
		return splitPath[splitPath.length - 1];
	else
		return '';
};

let copyTemplate = (dirPath, filename) => {
	return new Promise((resolve, reject) => {
		fs.copyFile(`${__dirname + path.sep}template.js`, `${dirPath + path.sep + filename}.js`, (err) => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

let replaceTemplateParams = (dirPath, filename) => {
	return new Promise((resolve, reject) => {
		fs.readFile(`${dirPath + path.sep + filename}.js`, 'utf8', (err, data) => {
			if(err) {
				reject(err);
				return;
			}

			let className = `${filename.slice(0,1).toUpperCase()}${filename.slice(1)}`;
			let newData = data.replace(/CLASSNAME/g, className);

			fs.writeFile(`${dirPath + path.sep + filename}.js`, newData, (err) => {
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
}

let createReactComponentFiles = async (dirPath) => {
	try {
		let filename = getFileNameFromPath(dirPath);
		await createDirectory(dirPath);
		await copyTemplate(dirPath, filename);
		await replaceTemplateParams(dirPath, filename);
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
