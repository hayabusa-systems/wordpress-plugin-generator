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
namespace Plugin\\${upper_plugin_name}\\Repository;

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
class Base_Repository
{
    /**
     * Table_name is database's table name.
     *
     * @var string $table_name
     */
    protected $table_name;
    /**
     * Class_name is entity's name.
     *
     * @var string $class_name
     */
    protected $class_name;

    /**
     * Save is execute insert or update query
     *
     * @param object $entity save's entity
     *
     * @return object
     * @since  1.0.0
     */
    public function save($entity)
    {
        global $wpdb;
        include_once ABSPATH.'wp-admin/includes/upgrade.php';
        $wpdb->query("BEGIN");
        if (empty($entity->id)) {
            $value_property = "(";
            $condition = "(";
            $conditions = [];
            foreach (get_object_vars($entity) as $k => $v) {
                if ($k == 'id') {
                    continue;
                }
                $value_property .= $k. ",";
                if (get_class($v) == 'DateTime') {
                    $condition .= "%s,";
                    $conditions[] = $v->format("Y-m-d H:i:s");
                } else {
                    switch (gettype($v)) {
                    case "boolean":
                        $condition .= ($v ? "true" : "false"). ",";
                        break;
                    case "integer":
                        $condition .= "%d,";
                        $conditions[] = $v;
                        break;
                    case "double":
                        $condition .= "%f,";
                        $conditions[] = $v;
                        break;
                    case "string":
                        $condition .= "%s,";
                        $conditions[] = $v;
                        break;
                    default:
                        break;
                    }
                }
            }
            $value_property = substr($value_property, 0, -1);
            $condition = substr($condition, 0, -1);
            $value_property .= ")";
            $condition .= ")";
            $query = $wpdb->prepare(
                "INSERT INTO $this->table_name $value_property VALUES $condition;",
                $conditions
            );
            $result = $wpdb->query($query);
            if ($result === false) {
                $wpdb->query('ROLLBACK');
                return null;
            }
            $entity->id = $wpdb->insert_id;
        } else {
            $condition = "";
            $conditions = [];
            $value_property = "";
            foreach (get_object_vars($entity) as $k => $v) {
                if ($k == 'id') {
                    continue;
                }
                $value_property .= $k.",";
                if (get_class($v) == 'DateTime') {
                    $condition .= $k."=%s,";
                    $conditions[] = $v->format("Y-m-d H:i:s");
                } else {
                    switch (gettype($v)) {
                    case "boolean":
                        $condition .= ($v ? "true" : "false"). ",";
                        break;
                    case "integer":
                        $condition .= $k."=%d,";
                        $conditions[] = $v;
                        break;
                    case "double":
                        $condition .= $k."=%f,";
                        $conditions[] = $v;
                        break;
                    case "string":
                        $condition .= $k."=%s,";
                        $conditions[] = $v;
                        break;
                    default:
                        break;
                    }
                }
            }
            $value_property = substr($value_property, 0, -1);
            $condition = substr($condition, 0, -1);
            $query = $wpdb->prepare(
                "UPDATE $this->table_name SET $condition WHERE id = $entity->id;",
                $conditions
            );
            $result = $wpdb->query($query);
            if ($result === false) {
                $wpdb->query('ROLLBACK');
                return null;
            }
        }
        $wpdb->query("COMMIT");
        return true;
    }

    /**
     * FindById is getting data from the id
     *
     * @param int $id entity's id
     *
     * @return object
     * @since  1.0.0
     */
    public function findById(int $id)
    {
        global $wpdb;
        include_once ABSPATH.'wp-admin/includes/upgrade.php';
        $query = $wpdb->prepare(
            "SELECT * FROM $this->table_name WHERE id = %d",
            $id
        );
        $row = $wpdb->get_row($query);
        $obj = null;
        if ($row) {
            $obj = new $this->class_name();
            $obj->cast($row);
        }
        return $obj;
    }

    /**
     * FindAll is getting data from the database
     *
     * @return array
     * @since  1.0.0
     */
    public function findAll()
    {
        global $wpdb;
        include_once ABSPATH.'wp-admin/includes/upgrade.php';
        $query = "SELECT * FROM $this->table_name";
        $result = $wpdb->get_results($query);
        $list = array();
        foreach ($result as $row) {
            $obj = new $this->class_name();
            $obj->cast($row);
            $list[] = $obj;
        }
        return $list;
    }

    /**
     * Remove is execute delete query
     *
     * @param int $id entity's id
     *
     * @return bool
     * @since  1.0.0
     */
    public function remove(int $id): bool
    {
        global $wpdb;
        include_once ABSPATH.'wp-admin/includes/upgrade.php';
        $query = $wpdb->prepare(
            "DELETE FROM $this->table_name where id = %d",
            $id
        );
        $wpdb->query("BEGIN");
        $result = $wpdb->query($query);
        if ($result === false) {
            $wpdb->query("ROLLBACK");
            return false;
        }
        $wpdb->query("COMMIT");
        return true;
    }
}
`;
  fs.promises.writeFile(
      './dist/' + plugin.name + '/includes/repository/base-repository.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });
  config.schema.forEach(s => {
    let upper_schema_name = s.name[0].toUpperCase() + s.name.slice(1);
    let table_name = '';
    if (plugin.use_wp_prefix) {
      table_name += '$wpdb->prefix . ';
    }
    table_name += '"' + utils.convertPruralForm(s.name) + '"';
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
namespace Plugin\\${upper_plugin_name}\\Repository;
require_once plugin_dir_path(__FILE__) . 'base-repository.php';

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
class ${upper_schema_name}_Repository extends Base_Repository
{
    /**
     * Constructor
     *
     * @since 1.0.0
     */
    public function __construct()
    {
        global $wpdb;
        include_once ABSPATH.'wp-admin/includes/upgrade.php';
        $this->table_name = ${table_name};
        $this->class_name = "Plugin\\${upper_plugin_name}\\Entity\\${upper_schema_name}";
    }
}
`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/repository/' + s.name + '-repository.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};
