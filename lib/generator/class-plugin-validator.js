'use strict'

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
 * @subpackage ${plugin_name}/includes/validator
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */

namespace Plugin\\${upper_plugin_name}\\Validator;

use const \\Plugin\\${upper_plugin_name}\\REGEX_KANA_PATTERN;
use const \\Plugin\\${upper_plugin_name}\\REGEX_HIRAGANA_PATTERN;
use const \\Plugin\\${upper_plugin_name}\\REGEX_MAIL_PATTERN;
use const \\Plugin\\${upper_plugin_name}\\REGEX_PHONE_PATTERN;
use const \\Plugin\\${upper_plugin_name}\\REGEX_URL_PATTERN;
use const \\Plugin\\${upper_plugin_name}\\REGEX_ZIPCODE_PATTERN;

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
class ${upper_schema_name}_Validator
{
    /**
     * Validate entity.
     *
     * @param $entity object
     *
     * @return array
     *
     * @since 1.0.0
     */
    public static function validate($entity): array
    {
        $errors = [];
        if (get_class($entity) != 'Plugin\\${upper_plugin_name}\\Entity\\${upper_schema_name}') {
            $errors['general'][] = '?????????????????????????????????????????????????????????';
            return $errors;
        }
`;
    s.property.forEach(p => {
      const label = (p.form !== undefined && p.form.label !== undefined) ? p.form.label : p.name;
      if (p.required && (p.form && (p.form.required === undefined || p.form.required))) {
        plugin_file_code += '\n' + indent.repeat(2);
        if (['int', 'float'].includes(utils.convertPhpType(p.type))) {
          plugin_file_code += 'if (!isset($entity->' + p.name + ')) {';
        } else {
          plugin_file_code += 'if (empty($entity->' + p.name + ')) {';
        }
        plugin_file_code += `
            $errors['${p.name}'][] = '${label}????????????????????????';
        }
`
      }
      if (p.form) {
        if (p.form.rule) {
          const rule = p.form.rule;
          if (rule.maxlength !== undefined) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && mb_strlen($entity->${p.name}) > ${rule.maxlength}) {
            $errors['${p.name}'][] = '${label}?????????${rule.maxlength}?????????????????????????????????????????????';
        }
`
          }
          if (rule.min !== undefined) {
            plugin_file_code += `
        if (isset($entity->${p.name}) && $entity->${p.name} < ${rule.min}) {
            $errors['${p.name}'][] = '${label}???${rule.min}?????????????????????????????????????????????';
        }
`
          }
          if (rule.max !== undefined) {
            plugin_file_code += `
        if (isset($entity->${p.name}) && $entity->${p.name} < ${rule.max}) {
            $errors['${p.name}'][] = '${label}???${rule.max}?????????????????????????????????????????????';
        }
`
          }
          if (rule.kana) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && preg_match(REGEX_KANA_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}???????????????????????????????????????????????????????????????????????????';
        }
`
          }
          if (rule.hiragana) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && preg_match(REGEX_HIRAGANA_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}???????????????????????????????????????????????????????????????????????????';
        }
`
          }
          if (rule.mailaddress) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && preg_match(REGEX_MAIL_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}????????????????????????????????????????????????????????????????????????????????????';
        }
`
          }
          if (rule.phone) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && preg_match(REGEX_PHONE_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}????????????????????????????????? ??????????????????????????????????????????';
        }
`
          }
          if (rule.url) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && preg_match(REGEX_URL_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}????????????????????????????????? URL??????????????????????????????';
        }
`
          }
          if (rule.zipcode) {
            plugin_file_code += `
        if (!empty($entity->${p.name}) && preg_match(REGEX_ZIPCODE_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}????????????????????????????????? ????????????(??????7??????????????????3???-??????4???)??????????????????????????????';
        }
`
          }
        }
      }
    });
    if (s.embeded) {
      plugin_file_code += '\n';
      s.embeded.forEach(e => {
        let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
        let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
        plugin_file_code += indent.repeat(2) + `if (!empty($entity->${property_name})) {
            foreach ($entity->${property_name} as $i => $child) {
                $child_errors = \\Plugin\\${plugin_name}\\Validator\\${upper_embeded_name}_Validator::validate($child);
                if (!empty($child_errors)) {
                    if (!array_key_exists('${property_name}', $errors)) {
                        $errors['${property_name}'] = array();
                    }
                    $errors['${property_name}'][] = $child_errors;
                }
            }
        }
`
      });
    }
    plugin_file_code += indent.repeat(2) + `return $errors;
    }
}
`

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/validator/' + s.name + '-validator.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};

