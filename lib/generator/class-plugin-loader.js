'use strict';

const fs = require('fs');

module.exports = function(plugin) {
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
 * Register all actions and filters for the plugin
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
 * Register all actions and filters for the plugin.
 *
 * Maintain a list of all hooks that are registered throughout
 * the plugin, and register them with the WordPress API. Call the
 * run function to execute the list of actions and filters.
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
class ${upper_plugin_name}_Loader
{

    /**
     * The array of actions registered with WordPress.
     *
     * @access protected
     * @var    array $actions
     * The actions registered with WordPress to fire when the plugin loads.
     * @since  1.0.0
     */
    protected $actions;

    /**
     * The array of filters registered with WordPress.
     *
     * @access protected
     * @var    array $filters
     * The filters registered with WordPress to fire when the plugin loads.
     * @since  1.0.0
     */
    protected $filters;

    /**
     * Initialize the collections used to maintain the actions and filters.
     *
     * @since 1.0.0
     */
    public function __construct()
    {
        $this->actions = array();
        $this->filters = array();

    }

    /**
     * Add a new action to the collection to be registered with WordPress.
     *
     * @param string $hook          The name of the WordPress action
     *                              that is being registered.
     * @param object $component     A reference to the instance of
     *                              the object on which the action is defined.
     * @param string $callback      The name of the function definition
     *                              on the $component.
     * @param int    $priority      Optional. The priority at which
     *                              the function should be fired. Default is 10.
     * @param int    $accepted_args Optional. The number of arguments
     *                              that should be passed to
     *                              the $callback. Default is 1.
     *
     * @return void
     * @since  1.0.0
     */
    public function addAction($hook, $component, $callback,
        $priority = 10, $accepted_args = 1
    ) {
        $this->actions = $this->_add(
            $this->actions,
            $hook,
            $component,
            $callback,
            $priority,
            $accepted_args
        );
    }

    /**
     * Add a new filter to the collection to be registered with WordPress.
     *
     * @param string $hook          The name of the WordPress filter
     *                              that is being registered.
     * @param object $component     A reference to the instance of
     *                              the object on which the filter is defined.
     * @param string $callback      The name of the function definition
     *                              on the $component.
     * @param int    $priority      Optional. The priority at which
     *                              the function should be fired. Default is 10.
     * @param int    $accepted_args Optional. The number of arguments
     *                              that should be passed to the $callback.
     *                              Default is 1
     *
     * @return void
     * @since  1.0.0
     */
    public function addFilter($hook, $component, $callback,
        $priority = 10, $accepted_args = 1
    ) {
        $this->filters = $this->_add(
            $this->filters,
            $hook,
            $component,
            $callback,
            $priority,
            $accepted_args
        );
    }

    /**
     * A utility function that is used to register the actions and
     * hooks into a single collection.
     *
     * @param array  $hooks         The collection of hooks that is
     *                              being registered (that is, actions or filters).
     * @param string $hook          The name of the WordPress filter
     *                              that is being registered.
     * @param object $component     A reference to the instance of
     *                              the object on which the filter is defined.
     * @param string $callback      The name of the function definition
     *                              on the $component.
     * @param int    $priority      The priority at which the function
     *                              should be fired.
     * @param int    $accepted_args The number of arguments that
     *                              should be passed to the $callback.
     *
     * @access private
     * @return array
     * The collection of actions and filters registered with WordPress.
     * @since  1.0.0
     */
    private function _add($hooks, $hook, $component,
        $callback, $priority, $accepted_args
    ) {
        $hooks[] = array(
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args
        );

        return $hooks;

    }

    /**
     * Register the filters and actions with WordPress.
     *
     * @return void
     * @since  1.0.0
     */
    public function run()
    {
        foreach ($this->filters as $hook) {
            add_filter(
                $hook['hook'],
                array($hook['component'],
                $hook['callback']),
                $hook['priority'],
                $hook['accepted_args']
            );
        }

        foreach ($this->actions as $hook) {
            add_action(
                $hook['hook'],
                array($hook['component'],
                $hook['callback']),
                $hook['priority'],
                $hook['accepted_args']
            );
        }

    }

}`;

  fs.promises.writeFile(
      './dist/' + plugin.name + '/includes/class-' + plugin.name + '-loader.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
};

