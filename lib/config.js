const Radio = require('prompt-radio');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const configDir = `${os.homedir() + path.sep}.compcreatecfg.json`;

const defaultConfig = {
	createDirectory: true,
	createIndex: true,
	createScss: true,
	createStateless: false,
	insertJsdoc: true,
};

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

const jsdocPrompt = new Radio({
	name: 'jsdoc',
	message: 'Do you want us to insert JSDoc comments?',
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

const saveConfig = (config) => {
	return fs.writeJson(configDir, config);
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

				const insertJsdoc = await jsdocPrompt.run();

				const conf = {
					createDirectory: wordToBool(createDirectory),
					createIndex: wordToBool(createIndex),
					createScss: wordToBool(createScss),
					createStateless: wordToBool(createStateless),
					insertJsdoc: wordToBool(insertJsdoc),
				};

				await saveConfig({...defaultConfig, ...conf});

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

module.exports = exports = {
	saveConfig,
	setupConfig,
	getConfig,
	defaultConfig,
};
