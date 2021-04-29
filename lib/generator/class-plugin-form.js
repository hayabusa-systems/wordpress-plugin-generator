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
 * @subpackage ${plugin_name}/includes/form
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Form;

include_once plugin_dir_path(dirname(__FILE__)) . 'entity/${s.name}.php';
use \\Plugin\\${upper_plugin_name}\\Entity\\${upper_schema_name};

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/validator
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class ${upper_schema_name}_Form
{
    /**
     * Convert form data to entity
     *
     * @param $form object
     *
     * @return entity
     *
     * @since 1.0.0
     */
    public static function convertToEntity($form) : object
    {
        $entity = new ${upper_schema_name}();`;
    s.property.forEach(p => {
      const form_name = (p.form && p.form.name) ? p.form.name : p.name;
      plugin_file_code += `
        if (isset($form['${form_name}'])) {
            $entity->${p.name} = $form['${form_name}'];
        }`;
    });
    plugin_file_code += `
        return $entity;
    }
}`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/form/' + s.name + '-form.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};


