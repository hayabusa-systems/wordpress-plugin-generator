'use strict';

const fs = require('fs');

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
  let plugin_file_code = `<?php
/**
 * The front-specific functionality of the plugin.
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/front
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Front;

/**
 * The puglic-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the front-specific stylesheet and JavaScript.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/front
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class ${upper_plugin_name}_Front
{
    /**
     * The ID of this plugin.
     *
     * @access private
     * @var    string $plugin_name The ID of this plugin.
     *
     * @since 1.0.0
     */
    private $_plugin_name;

    /**
     * The version of this plugin.
     *
     * @access private
     * @var    string $version The current version of this plugin.
     *
     * @since 1.0.0
     */
    private $_version;

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version     The version of this plugin.
     *
     * @since 1.0.0
     */
    public function __construct($plugin_name, $version)
    {
        $this->_plugin_name = $plugin_name;
        $this->_version = $version;
    }

    /**
     * Register the stylesheets for the front area.
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function enqueueStyles()
    {
        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in Plugin_Name_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The Plugin_Name_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */
        wp_enqueue_style(
            $this->_plugin_name,
            plugin_dir_url(__FILE__) . 'css/plugin-name-front.css',
            array(),
            $this->_version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the front area.
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function enqueueScripts()
    {
        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in Plugin_Name_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The Plugin_Name_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */
        wp_enqueue_script(
            $this->_plugin_name,
            plugin_dir_url(__FILE__) . 'js/plugin-name-front.js',
            array('jquery'),
            $this->_version,
            false
        );
    }
}`;
  fs.promises.writeFile(
      './dist/' + plugin.name + '/front/class-' + plugin.name + '-front.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
};
