'use strict';

const fs = require('fs');

module.exports = function(plugin) {
  const plugin_name = plugin.name;
  const plugin_uri = plugin.uri !== undefined ? plugin.uri : '';
  const plugin_description =
    plugin.description !== undefined ? plugin.description : '';
  const plugin_version = plugin.version !== undefined ? plugin.version : '';
  const plugin_requires_at_least =
    plugin.requires_at_least !== undefined ? plugin.requires_at_least : '';
  const plugin_requires_php =
    plugin.requires_php !== undefined ? plugin.requires_php : '';
  const plugin_author = plugin.author !== undefined ? plugin.author : '';
  const plugin_author_uri =
    plugin.author_uri !== undefined ? plugin.author_uri : '';
  const plugin_link = plugin_author_uri ? plugin_author_uri : 'https://ja.wordpress.org/plugins/';
  const plugin_license = plugin.license !== undefined ? plugin.license : '';
  const plugin_license_uri =
    plugin.license_uri !== undefined ? plugin.license_uri : '';
  const plugin_text_domain =
    plugin.text_domain !== undefined ? plugin.text_domain : '';
  const plugin_domain_path =
    plugin.domain_path !== undefined ? plugin.domain_path : '';
  let plugin_file_code = `<?php
/**
 * ${plugin_name}のメインファイルです。
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * Plugin Name:       ${plugin_name}`;
  plugin_file_code += '\n';
  if (plugin_uri) {
    plugin_file_code += ' * Plugin URI:        ' + plugin_uri + '\n';
  }
  if (plugin_description) {
    plugin_file_code += ' * Description:       ' + plugin_description + '\n';
  }
  plugin_file_code += ' * Version:           ' + plugin_version + '\n';
  if (plugin_requires_at_least) {
    plugin_file_code += ' * Requires at least: ' + plugin_requires_at_least + '\n';
  }
  plugin_file_code += ' * Requires PHP:      ' + plugin_requires_php + '\n';
  plugin_file_code += ' * Author:            ' + plugin_author + '\n';
  if (plugin_author_uri) {
    plugin_file_code += ' * Author URI:        ' + plugin_author_uri + '\n';
  }
  plugin_file_code += ' * License:           ' + plugin_license + '\n';
  if (plugin_license_uri) {
    plugin_file_code += ' * License URI:       ' + plugin_license_uri + '\n';
  }
  if (plugin_text_domain) {
    plugin_file_code += ' * Text Domain:       ' + plugin_text_domain + '\n';
  }
  if (plugin_domain_path) {
    plugin_file_code += ' * Domain Path:       ' + plugin_domain_path + '\n';
  }
  let upper_plugin_name = plugin_name[0].toUpperCase() + plugin_name.slice(1);
  let all_upper_plugin_name = plugin_name.toUpperCase();
  let all_lower_plugin_name = plugin_name.toLowerCase();
  plugin_file_code += ` *
 * @category WordpressPlugin
 * @package  ${plugin_name}
 * @author   ${plugin_author}
 * @license  ${plugin_license} License
 * @link     ${plugin_link}
 *
 * @since 1.0.0
 */

// If this file is called directry, abort.
if (!defined('WPINC')) {
    die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define('${all_upper_plugin_name}_VERSION', '${plugin_version}');

/**
 * Plugin activation.
 *
 * The code that runs during plugin activation.
 * This action is documented in includes/class-${plugin_name}-activator.php
 *
 * @return void
 */
function Activate_${all_lower_plugin_name}() {
    include_once plugin_dir_path(__FILE__) .
        'includes/class-${plugin_name}-activator.php';
    \\Plugin\\${upper_plugin_name}\\${upper_plugin_name}_Activator::activate();
}
register_activation_hook(__FILE__, 'Activate_${all_lower_plugin_name}');

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @return void
 * @since  1.0.0
 */
function Run_${all_lower_plugin_name}()
{
    include_once plugin_dir_path(dirname(__FILE__)) .
            '${plugin_name}-${plugin.version}/includes/class-${plugin_name}.php';
    $plugin = new \\Plugin\\${upper_plugin_name}\\${upper_plugin_name}();
    $plugin->run();

}
Run_${all_lower_plugin_name}();`;
  fs.promises.writeFile(
      './dist/' + plugin.name + '/' + plugin.name + '.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });

  plugin_file_code = `<?php
/**
 * ${plugin_name}の定義ファイルです。
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category WordpressPlugin
 * @package  ${plugin_name}
 * @author   ${plugin_author}
 * @license  ${plugin_license} License
 * @link     ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name};

// Regex Pattern
const REGEX_KANA_PATTERN = '/^[ァ-ヶ][ァ-ヶー 　]*$/u';
const REGEX_MAIL_PATTERN = '/[\\w\\-._]+@[\\w\\-._]+\\.[A-Za-z]+/';
const REGEX_PHONE_PATTERN = '/^0\\d{2,3}-?\\d{1,4}-?\\d{4}$/';
const REGEX_URL_PATTERN = '/https?:\\/\\/[-_.!~*()a-zA-Z0-9;\\/?:@&=+$%#纊-黑亜-熙ぁ-んァ-ヶ]+/u';
const REGEX_ZIPCODE_PATTERN = '/^\\d{3}-?\\d{4}$/';
`;
  plugin.const.forEach(v => {
    if (typeof(v['value'][0]) == "string") {
      plugin_file_code += '\nconst ' + all_upper_plugin_name + '_' + v['name'] + ' = ["' +  v['value'].join('","') + '"];';
    } else {
      plugin_file_code += '\nconst ' + all_upper_plugin_name + '_' + v['name'] + ' = array(';
      v['value'].forEach(v2 => {
          plugin_file_code += '"' + v2['value'] + '" => "' + v2['label'] + '",';
      });
      plugin_file_code += ');';
    }
  });
  if (plugin.approval) {
    plugin_file_code += `
const ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST = 1;
const ${all_upper_plugin_name}_APPROVAL_STATUS_APPROVAL = 2;
const ${all_upper_plugin_name}_APPROVAL_STATUS_REJECT = 3;
const ${all_upper_plugin_name}_APPROVAL_STATUS_CANCEL = 4;
const ${all_upper_plugin_name}_APPROVAL_STATUS = array(
    ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST => "申請中",
    ${all_upper_plugin_name}_APPROVAL_STATUS_APPROVAL => "承認",
    ${all_upper_plugin_name}_APPROVAL_STATUS_REJECT => "却下",
    ${all_upper_plugin_name}_APPROVAL_STATUS_CANCEL => "取消"
);`;
  }

  fs.promises.writeFile(
      './dist/' + plugin.name + '/' + plugin.name + '-const.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
};