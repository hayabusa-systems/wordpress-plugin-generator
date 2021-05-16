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

use \\Plugin\\${upper_plugin_name}\\Entity\\${upper_schema_name};`;
    if (plugin.upload_dir) {
      plugin_file_code += 
`
use \\Plugin\\${upper_plugin_name}\\Library\\File;
`;
    }
    plugin_file_code += `
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
        $entity = new ${upper_schema_name}();
        if (isset($form['id'])) {
            $entity->id = (int)$form['id'];
        }`;
    s.property.forEach(p => {
      const form_name = (p.form && p.form.name) ? p.form.name : p.name;
      if (p.form && p.form.type == "file") {
        const form_file_name = form_name + "_file";
        plugin_file_code += `
        if (isset($_FILES['${form_file_name}']) && $_FILES['${form_file_name}']['size'] > 0) {
            $entity->${p.name} = File::upload_image_file('${form_file_name}');
        } else {
            if (isset($form['${form_name}'])) {
                $entity->${p.name} = $form['${form_name}'];
            }
        }`;
      } else {
        let cast = utils.convertPhpType(p.type);
        if (cast == 'string' || cast == 'DateTime') {
          cast = '';
        } else {
          cast = '(' + cast + ')';
        }
        plugin_file_code += `
        if (isset($form['${form_name}'])) {
            $entity->${p.name} = ${cast}$form['${form_name}'];
        }`;
      }
    });
    if (s.embeded) {
      s.embeded.forEach(e => {
        const object_name = (e.form && e.form.object_name) ? e.form.object_name : e.name;
        let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
        let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
        // drop insert しか現時点で想定していない。　
        plugin_file_code += `
        $entity->${property_name} = array();
        if (!empty($form['${object_name}'])) {
            `;
        if (e.form && e.form.type == "checkbox") {
          plugin_file_code += `foreach ($form['${object_name}'][0]['${e.form.target}'] as $v) {
                $child = new \\Plugin\\${plugin_name}\\Entity\\${upper_embeded_name}();
                $child->${e.form.target} = $v;
                $entity->${property_name}[] = $child;
          `;
        } else {
          plugin_file_code += `foreach ($form['${object_name}'] as $v) {
                  if (!empty(array_filter($v))) {
                      $entity->${property_name}[] = \\Plugin\\${plugin_name}\\Form\\${upper_embeded_name}_Form::convertToEntity($v);
                  }`;
        }
        plugin_file_code += `
            }
        }`;
      });
    }
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