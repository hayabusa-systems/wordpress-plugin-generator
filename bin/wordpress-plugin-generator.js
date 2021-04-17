#!/usr/bin/env node

'use strict';

// import modules
const program = require('commander');
const fs = require('fs');
const config = require('../lib/config');
const generator = require('../lib/generator');

program.version('0.0.1', '-v --version')
    .option('-d, --debug', 'output extra debugging')
    .option('-t, --test', 'Test configuration file.')
    .option('-c,--config-file <type>', 'Specified config file.')
    .parse(process.argv);

const options = program.opts();
const debug = options.debug;
if (debug) {
  console.log('Debug Mode = ON');
  console.log('=== Use Option ===');
  console.log(options);
  console.log('=== Use Option ===');
}

let configPath = './config.json';
if (options.configFile) {
  configPath = options.configFile;
  if (debug) {
    console.log('Switch config file path. Use ' + configPath);
  }
}

if (!fs.existsSync(configPath)) {
  console.error('Can not read config file[ ' + configPath + ' ]');
  process.exit(1);
}

const configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (debug) {
  console.log('=== Read config file ===');
  console.log(configObject);
  console.log('=== Read config file ===');
}
if (!config.validate(configObject)) {
  console.error('Not valid config file.');
  process.exit(1);
}
// テストモードのときはここで終わり
if (options.test !== undefined && options.test) {
  process.exit(0);
}

generator(configObject);
