'use strict';

const fs = require('fs');
const plugin_core_generator = require('./generator/class-plugin-core.js');

const setup = function(plugin) {
  if (fs.existsSync('./dist')) {
    fs.rmdirSync('./dist', {recursive: true});
  }
  fs.mkdirSync('./dist');
  fs.mkdirSync('./dist/' + plugin.name);
  fs.mkdirSync('./dist/' + plugin.name + '/entity');
  fs.mkdirSync('./dist/' + plugin.name + '/repository');

  fs.promises.writeFile(
      './dist/' + plugin.name + '/index.php',
      '<?php // Silence is golden')
      .catch((err) => {
        console.error(err.toString());
      });
  
  plugin_core_generator(plugin);
};

module.exports = function(config) {
  setup(config.plugin);
};
