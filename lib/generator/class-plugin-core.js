'use strict';

const fs = require('fs');

module.exports = function(plugin) {
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
  const pluginLink = pluginAuthorUri ? pluginAuthorUri : 'https://ja.wordpress.org/plugins/';
  const pluginLicense = plugin.license !== undefined ? plugin.license : '';
  const pluginLicenseUri =
    plugin.license_uri !== undefined ? plugin.license_uri : '';
  const pluginTextDomain =
    plugin.text_domain !== undefined ? plugin.text_domain : '';
  const pluginDomainPath =
    plugin.domain_path !== undefined ? plugin.domain_path : '';
  let pluginFileCode = `<?php
/**
 * ${pluginName}のメインファイルです。
 *
 * PHP Version >= ${pluginRequiresPhp}
 *
 * Plugin Name:       ${pluginName}`;
  pluginFileCode += '\n';
  if (pluginUri) {
    pluginFileCode += ' * Plugin URI:        ' + pluginUri + '\n';
  }
  if (pluginDescription) {
    pluginFileCode += ' * Description:       ' + pluginDescription + '\n';
  }
  pluginFileCode += ' * Version:           ' + pluginVersion + '\n';
  if (pluginRequiresAtLeast) {
    pluginFileCode += ' * Requires at least: ' + pluginRequiresAtLeast + '\n';
  }
  pluginFileCode += ' * Requires PHP:      ' + pluginRequiresPhp + '\n';
  pluginFileCode += ' * Author:            ' + pluginAuthor + '\n';
  if (pluginAuthorUri) {
    pluginFileCode += ' * Author URI:        ' + pluginAuthorUri + '\n';
  }
  pluginFileCode += ' * License:           ' + pluginLicense + '\n';
  if (pluginLicenseUri) {
    pluginFileCode += ' * License URI:       ' + pluginLicenseUri + '\n';
  }
  if (pluginTextDomain) {
    pluginFileCode += ' * Text Domain:       ' + pluginTextDomain + '\n';
  }
  if (pluginDomainPath) {
    pluginFileCode += ' * Domain Path:       ' + pluginDomainPath + '\n';
  }
  let upperPluginName = pluginName[0].toUpperCase() + pluginName.slice(1);
  let allUpperPluginName = pluginName.toUpperCase();
  let allLowerPluginName = pluginName.toLowerCase();
  pluginFileCode += ` *
 * @category WordpressPlugin
 * @package  ${pluginName}
 * @author   ${pluginAuthor}
 * @license  ${pluginLicense} License
 * @link     ${pluginLink}
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
define('${allUpperPluginName}_VERSION', '${pluginVersion}');

/**
 * Plugin activation.
 *
 * The code that runs during plugin activation.
 * This action is documented in includes/class-${pluginName}-activator.php
 *
 * @return void
 */
function Activate_${allLowerPluginName}() {
    include_once plugin_dir_path(__FILE__) .
        'includes/class-${pluginName}-activator.php';
    \\Plugin\\${upperPluginName}\\Activator::activate();
}
register_activation_hook(__FILE__, 'Activate_${allLowerPluginName}');

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
function Run_${allLowerPluginName}() {

    $plugin = new ${upperPluginName}();
    $plugin->run();

}
Run_${allLowerPluginName}();`;
  fs.promises.writeFile(
      './dist/' + plugin.name + '/' + plugin.name + '.php',
      pluginFileCode)
      .catch((err) => {
        console.error(err.toString());
      });
};