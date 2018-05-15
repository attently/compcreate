#! /usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const packageDirectory = __dirname + path.sep;
const Radio = require('prompt-radio');
const log = require('fancy-log');

const configDir = `${os.homedir() + path.sep}.compcreatecfg.json`;

const setupPrompt = new Radio({
	name: 'setup',
	message: 'Do you want personalize your settings?',
	choices: [
		'Yes',
		'No',
	],
	default: 'Yes',
});
const dirPrompt = new Radio({
	name: 'dir',
	message: 'Do you want to create a new directory for your components?',
	choices: [
		'Yes',
		'No',
	],
	default: 'Yes',
});
const indexPrompt = new Radio({
	name: 'index',
	message: 'Do you want to create an index file in the directory?',
	choices: [
		'Yes',
		'No',
	],
	default: 'Yes',
});
const scssPrompt = new Radio({
	name: 'scss',
	message: 'Do you want to create scss files?',
	choices: [
		'Yes',
		'No',
	],
	default: 'Yes',
});
const statelessPrompt = new Radio({
	name: 'stateless',
	message: 'Do you want to create stateless components?',
	choices: [
		'Yes',
		'No',
	],
	default: 'Yes',
});

const wordToBool = (word) => {
	if(word === undefined)
		return false;

	switch(word.toLowerCase()) {
		case 'yes':
		case '1':
			return true;
		case 'no':
		case '0':
			return false;
	}
};

const setupConfig = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			const personalize = await setupPrompt.run();

			if(wordToBool(personalize)) {
				const createDirectory = await dirPrompt.run();

				let createIndex = false;

				if(createDirectory)
					createIndex = await indexPrompt.run();

				const createScss = await scssPrompt.run();

				const createStateless = await statelessPrompt.run();

				const conf = {
					createDirectory,
					createIndex,
					createScss,
					createStateless,
				};

				log(conf);

				await fs.writeJson(configDir, conf);

				resolve();
			}
			else {
				await fs.copy(`${packageDirectory}config.json`, configDir);
				resolve();
			}
		}
		catch(err) {
			reject(`Could not create config: ${err}`);
		}
	});
};

const getConfig = () => {
	return new Promise(async (resolve, reject) => {
		if(!fs.pathExistsSync(configDir)) {
			try {
				await setupConfig();

				const config = require(configDir);

				resolve(config);
			}
			catch(err) {
				reject(err);
			}
		}
		else {
			const config = require(configDir);

			resolve(config);
		}
	});
};

const initializeArgs = (defaultsArgs) => {
	const version = require(`${packageDirectory}package.json`).version;
	const ArgumentParser = require('argparse').ArgumentParser;

	const parseBool = (value) => {
		if(['yes', 'true', 't', 'y', '1'].indexOf(value.toLowerCase()) > -1)
			return true;
		else if(['no', 'false', 'f', 'n', '0'].indexOf(value.toLowerCase()) > -1)
			return false;
		else {
			// eslint-disable-next-line no-console
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

const main = async () => {
	const config = await getConfig();
	const args = initializeArgs(config);

	const templateFile = 'template.js';
	const statelessFile = 'template.stateless.js';
	const indexFile = 'index.js';

	const backtracker = {};

	if(args['save_config']) {
		config.createDirectory = args.directory;
		config.createIndex = args.index;
		config.createStateless = args.stateless;
		config.createScss = args.scss;

		try {
			await fs.writeJson(configDir, config);
			log('New configuration saved.');
		}
		catch(err) {
			log.error(`Could not save new configuration: ${err}`);
		}
	}

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

	// fs-extra emptyDir function does not seem to work...
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

	const createReactComponentFiles = async (dirPath) => {
		backtracker[dirPath] = {
			filesCreated: [],
			directoriesCreated: [],
		};

		const filename = getFileNameFromPath(dirPath);
		let baseDirectory = getBaseDirectory(dirPath);
		const directoryExists = await fs.pathExists(dirPath);

		if(args.directory) {
			if(!directoryExists) {
				try {
					await fs.ensureDir(dirPath);
					backtracker[dirPath].directoriesCreated.push(dirPath);
				}
				catch(err) {
					// eslint-disable-next-line no-console
					log.error(`Could not create directory ${dirPath}: ${err}`);

					cleanupAndExit();
				}
			}
			else {
				try {
					const empty = await directoryIsEmpty(dirPath);

					if(!empty) {
						// eslint-disable-next-line no-console
						log.error(`Directory ${dirPath} not empty.`);

						cleanupAndExit();
					}
				}
				catch(err) {
					// eslint-disable-next-line no-console
					log.error(`Could not verify that directory ${dirPath} is empty: ${err}`);

					cleanupAndExit();
				}
			}

			baseDirectory += path.sep + filename;
		}

		const mainFilePath = `${baseDirectory + path.sep + filename}.js`;
		const template = `${packageDirectory}template/${templateFile}`;

		try {
			await fs.copy(template, mainFilePath);
			backtracker[dirPath].filesCreated.push(mainFilePath);

			try {
				await replaceInFile(mainFilePath, [
					['CLASSNAME', filename],
					[
						'STATELESS',
						args.stateless ?
							`\nimport ${filename}Stateless from './${filename}.stateless';` : '',
					],
					[
						'RETURNCONTENTS',
						args.stateless ?
							`<${filename}Stateless />;` : '<div></div>',
					],
				]);
			}
			catch(err) {
				// eslint-disable-next-line no-console
				log.error(`Could not replace contents of template ${mainFilePath}: ${err}`);

				cleanupAndExit();
			}
		}
		catch(err) {
			// eslint-disable-next-line no-console
			log.error(`Could not copy template ${template}: ${err}`);

			cleanupAndExit();
		}

		if(args.index) {
			const filePath = `${baseDirectory + path.sep}index.js`;
			const template = `${packageDirectory}template/${indexFile}`;

			if(!args.directory)
				// eslint-disable-next-line no-console
				log.warn(`Component not being created with directory. Did not create ${filePath}.`);
			else {
				try {
					await fs.copy(template, filePath);
					backtracker[dirPath].filesCreated.push(filePath);

					try {
						await replaceInFile(filePath, [['CLASSNAME', filename]]);
					}
					catch(err) {
						// eslint-disable-next-line no-console
						log.error(`Could not replace contents of template ${filePath}: ${err}`);

						cleanupAndExit();
					}
				}
				catch(err) {
					// eslint-disable-next-line no-console
					log.error(`Could not copy template ${template}: ${err}`);

					cleanupAndExit();
				}
			}
		}

		if(args.stateless) {
			const filePath = `${baseDirectory + path.sep + filename}.stateless.js`;
			const template = `${packageDirectory}template/${statelessFile}`;

			try {
				await fs.copy(template, filePath);
				backtracker[dirPath].filesCreated.push(filePath);

				try {
					await replaceInFile(filePath, [['CLASSNAME', filename]]);
				}
				catch(err) {
					// eslint-disable-next-line no-console
					log.error(`Could not replace contents of template ${filePath}: ${err}`);

					cleanupAndExit();
				}
			}
			catch(err) {
				// eslint-disable-next-line no-console
				log.error(`Could not copy template ${template}: ${err}`);

				cleanupAndExit();
			}
		}

		if(args.scss) {
			const filePath = `${baseDirectory + path.sep + filename}.scss`;

			const exists = await fs.pathExists(filePath);

			if(!exists) {
				try {
					await fs.ensureFile(filePath);
					backtracker[dirPath].filesCreated.push(filePath);
				}
				catch(err) {
					// eslint-disable-next-line no-console
					log.error(`Could not create ${filePath}: ${err}`);

					cleanupAndExit();
				}
			}
		}

		// eslint-disable-next-line no-console
		log('Successfully created files:');
		backtracker[dirPath].filesCreated.forEach((file) => {
			// eslint-disable-next-line no-console
			log(file);
		});
	};

	for(const dirPath of args.names)
		createReactComponentFiles(dirPath);
};

main();
