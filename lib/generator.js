'use strict';

const fs = require('fs');
const archiver = require('archiver');

const plugin_core_generator = require('./generator/class-plugin-core.js');
const plugin_name_generator = require('./generator/class-plugin-name.js');
const plugin_loader_generator = require('./generator/class-plugin-loader.js');
const plugin_i18n_generator = require('./generator/class-plugin-i18n.js');
const plugin_deactivator_generator = require('./generator/class-plugin-deactivator.js');
const plugin_activator_generator = require('./generator/class-plugin-activator.js');
const plugin_entity_generator = require('./generator/class-plugin-entity.js');
const plugin_repository_generator = require('./generator/class-plugin-repository.js');
const plugin_admin_generator = require('./generator/class-plugin-admin.js');
const plugin_front_generator = require('./generator/class-plugin-front.js');
const plugin_validator_generator = require('./generator/class-plugin-validator.js');
const plugin_form_generator = require('./generator/class-plugin-form.js');

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
  fs.mkdirSync('./dist/' + plugin.name + '/includes/validator');
  fs.mkdirSync('./dist/' + plugin.name + '/includes/form');
  fs.mkdirSync('./dist/' + plugin.name + '/admin');
  fs.mkdirSync('./dist/' + plugin.name + '/admin/controller');
  fs.mkdirSync('./dist/' + plugin.name + '/front');

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

  fs.promises.writeFile(
      './dist/' + plugin.name + '/admin/index.php',
      '<?php // Silence is golden')
      .catch((err) => {
        console.error(err.toString());
      });

  fs.promises.writeFile(
      './dist/' + plugin.name + '/front/index.php',
      '<?php // Silence is golden')
      .catch((err) => {
        console.error(err.toString());
      });

  plugin_core_generator(plugin);
  plugin_name_generator(plugin);
  plugin_loader_generator(plugin);
  plugin_i18n_generator(plugin);
  plugin_deactivator_generator(plugin);
  plugin_activator_generator(config);
  plugin_entity_generator(config);
  plugin_repository_generator(config);
  plugin_admin_generator(config);
  plugin_front_generator(config);
  plugin_validator_generator(config);
  plugin_form_generator(config);

  const output = fs.createWriteStream(__dirname + '/../' + plugin.name + '-' + plugin.version + '.zip');
  const archive = archiver('zip', {
    zlib: { level: 9}
  });

  output.on('close', function() {
    console.log('Complete arachive plugin.')
  });

  archive.on('warning', function(err) {
    console.error(err);
    throw err;
  });

  archive.pipe(output);
  archive.directory('dist/' + plugin.name, false);

  archive.finalize();
};

module.exports = function(config) {
  setup(config);
};
