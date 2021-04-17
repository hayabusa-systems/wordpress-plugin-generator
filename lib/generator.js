'use strict';

const fs = require('fs');

const setup = function(plugin) {
  if (fs.existsSync('./dist')) {
    fs.rmdirSync('./dist', {recursive: true});
  }
  fs.mkdirSync('./dist');
  fs.mkdirSync('./dist/' + plugin.name);
  fs.mkdirSync('./dist/' + plugin.name + '/entity');
  fs.mkdirSync('./dist/' + plugin.name + '/repository');

  const pluginName = plugin.name;
  const pluginUri = plugin.uri !== undefined ? plugin.uri : '';
  const pluginDescription =
    plugin.description !== undefined ? plugin.description : '';
  const pluginVersion = plugin.version !== undefined ? plugin.version : '';
  const pluginRequiresAtLeast =
    plugin.requires_at_least !== undefined ? plugin.requires_at_least : '';
  const pluginRequiresPhp =
    plugin.requires_php !== undefined ? plugin.requires_php : '';
  const pluginAuthor = plugin.author !== undefined ? plugin.author : '';
  const pluginAuthorUri =
    plugin.author_uri !== undefined ? plugin.author_uri : '';
  const pluginLicense = plugin.license !== undefined ? plugin.license : '';
  const pluginLicenseUri =
    plugin.license_uri !== undefined ? plugin.license_uri : '';
  const pluginTextDomain =
    plugin.text_domain !== undefined ? plugin.text_domain : '';
  const pluginDomainPath =
    plugin.domain_path !== undefined ? plugin.domain_path : '';
  let pluginFileCode = `<?php
/**
 * Plugin Name:       ${pluginName}`;
  pluginFileCode += '\n';
  if (pluginUri) {
    pluginFileCode += ' * Plugin URI:        ' + pluginUri + '\n';
  }
  if (pluginDescription) {
    pluginFileCode += ' * Description:       ' + pluginDescription + '\n';
  }
  if (pluginVersion) {
    pluginFileCode += ' * Version:           ' + pluginVersion + '\n';
  }
  if (pluginRequiresAtLeast) {
    pluginFileCode += ' * Requires at least: ' + pluginRequiresAtLeast + '\n';
  }
  if (pluginRequiresPhp) {
    pluginFileCode += ' * Requires PHP:      ' + pluginRequiresPhp + '\n';
  }
  if (pluginAuthor) {
    pluginFileCode += ' * Author:            ' + pluginAuthor + '\n';
  }
  if (pluginAuthorUri) {
    pluginFileCode += ' * Author URI:        ' + pluginAuthorUri + '\n';
  }
  if (pluginLicense) {
    pluginFileCode += ' * License:           ' + pluginLicense + '\n';
  }
  if (pluginLicenseUri) {
    pluginFileCode += ' * License URI:       ' + pluginLicenseUri + '\n';
  }
  if (pluginTextDomain) {
    pluginFileCode += ' * Text Domain:       ' + pluginTextDomain + '\n';
  }
  if (pluginDomainPath) {
    pluginFileCode += ' * Domain Path:       ' + pluginDomainPath + '\n';
  }
  pluginFileCode += ' */';
  fs.promises.writeFile(
      './dist/' + plugin.name + '/' + plugin.name + '.php',
      pluginFileCode)
      .catch((err) => {
        console.error(err.toString());
      });
};

module.exports = function(config) {
  setup(config.plugin);
};