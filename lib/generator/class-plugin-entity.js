'use strict';

const fs = require('fs');
const utils = require('../utils.js');

module.exports = function(config) {
  const indent = '    ';
  const plugin = config.plugin;
  const plugin_name = plugin.name;
  const plugin_author = plugin.author !== undefined ? plugin.author : '';
  const plugin_author_uri =
    plugin.author_uri !== undefined ? plugin.author_uri : '';
  const plugin_link = plugin_author_uri ? plugin_author_uri : 'https://ja.wordpress.org/plugins/';
  const plugin_license = plugin.license !== undefined ? plugin.license : '';
  const plugin_requires_php =
    plugin.requires_php !== undefined ? plugin.requires_php : '';
  const upper_plugin_name = plugin_name[0].toUpperCase() + plugin_name.slice(1);
  const all_upper_plugin_name = plugin_name.toUpperCase();
  config.schema.forEach(s => {
    let upper_schema_name = s.name[0].toUpperCase() + s.name.slice(1);
    let plugin_file_code = `<?php
/**
 * Fired during plugin deactivation
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/entity
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Entity;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class ${upper_schema_name}
{
`;
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'int'
    }
    plugin_file_code += '$id;\n';
    s.property.forEach(p => {
      plugin_file_code += indent + 'public ';
      if (plugin_requires_php >= '7.4.0') {
        if (p.required === undefined || !p.required) {
          plugin_file_code += '?';
        }
        plugin_file_code += utils.convertPhpType(p.type);
      }
      plugin_file_code += '$' + utils.convertSnakeCase(p.name);
      if (p.default !== undefined) {
        plugin_file_code += ' = ';
        if (['int','float'].includes(utils.convertPhpType(p.type))) {
          plugin_file_code += p.default;
        } else {
          plugin_file_code += '"' + p.default + '"';
        }
      }
      plugin_file_code += ';\n';
    });
    plugin_file_code += '}';

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/entity/' + s.name + '.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};