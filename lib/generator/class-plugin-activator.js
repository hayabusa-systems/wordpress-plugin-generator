'use strict';

const fs = require('fs');

module.exports = function(config) {
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
  let plugin_file_code = `<?php
/**
 * Fired during plugin activation
 *
 * PHP Version >= ${plugin_requires_php}
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
namespace Plugin\\${upper_plugin_name};

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
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
class Plugin_Name_Activator
{
    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @return void
     * @since  1.0.0
     */
    public static function activate()
    {
`;

  const indent = '    ';
  console.log(config.role);
  if (config.role !== undefined && Array.isArray(config.role)) {
    config.role.forEach(role => {
      let option = '';
      if (role.capabilities !== undefined && Array.isArray(role.capabilities)) {
        option = 'array(';
        role.capabilities.forEach((c, i) => {
          option += i != 0 ? ',' : '';
          option += "'" + c  + "' => true";
        });
        option += ')';
      }
      plugin_file_code += indent + indent + "add_role('" + role.name + "', '" + role.display_name  + "'";
      if (option) {
        plugin_file_code += ", " + option;
      }
      plugin_file_code += ');' + '\n';
    });
  }

  plugin_file_code += `    }

}`;

  fs.promises.writeFile(
      './dist/' + plugin.name + '/includes/class-' + plugin.name + '-activator.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
};


