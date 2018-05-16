# compcreate
## A command line tool to create React components

Never again copy and paste react boilerplate class definitions, or worry about having to create subdirectories: `compcreate` allows for generating React components with some custom options for SCSS files, Stateless components, and an `index.js` files for easier importing.

## Installation
```bash
yarn global add @attently/compcreate
```

**Note:** You may need to run the above as `root`.

## Initial Setup
When compcreate is first run, it will have some interactive prompts to find out how you would like your components to be generated. It will save this configuration, and use it for all future runs.

## Usage
To create a new component `Foo`, simply run the following command:
```bash
compcreate /path/to/Foo
```
where `/path/to/` is the directory in which you want `Foo` to be created.

## Options
The initial configuration settings can be overidden for instances where you may not need or want something from it. You can also save the new settings for later runs. Here are the available options:

| Flag | Description | Value To Enable| Value To Disable|
|-|-|-|-|
|`-v` or `--version`|Shows `compcreate`'s version number||`no`, `false`, `f`, `n`, `0`|
|`-d` or `--directory`|Whether or not to create the component in a new directory|`yes`, `true`, `t`, `y`, `1`|`no`, `false`, `f`, `n`, `0`|
|`-i` or `--index`|Whter or not to create an index.js file for easier importing from directory. **Note:** `index.js` will not be created if compcreate is not creating a directory for the new component, as to not overwrite an existing `index.js` file.|`yes`, `true`, `t`, `y`, `1`|`no`, `false`, `f`, `n`, `0`|
|`-s` or `--stateless`|Whether or not to create a stateless component that is included inside main component.|`yes`, `true`, `t`, `y`, `1`|`no`, `false`, `f`, `n`, `0`|
|`-c` or `--scss`|Whether or not to create a SCSS file for custom component styles.|`yes`, `true`, `t`, `y`, `1`|`no`, `false`, `f`, `n`, `0`|
|`-j` or `--jsdoc`|Whether or not to insert JSDoc comments into generated component files.|`yes`, `true`, `t`, `y`, `1`|`no`, `false`, `f`, `n`, `0`|
|`--save-config`|Save all given flag values as the new default||
