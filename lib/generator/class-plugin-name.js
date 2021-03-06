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
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * front-facing side of the site and the admin area.
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
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * front-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
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
class ${upper_plugin_name}
{
    /**
     * The loader that's responsible for maintaining and
     * registering all hooks that power
     * the plugin.
     *
     * @access protected
     * @var    ${upper_plugin_name}_Loader
     * $loader Maintains and registers all hooks for the plugin.
     * @since  1.0.0
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     *
     * @access protected
     * @var    string $plugin_name The string used to uniquely identify this plugin.
     * @since  1.0.0
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     *
     * @access protected
     * @var    string $version The current version of the plugin.
     * @since  1.0.0
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     *
     * Set the plugin name and the plugin version
     * that can be used throughout the plugin.
     * Load the dependencies, define the locale,
     * and set the hooks for the admin area and
     * the front-facing side of the site.
     *
     * @since 1.0.0
     */
    public function __construct()
    {
        if (defined('${all_upper_plugin_name}_VERSION')) {
            $this->version = ${all_upper_plugin_name}_VERSION;
        } else {
            $this->version = '1.0.0';
        }
        $this->plugin_name = '${plugin_name}';

        $this->_loadDependencies();
        
        // ??????????????????????????????
        $log = \\Plugin\\ShizuokaDB\\Library\\Log::getInstance();
        $log->open(${all_upper_plugin_name}_LOGPATH);
        $log->setLogLevel(${all_upper_plugin_name}_LOGLEVEL);

        $this->_setLocale();
        $this->_defineAdminHooks();
        $this->_defineFrontHooks();
    }

    /**
     * Load the required dependencies for this plugin.
     *
     * Include the following files that make up the plugin:
     *
     * - ${upper_plugin_name}_Loader. Orchestrates the hooks of the plugin.
     * - ${upper_plugin_name}_I18n. Defines internationalization functionality.
     * - ${upper_plugin_name}_Admin. Defines all hooks for the admin area.
     * - ${upper_plugin_name}_Front. Defines all hooks for the front side of the site.
     *
     * Create an instance of the loader which will be used to register the hooks
     * with WordPress.
     *
     * @access private
     * @return void
     * @since  1.0.0
     */
    private function _loadDependencies()
    {
        /**
         * Wordpress Database helper.
         */
        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        /**
         * Wordpress Install helper.
         */
        include_once ABSPATH . 'wp-admin/install-helper.php';

        /**
         * The class responsible for orchestrating the actions and filters of the
         * core plugin.
         */
        include_once plugin_dir_path(dirname(__FILE__)) .
            'includes/class-${plugin_name}-loader.php';

        /**
         * The class responsible for defining internationalization functionality
         * of the plugin.
         */
        include_once plugin_dir_path(dirname(__FILE__)) .
            'includes/class-${plugin_name}-i18n.php';

        /**
         * The class responsible for defining all actions
         * that occur in the admin area.
         */
        include_once plugin_dir_path(dirname(__FILE__)) .
            'admin/class-${plugin_name}-admin.php';

        /**
         * The class responsible for defining all actions
         * that occur in the front-facing
         * side of the site.
         */
        include_once plugin_dir_path(dirname(__FILE__)) .
            'front/class-${plugin_name}-front.php';

        include_once plugin_dir_path(dirname(__FILE__)) .
            'includes/library/file.php';
        include_once plugin_dir_path(dirname(__FILE__)) .
            'includes/library/log.php';
        include_once plugin_dir_path(dirname(__FILE__)) .
            '${plugin_name}-const.php';
`;
  config.schema.forEach(s => {
    plugin_file_code += `
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/entity/${s.name}.php';
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/repository/${s.name}-repository.php';
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/validator/${s.name}-validator.php';
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/form/${s.name}-form.php';
`;
  });
  config.schema.filter(v => v["admin"]).forEach(v => {
    const schema_title = v['name'];
    plugin_file_code += `
    include_once plugin_dir_path(dirname(__FILE__)) . 'admin/controller/class-${schema_title}-controller.php';
`;
  });

  if (config.plugin.approval) {
    plugin_file_code += `
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/entity/approval.php';
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/repository/approval-repository.php';
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'includes/approval/approval.php';
        include_once plugin_dir_path(dirname(__FILE__)) . 
            'admin/controller/class-approval-controller.php';
`;
  }

  plugin_file_code += `
        $this->loader =
            new \\Plugin\\${upper_plugin_name}\\${upper_plugin_name}_Loader();
    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * Uses the Plugin_Name_I18n class in order to set the domain and to register the hook
     * with WordPress.
     *
     * @access private
     * @return void
     * @since  1.0.0
     */
    private function _setLocale()
    {
        $plugin_i18n =
            new \\Plugin\\${upper_plugin_name}\\${upper_plugin_name}_I18n();

        $this->loader->addAction(
            'plugins_loaded',
            $plugin_i18n,
            'load_plugin_textdomain'
        );
    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @access private
     * @return void
     * @since  1.0.0
     */
    private function _defineAdminHooks()
    {
        $plugin_admin =
            new \\Plugin\\${upper_plugin_name}\\Admin\\${upper_plugin_name}_Admin(
                $this->getPluginName(),
                $this->getVersion()
            );

        $this->loader->addAction(
            'admin_enqueue_scripts',
            $plugin_admin,
            'enqueue_styles'
        );
        $this->loader->addAction(
            'admin_enqueue_scripts',
            $plugin_admin,
            'enqueue_scripts'
        );
    }

    /**
     * Register all of the hooks related to the front-facing functionality
     * of the plugin.
     *
     * @access private
     * @return void
     * @since  1.0.0
     */
    private function _defineFrontHooks()
    {
        $plugin_front =
            new \\Plugin\\${upper_plugin_name}\\Front\\${upper_plugin_name}_Front(
               $this->getPluginName(),
               $this->getVersion()
            );

        $this->loader->addAction('wp_enqueue_scripts', $plugin_front, 'enqueue_styles');
        $this->loader->addAction('wp_enqueue_scripts', $plugin_front, 'enqueue_scripts');
    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     *
     * @return void
     * @since  1.0.0
     */
    public function run()
    {
        $this->loader->run();
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     *
     * @return string    The name of the plugin.
     * @since  1.0.0
     */
    public function getPluginName()
    {
        return $this->plugin_name;
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin.
     *
     * @return ${upper_plugin_name}_Loader    Orchestrates the hooks of the plugin.
     * @since  1.0.0
     */
    public function getLoader()
    {
        return $this->loader;
    }

    /**
     * Retrieve the version number of the plugin.
     *
     * @return string The version number of the plugin.
     * @since  1.0.0
     */
    public function getVersion()
    {
        return $this->version;
    }
}
`;

  fs.promises.writeFile(
      './dist/' + plugin.name + '/includes/class-' + plugin.name + '.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
};
