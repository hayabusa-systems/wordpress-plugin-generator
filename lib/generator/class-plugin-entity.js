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
      if (p.default !== undefined && p.default != 'CURRENT_TIMESTAMP') {
        plugin_file_code += ' = ';
        if (['int','float'].includes(utils.convertPhpType(p.type))) {
          plugin_file_code += p.default;
        } else if (p.default == 'CURRENT_TIMESTAMP') {
          plugin_file_code += 'new \\DateTime()';
        } else {
          plugin_file_code += '"' + p.default + '"';
        }
      }
      plugin_file_code += ';\n';
    });
    if (s.embeded) {
      s.embeded.forEach(e => {
        plugin_file_code += indent + 'public ';
        plugin_file_code += '$' + utils.convertSnakeCase(utils.convertPruralForm(e.name)) + ';\n';
      });
    }
    plugin_file_code += `

    /**
     * Constructor
     *
     * @since 1.0.0
     */
    public function __construct()
    {
`;
    s.property.filter(p => p.default !== undefined && ['CURRENT_TIMESTAMP'].includes(p.default)).forEach(p => {
      plugin_file_code += indent.repeat(2) + '$this->' + utils.convertSnakeCase(p.name) + ' = ';
      if (p.default == 'CURRENT_TIMESTAMP') {
        plugin_file_code += 'new \\DateTime()';
      }
      plugin_file_code += ';\n';
    });
    if (s.embeded) {
      s.embeded.filter(e => e.type && e.type == "children").forEach(e => {
        let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
        let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
        let array_num = e.max - 1;
        plugin_file_code += `
        $this->${property_name} = array();
        foreach (range(0, ${array_num}) as $i) {
            $this->${property_name}[] = new \\Plugin\\${plugin_name}\\Entity\\${upper_embeded_name}();
        }`;
      });
    }

    plugin_file_code += `    }
    /**
     * Fill children object.
     *
     * @since 1.0.0
     */
    public function fill()
    {
`;
    if (s.embeded) {
      s.embeded.filter(e => e.type && e.type == "children").forEach(e => {
        let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
        let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
        plugin_file_code += `
        while (count($this->${property_name}) < ${e.max}) {
            $this->${property_name}[] = new \\Plugin\\${plugin_name}\\Entity\\${upper_embeded_name}();
        }`;
      });
    }

    plugin_file_code += `    }

    /**
     * Cast from db result value.
     *
     * @param $obj object
     *
     * @since 1.0.0
     */
    public function cast($obj)
    {
        $this->id = property_exists($obj, 'id') ? $obj->id : $this->id;`;
    s.property.forEach(p => {
      const property_name = utils.convertSnakeCase(p.name);
      plugin_file_code += `
        $this->${property_name} = property_exists($obj, '${property_name}') ?
           $obj->${property_name} : $this->${property_name};`;
    });
    plugin_file_code += '\n    }\n}';

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/entity/' + s.name + '.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};
