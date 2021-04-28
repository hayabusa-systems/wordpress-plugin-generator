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
 * @subpackage ${plugin_name}/includes/validator
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Validator;

include_once plugin_dir_path(dirname(__FILE__)) . '../${plugin_name}-const.php';
use const \\Plugin\\${upper_plugin_name}\\REGEX_KANA_PATTERN;
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
    public static function validate($entity) : array
    {
        $errors = [];
        if (get_class($entity) != '${upper_schema_name}') {
            $errors['general'][] = '予期しないオブジェクトが渡されました。';
            return $errors;
        }
`;
    s.property.forEach(p => {
      const label = (p.form !== undefined && p.form.label !== undefined) ? p.form.label : p.name;
      if (p.required) {
        plugin_file_code += `
        if (empty($entity->${p.name})) {
            $errors['${p.name}'][] = '${label}は入力必須です。';
        }
`
      }
      if (p.form) {
        if (p.form.rule) {
          const rule = p.form.rule;
          if (rule.maxlength !== undefined) {
            plugin_file_code += `
        if (strlen($entity->${p.name}) > ${rule.maxlength}) {
            $errors['${p.name}'][] = '${label}は最大${rule.maxlength}バイトまでしか入力できません。';
        }
`
          }
          if (rule.min !== undefined) {
            plugin_file_code += `
        if ($entity->${p.name} < ${rule.min}) {
            $errors['${p.name}'][] = '${label}は${rule.min}以上の数値を入力してください。';
        }
`
          }
          if (rule.max !== undefined) {
            plugin_file_code += `
        if ($entity->${p.name} < ${rule.max}) {
            $errors['${p.name}'][] = '${label}は${rule.max}以下の数値を入力してください。';
        }
`
          }
          if (rule.kana) {
            plugin_file_code += `
        if (preg_match(REGEX_KANA_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}の入力形式が不正です。カタカナを入力してください。';
        }
`
          }
          if (rule.mailaddress) {
            plugin_file_code += `
        if (preg_match(REGEX_MAIL_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}の入力形式が不正です。メールアドレスを入力してください。';
        }
`
          }
          if (rule.phone) {
            plugin_file_code += `
        if (preg_match(REGEX_PHONE_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}の入力形式が不正です。 電話番号を入力してください。';
        }
`
          }
          if (rule.url) {
            plugin_file_code += `
        if (preg_match(REGEX_URL_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}の入力形式が不正です。 URLを入力してください。';
        }
`
          }
          if (rule.zipcode) {
            plugin_file_code += `
        if (preg_match(REGEX_ZIPCODE_PATTERN, $entity->${p.name}) != 1) {
            $errors['${p.name}'][] = '${label}の入力形式が不正です。 郵便番号(数字7桁または数字3桁-数字4桁)を入力してください。';
        }
`
          }
        }
      }
    });
    plugin_file_code += `
        return $errors;
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

