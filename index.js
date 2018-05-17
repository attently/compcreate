#! /usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const log = require('fancy-log');

const packageDirectory = __dirname + path.sep;

const config = require('./lib/config');
const jsdocDefs = require('./lib/jsdocDefs');

const templateFile = 'template.js';
const statelessFile = 'template.stateless.js';
const indexFile = 'index.js';

const backtracker = {};

const initializeArgs = (defaultsArgs) => {
	const version = require(`${packageDirectory}package.json`).version;
	const ArgumentParser = require('argparse').ArgumentParser;

	const parseBool = (value) => {
		if(['yes', 'true', 't', 'y', '1'].indexOf(value.toLowerCase()) > -1)
			return true;
		else if(['no', 'false', 'f', 'n', '0'].indexOf(value.toLowerCase()) > -1)
			return false;
		else {
			log.error(`Could not read value given as boolean: '${value}'`);
			process.exit(1);
		}
	};

	const parser = new ArgumentParser({
		version,
		addHelp: true,
		description: 'Compcreate is a command line tool for creating React components easily.',
	});

	parser.addArgument(['names'], {
		help: 'A list of desired component names.',
		nargs: '*',
	});

	parser.addArgument(['-d', '--directory'], {
		help: `Creates a new directory for component files.`,
		defaultValue: defaultsArgs.createDirectory,
		nargs: '?',
		const: true,
		type: parseBool,
	});

	parser.addArgument(['-i', '--index'], {
		help: `Creates an index.js file for easier importing from directory.`,
		defaultValue: defaultsArgs.createIndex,
		nargs: '?',
		const: true,
		type: parseBool,
	});

	parser.addArgument(['-s', '--stateless'], {
		help: `Creates a stateless component that is included inside main component.`,
		defaultValue: defaultsArgs.createStateless,
		nargs: '?',
		const: true,
		type: parseBool,
	});

	parser.addArgument(['-c', '--scss'], {
		help: `Creates a SCSS file for custom component styles.`,
		defaultValue: defaultsArgs.createScss,
		nargs: '?',
		const: true,
		type: parseBool,
	});

	parser.addArgument(['-j', '--jsdoc'], {
		help: `Inserts JSDoc comments into generated component.`,
		defaultValue: defaultsArgs.insertJsdoc,
		nargs: '?',
		const: true,
		type: parseBool,
	});

	parser.addArgument(['--save-config'], {
		help: `Saves configuration used in command as new default.`,
		action: 'storeTrue',
	});

	const args = parser.parseArgs();

	// If flags were set but given no value
	if(args.directory === null)
		args.directory = true;

	if(args.index === null)
		args.index = true;

	if(args.stateless === null)
		args.stateless = true;

	if(args.scss === null)
		args.scss = true;

	if(!args.names.length) {
		if(!args['save_config'])
			parser.printHelp();

		process.exit(1);
	}

	return args;
};

const getFileNameFromPath = (dirPath) => {
	const splitPath = dirPath.split(path.sep);

	if(splitPath.length > 0)
		return splitPath[splitPath.length - 1];
	else
		return '';
};

const getBaseDirectory = (dirPath) => {
	const pwd = process.cwd() + path.sep;
	const splitPath = dirPath.split(path.sep);

	if(splitPath.length > 0) {
		const baseChunks = splitPath.slice(0, splitPath.length - 1);
		return pwd + baseChunks.join(path.sep);
	}
	else
		return pwd;
};

const directoryIsEmpty = (dir) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, items) => {
			if(err)
				reject(err);
			else
				resolve(items.length === 0);
		});
	});
};

const replaceInFile = (filePath, params) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if(err)
				reject(err);
			else {
				params.forEach((replaceParams) => {
					const reg = new RegExp(replaceParams[0], 'g');
					data = data.replace(reg, replaceParams[1]);
				});

				fs.writeFile(filePath, data, (err) => {
					if(err)
						reject(err);
					else
						resolve();
				});
			}
		});
	});
};

const cleanupAndExit = () => {
	for(const key in backtracker) {
		if(Object.hasOwnProperty.call(backtracker, key)) {
			const tracker = backtracker[key];

			tracker.filesCreated.forEach((file) => {
				fs.removeSync(file);
			});

			tracker.directoriesCreated.forEach((file) => {
				fs.removeSync(file);
			});
		}
	}

	process.exit(1);
};

const setupDirectory = (dirPath) => {
	return new Promise(async (resolve, reject) => {
		try {
			const directoryExists = await fs.pathExists(dirPath);
			const componentName = getFileNameFromPath(dirPath);
			const baseDirectory = getBaseDirectory(dirPath);

			if(!directoryExists) {
				try {
					await fs.ensureDir(dirPath);

					backtracker[dirPath].directoriesCreated.push(dirPath);

					resolve(baseDirectory + path.sep + componentName);
				}
				catch(err) {
					reject(`Could not create directory ${dirPath}: ${err}`);
				}
			}
			else {
				try {
					const empty = await directoryIsEmpty(dirPath);

					if(!empty)
						reject(`Directory ${dirPath} not empty.`);
					else
						resolve(baseDirectory + path.sep + componentName);
				}
				catch(err) {
					reject(`Could not verify that directory ${dirPath} is empty: ${err}`);
				}
			}
		}
		catch(err) {
			reject(`Could not determine if directory exists: ${err}`);
		}
	});
};

const setupMainTemplate = (baseDirectory, componentName, args) => {
	return new Promise(async (resolve, reject) => {
		const mainFilePath = `${baseDirectory + path.sep + componentName}.js`;
		const template = `${packageDirectory}template${path.sep + templateFile}`;

		try {
			await fs.copy(template, mainFilePath);

			let replacements = [
				['CLASSNAME', componentName],
				[
					'STATELESS',
					args.stateless ?
						`import ${componentName}Stateless from './${componentName}.stateless';` : '\n',
				],
				[
					'RETURNCONTENTS',
					args.stateless ?
						`<${componentName}Stateless />` : '<div></div>',
				],
			];

			for(const key in jsdocDefs) {
				if(Object.hasOwnProperty.call(jsdocDefs, key)) {
					if(args.jsdoc) {
						/*
						 * JSDoc changes must come before others
						 * because they may include template variables.
						 */
						replacements = [
							[key, jsdocDefs[key]],
							...replacements,
						];
					}
					else {
						replacements.push([key, '']);
					}
				}
			}

			replacements.push(['\n\n\n', '\n']);

			try {
				await replaceInFile(mainFilePath, replacements);

				resolve(mainFilePath);
			}
			catch(err) {
				reject(`Could not replace contents of template ${mainFilePath}: ${err}`);
			}
		}
		catch(err) {
			reject(`Could not copy template ${template}: ${err}`);
		}
	});
};

const setupIndexTemplate = (baseDirectory, componentName, args) => {
	return new Promise(async (resolve, reject) => {
		const filePath = `${baseDirectory + path.sep}index.js`;
		const template = `${packageDirectory}template${path.sep + indexFile}`;

		try {
			await fs.copy(template, filePath);

			try {
				await replaceInFile(filePath, [['CLASSNAME', componentName]]);

				resolve(filePath);
			}
			catch(err) {
				reject(`Could not replace contents of template ${filePath}: ${err}`);
			}
		}
		catch(err) {
			reject(`Could not copy template ${template}: ${err}`);
		}
	});
};

const setupStatelessTemplate = (baseDirectory, componentName, args) => {
	return new Promise(async (resolve, reject) => {
		const filePath = `${baseDirectory + path.sep + componentName}.stateless.js`;
		const template = `${packageDirectory}template${path.sep + statelessFile}`;

		try {
			await fs.copy(template, filePath);
			let replacements = [
				['CLASSNAME', componentName],
			];

			for(const key in jsdocDefs) {
				if(Object.hasOwnProperty.call(jsdocDefs, key)) {
					if(args.jsdoc) {
						/*
						 * JSDoc changes must come before others
						 * because they may include template variables.
						 */
						replacements = [
							[key, jsdocDefs[key]],
							...replacements,
						];
					}
					else {
						replacements.push([key, '']);
					}
				}
			}

			replacements.push(['\n\n\n', '\n']);

			try {
				await replaceInFile(filePath, replacements);

				resolve(filePath);
			}
			catch(err) {
				reject(`Could not replace contents of template ${filePath}: ${err}`);
			}
		}
		catch(err) {
			reject(`Could not copy template ${template}: ${err}`);
		}
	});
};

const setupScssTemplate = (baseDirectory, componentName, args) => {
	return new Promise(async (resolve, reject) => {
		const filePath = `${baseDirectory + path.sep + componentName}.scss`;

		const exists = await fs.pathExists(filePath);

		if(!exists) {
			try {
				await fs.ensureFile(filePath);

				resolve(filePath);
			}
			catch(err) {
				reject(`Could not create ${filePath}: ${err}`);
			}
		}
	});
};

const createReactComponentFiles = async (dirPath, args) => {
	backtracker[dirPath] = {
		filesCreated: [],
		directoriesCreated: [],
	};

	const filename = getFileNameFromPath(dirPath);
	let baseDirectory = getBaseDirectory(dirPath);

	if(args.directory) {
		try {
			baseDirectory = await setupDirectory(dirPath);
		}
		catch(err) {
			log.error(`Could not set up directory: ${err}`);
			cleanupAndExit();
		}
	}

	const promises = [];

	promises.push(setupMainTemplate(baseDirectory, filename, args));

	if(args.index) {
		if(!args.directory)
			log.warn(`Component not being created with directory. Did not create index file.`);
		else
			promises.push(setupIndexTemplate(baseDirectory, filename, args));
	}

	if(args.stateless)
		promises.push(setupStatelessTemplate(baseDirectory, filename, args));

	if(args.scss)
		promises.push(setupScssTemplate(baseDirectory, filename, args));

	try {
		const createdFiles = await Promise.all(promises);

		backtracker[dirPath].filesCreated = [...backtracker[dirPath].filesCreated, ...createdFiles];

		log('Successfully created files:');
		createdFiles.forEach((file) => {
			log(file);
		});
	}
	catch(err) {
		log.error(`Uh-oh. Encountered errors while creating files: ${err}`);
		cleanupAndExit();
	}
};

const main = async () => {
	const conf = {...config.defaultConfig, ...(await config.getConfig())};
	const args = initializeArgs(conf);

	if(args['save_config']) {
		conf.createDirectory = args.directory;
		conf.createIndex = args.index;
		conf.createStateless = args.stateless;
		conf.createScss = args.scss;

		try {
			await config.saveConfig(conf);
			log('New configuration saved.');
		}
		catch(err) {
			log.error(`Could not save new configuration: ${err}`);
		}
	}

	for(const dirPath of args.names)
		createReactComponentFiles(dirPath, args);
};

main();
