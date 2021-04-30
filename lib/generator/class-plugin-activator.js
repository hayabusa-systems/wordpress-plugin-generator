'use strict';

const fs = require('fs');
const utils = require('../utils.js');

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
class ${upper_plugin_name}_Activator
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
  if (plugin.upload_dir !== undefined) {
    plugin_file_code += '\n';
    plugin_file_code += `        $upload_dir = wp_upload_dir()['basedir'] . '/${plugin.upload_dir}';
      if (!is_dir($upload_dir)) {
          mkdir($upload_dir);
      }
`;
  }
  if (config.schema !== undefined && Array.isArray(config.schema)) {
    plugin_file_code += `
        global $wpdb;
`;

    config.schema.forEach(s => {
      let table_name = '';
      if (plugin.use_wp_prefix) {
        table_name += '$wpdb->prefix . ';
      }
      table_name += '"' + utils.convertPruralForm(s.name) + '"';
      // create table
      plugin_file_code += `
        $table_name = ${table_name};
        $query = <<< EOD
        CREATE TABLE IF NOT EXISTS $table_name (
            id int NOT NULL AUTO_INCREMENT,`;
      s.property.forEach(p => {
        plugin_file_code += '\n' + indent + indent + indent;
        plugin_file_code += p.name + ' ' + p.type;
        if (['CHAR', 'VARCHAR'].includes(p.type.toUpperCase())) {
          plugin_file_code += '(' + p.length + ')';
        }
        if (p.required) {
          plugin_file_code += ' NOT NULL';
        }
        if (p.default) {
          plugin_file_code += ' DEFAULT ';
          if (['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC'].includes(p.type.toUpperCase())) {
            plugin_file_code += p.default;
          } else if (p.default.toUpperCase() == "CURRENT_TIMESTAMP") {
            plugin_file_code += p.default;
          } else {
            plugin_file_code += "'" + p.default + "'";
          }
        }
        plugin_file_code += ",";
      });
      plugin_file_code += `
            PRIMARY KEY(id)
        ) DEFAULT CHARSET=utf8;
EOD;

        maybe_create_table($table_name, $query);`;
      s.property.forEach((p, i) => {
        if (i > 0) {
          plugin_file_code += '\n' + indent + indent;
          plugin_file_code += "maybe_add_column(\n" + indent + indent + indent + "$table_name,\n" + indent + indent + indent +"'" + p.name + "',\n" + indent + indent + indent + "\"ALTER TABLE $table_name ADD COLUMN " + p.name + " " + p.type;
          if (['char', 'varchar'].includes(p.type)) {
            plugin_file_code += '(' + p.length + ')';
          }
          plugin_file_code += "\" .\n" + indent + indent + indent + "\"";
          if (p.required) {
            plugin_file_code += ' NOT NULL';
          }
          if (p.default) {
            plugin_file_code += ' DEFAULT ';
            if (['tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'float', 'double', 'decimal', 'numeric'].includes(p.type)) {
              plugin_file_code += p.default;
            } else {
              plugin_file_code += "'" + p.default + "'";
            }
          }
          plugin_file_code += " AFTER " + s.property[i-1].name + "\"\n" + indent + indent + ");";
        }
      });
      plugin_file_code += '\n';
    });
  }

  plugin_file_code += `
    }

}`;

  fs.promises.writeFile(
      './dist/' + plugin.name + '/includes/class-' + plugin.name + '-activator.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
};


