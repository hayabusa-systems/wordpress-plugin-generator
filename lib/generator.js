'use strict';

const fs = require('fs');
const plugin_core_generator = require('./generator/class-plugin-core.js');
const plugin_name_generator = require('./generator/class-plugin-name.js');
const plugin_loader_generator = require('./generator/class-plugin-loader.js');
const plugin_i18n_generator = require('./generator/class-plugin-i18n.js');
const plugin_deactivator_generator = require('./generator/class-plugin-deactivator.js');

const setup = function(config) {
  let plugin = config.plugin;
  if (fs.existsSync('./dist')) {
    fs.rmdirSync('./dist', {recursive: true});
  }
  fs.mkdirSync('./dist');
  fs.mkdirSync('./dist/' + plugin.name);
  fs.mkdirSync('./dist/' + plugin.name + '/includes');
  fs.mkdirSync('./dist/' + plugin.name + '/includes/entity');
  fs.mkdirSync('./dist/' + plugin.name + '/includes/repository');

  fs.promises.writeFile(
      './dist/' + plugin.name + '/index.php',
      '<?php // Silence is golden')
      .catch((err) => {
        console.error(err.toString());
      });

  fs.promises.writeFile(
      './dist/' + plugin.name + '/includes/index.php',
      '<?php // Silence is golden')
      .catch((err) => {
        console.error(err.toString());
      });
  
  plugin_core_generator(plugin);
  plugin_name_generator(plugin);
  plugin_loader_generator(plugin);
  plugin_i18n_generator(plugin);
  plugin_deactivator_generator(plugin);
};

module.exports = function(config) {
  setup(config);
};
