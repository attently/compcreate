#! /usr/bin/env node

const config = require('./config.json');
const ArgumentParser = require('argparse').ArgumentParser;
const version = require('./package.json').version;
const parser = new ArgumentParser({
	version,
	addHelp: true,
	description: 'Compcreate is a command line tool for creating React components easily.',
});

parser.addArgument(['-d', '--directory'], {
	help: `Creates a new directory for component files (default: ${config.createDirectory}).`,
	action: 'storeTrue',
});

parser.addArgument(['-i', '--index'], {
	help: `Creates an index.js file for easier importing from directory (default: ${config.createIndex}).`,
	action: 'storeTrue',
});

parser.addArgument(['-s', '--stateless'], {
	help: `Creates a stateless component that is included inside main component (default: ${config.createStateless}).`,
	action: 'storeTrue',
});

parser.addArgument(['-c', '--scss'], {
	help: `Creates a SCSS file for custom component styles (default: ${config.createScss}).`,
	action: 'storeTrue',
});

const args = parser.parseArgs();

if(process.argv.length < 3) {
	// console.log('compcreate must be passed in a path for a new component.');
	// console.log(`Example: compcreate /path/to/desired/component`);
	process.exit(1);
}

const fs = require('fs-extra');
const path = require('path');
const templateFiles = ['template.js','template.stateless.js'];

const getFileNameFromPath = (dirPath) => {
	const splitPath = dirPath.split(path.sep);

	if(splitPath.length > 0)
		return splitPath[splitPath.length - 1];
	else
		return '';
};

const copyTemplate = (dirPath, filename) => {
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

			const className = `${filename.slice(0, 1).toUpperCase()}${filename.slice(1)}`;
			const newData = data.replace(/CLASSNAME/g, className);

			fs.writeFile(`${dirPath + path.sep + fname}`, newData, (err) => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	});
};

const createScssFile = (dirPath, filename) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(`${dirPath + path.sep + filename}.scss`, '', (err) => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

const createReactComponentFiles = async (dirPath) => {
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

for(const dirPath of process.argv.slice(2))
	createReactComponentFiles(dirPath);
