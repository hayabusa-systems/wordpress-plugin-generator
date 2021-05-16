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
    public $table_name;
    /**
     * Class_name is entity's name.
     *
     * @var string $class_name
     */
    public $class_name;
    /**
     * Column_name in table.
     *
     * @var array $column_name
     */
    public $column_name;
    /**
     * Join repository class map.
     *
     * @var array $join_repository_map
     */
    public $join_repository_map;

    public function __construct()
    {
        $this->column_name = array();
        $this->join_repository_map = array();
    }

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
        $wpdb->query("BEGIN");
        if (empty($entity->id)) {
            $value_property = "(";
            $condition = "(";
            $conditions = [];
            foreach (get_object_vars($entity) as $k => $v) {
                if ($k == 'id') {
                    continue;
                }
                if (!is_a($v, 'DateTime') && is_object($v)) {
                    continue;
                }
                if (is_array($v)) {
                    continue;
                }
                $value_property .= $k. ",";
                if (is_a($v, 'DateTime')) {
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
                        $condition .= "'',";
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
                if (!is_a($v, 'DateTime') && is_object($v)) {
                    continue;
                }
                if (is_array($v)) {
                    continue;
                }
                $value_property .= $k.",";
                if (is_a($v, 'DateTime')) {
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
        return $entity;
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
        $query = "SELECT ";
        foreach ($this->column_name as $c) {
            $query .= $this->table_name . "." . $c . ",";
        }
        $query = $query.substr(0, -1);
        $query .= " FROM $this->table_name WHERE id = %d";
        $query = $wpdb->prepare(
            $query,
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
     * FindBy is getting data from the specified condition
     *
     * @param array $condition where condition
     *
     * @return array
     * @since  1.0.0
     */
    public function findBy(array $option)
    {
        global $wpdb;
        $query = "";
        if (!empty($option['join'])) {
            $query = "SELECT $this->table_name.*, ";
            foreach ($option['join'] as $join) {
                $table_name = $join['table'];
                if (strpos($table_name, $wpdb->prefix) != false) {
                    $table_name = str_replace($wpdb->prefix, "", $table_name);
                }
                $repository_class = $this->join_repository_map[$join['table']];
                $repository = new $repository_class();
                foreach ($repository->column_name as $c) {
                    $query .= $join['table'] . "." . $c . " as _" . $join['table'] . "_" . $c . ", ";
                }
            }
            $query = substr($query, 0, -2) . ' ';
            $query .= "FROM $this->table_name ";
            foreach ($option['join'] as $join) {
                $query .= $join['type'] . " JOIN " . $join['table'] . " ON " . $this->table_name . "." . $join['foreign_key'] . " = " . $join['table'] . ".id ";
            }
        } else {
            $query = "SELECT ";
            foreach ($this->column_name as $c) {
                $query .= $this->table_name . "." . $c . ",";
            }
            $query = $query.substr(0, -1);
            $query .= " FROM $this->table_name";
        }
        $values = [];
        if (!empty($option['condition'])) {
            $query .= " WHERE ";
            foreach ($option['condition'] as $key => $cond) {
                switch(gettype($cond)) {
                case 'integer':
                    $query .= $this->table_name . '.' . $key . " = %d";
                    $values[] = $cond;
                    break;
                case 'string':
                    $query .= $this->table_name . '.' . $key . " = %s";
                    $values[] = $cond;
                    break;
                case 'array':
                    $v = explode(",", $cond);
                    if (gettype($cond[0]) == 'integer') {
                        $ds = implode(',', array_fill(0, count($values), '%d'));
                    } else {
                        $ds = implode(',', array_fill(0, count($values), '%s'));
                    }
                    $query .= $this->table_name . '.' . "$key in ($ds)";
                    $values[] = $v;
                    break;
                }
                $query .= " AND ";
            }
            $query = substr($query, 0, -5);
        }
        if (!empty($values)) {
            $query = $wpdb->prepare(
                "$query",
                $values
            );
        }
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
     * FindAll is getting data from the database
     *
     * @return array
     * @since  1.0.0
     */
    public function findAll()
    {
        global $wpdb;
        $query = "SELECT ";
        foreach ($this->column_name as $c) {
            $query .= $this->table_name . "." . $c . ",";
        }
        $query = $query.substr(0, -1);
        $query .= " FROM $this->table_name";
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
        $this->table_name = ${table_name};
        $this->class_name = "Plugin\\${upper_plugin_name}\\Entity\\${upper_schema_name}";
        $this->column_name[] = 'id';
`;
    s.property.forEach(p => {
        plugin_file_code += indent.repeat(2) + '$this->column_name[] = "' + p.name + '";\n';
    });
    s.property.filter(p => p.loaded).forEach(p => {
        let child_table_name = '';
        if (plugin.use_wp_prefix) {
            child_table_name += '$wpdb->prefix . ';
        }
        child_table_name += '"' + utils.convertPruralForm(p.loaded) + '"';
        plugin_file_code += indent.repeat(2) + '$this->join_repository_map[' + child_table_name + '] = "\\Plugin\\' + plugin_name + "\\Repository\\" + p.loaded[0] + p.loaded.slice(1) + '_Repository";';
    });
    plugin_file_code += `
    }

    private function _loaded($entity)
    {`;
    let child_name = s.name;
    let children_name = utils.convertPruralForm(s.name);
    if (s.embeded) {
        s.embeded.forEach(e => {
            const loaded_name = e.name[0].toUpperCase() + e.name.slice(1);
            const children = utils.convertSnakeCase(utils.convertPruralForm(e.name));
            plugin_file_code += `
        if (empty($entity->${children})) {
            $repository = new \\Plugin\\${plugin_name}\\Repository\\${loaded_name}_Repository();
            $entity->${children} = $repository->findBy(array('condition' => array('${e.foreign_key}', $entity->id)));
            if (property_exists($entity->${children}, '${child_name}')) {
                if (is_array($entity->${children}->${child_name})) {
                    $entity->${children}->${child_name}[] = $entity;
                } else {
                    $entity->${children}->${child_name} = $entity;
                }
            } else if (property_exists($entity->${children}, '${children_name}')) {
                if (is_array($entity->${children}->${children_name})) {
                    $entity->${children}->${children_name}[] = $entity;
                } else {
                    $entity->${children}->${children_name} = $entity;
                }
            }
        }
        `;
        });

    }
    plugin_file_code += `
        return $entity;
    }
`;
    if (s.embeded) {
        plugin_file_code += `
    /**
     * Override save.
     *
     * @param object $entity save's entity
     *
     * @since 1.0.0
     */
    public function save($entity)
    {
        $entity = parent::save($entity);
        if (!$entity) {
            return null;
        }
`;
        s.embeded.forEach(e => {
            let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
            let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
            plugin_file_code += `
        $repository = new \\Plugin\\${plugin_name}\\Repository\\${upper_embeded_name}_Repository();`;
            if (e.update_type && e.update_type == "drop_insert") {
                plugin_file_code += `
        $drop_data = $repository->findBy(array('condition' => array('${e.foreign_key}' => (int)$entity->id)));
        foreach ($drop_data as $d) {
            $repository->remove($d->id);
        }`;
            }
            plugin_file_code += `
        foreach ($entity->${property_name} as $child) {
            $child->${e.foreign_key} = (int)$entity->id;
            if (!$repository->save($child)) {
                return null;
            }
        }`;
        });
        plugin_file_code += `
        return $entity;
    }
`;
    }

    plugin_file_code += `
    /**
     * Override FindById
     *
     * @param int $id entity's id
     *
     * @return object
     */
    public function findById(int $id)
    {
`;
    if (plugin.use_wp_prefix) {
        plugin_file_code += indent.repeat(2) + 'global $wpdb;\n';
    }
    if (s.property.filter(p => p.loaded).length != 0) {
        plugin_file_code += indent.repeat(2) + '$option = array();\n'
        plugin_file_code += indent.repeat(2) + '$option["join"] = array();\n';
        s.property.filter(p => p.loaded).forEach(p => {
            let table_name = '';
            if (plugin.use_wp_prefix) {
                table_name += '$wpdb->prefix . ';
            }
            table_name += '"' + utils.convertPruralForm(p.loaded) + '";\n';
            plugin_file_code += indent.repeat(2) + '$table_name = ' + table_name + ';\n';
            plugin_file_code += indent.repeat(2) + '$option["join"][] = array("table" => $table_name, "type" => "inner", "foreign_key" => "' + p.name + '");\n';
        });
        plugin_file_code += `
        $option['condition'] = array('id' => $id);
        $entity = parent::findBy($option);
        if (!empty($entity)) {
            $entity = $entity[0];
        }
`;
    } else {
        plugin_file_code += `
            $entity = parent::findById($id);
`;
    }
    if (s.embeded) {
        s.embeded.forEach(e => {
            let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
            let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
            plugin_file_code += `
        $repository = new \\Plugin\\${plugin_name}\\Repository\\${upper_embeded_name}_Repository();`;
            plugin_file_code += `
        $entity->${property_name} = $repository->findBy(array('condition' => array('${e.foreign_key}' => (int)$entity->id)));
        `;
        });
    }
    plugin_file_code += `
        return $entity;
    }

    /**
     * Override FindBy
     *
     * @param array $option join, where, order condition
     *
     * @return array
     * @since  1.0.0
     */
    public function findBy(array $option)
    {
`;
    if (plugin.use_wp_prefix) {
        plugin_file_code += indent.repeat(2) + 'global $wpdb;\n';
    }
    if (s.property.filter(p => p.loaded).length != 0) {
        plugin_file_code += indent.repeat(2) + '$option["join"] = array();\n';
        s.property.filter(p => p.loaded).forEach(p => {
            let table_name = '';
            if (plugin.use_wp_prefix) {
                table_name += '$wpdb->prefix . ';
            }
            table_name += '"' + utils.convertPruralForm(p.loaded) + '";\n';
            plugin_file_code += indent.repeat(2) + '$table_name = ' + table_name + '\n';
            plugin_file_code += indent.repeat(2) + '$option["join"][] = array("table" => $table_name, "type" => "inner", "foreign_key" => "' + p.name + '");\n';
        });
    }
    plugin_file_code += `
        $entities = parent::findBy($option);
        foreach ($entities as $entity) {
            $entity = $this->_loaded($entity);
        }
`;
    if (s.embeded) {
        s.embeded.forEach(e => {
            let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
            let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
            plugin_file_code += `
        $repository = new \\Plugin\\${plugin_name}\\Repository\\${upper_embeded_name}_Repository();`;
            plugin_file_code += `
        foreach ($entities as $entity) {
            $entity->${property_name} = $repository->findBy(array('condition' => array('${e.foreign_key}' => (int)$entity->id)));
        }`;
        });
    }
    plugin_file_code += `
        return $entities;
    }

    /**
     * Override FindAll
     *
     * @return array
     * @since  1.0.0
     */
    public function findAll()
    {
`;
    if (plugin.use_wp_prefix) {
        plugin_file_code += indent.repeat(2) + 'global $wpdb;\n';
    }
    if (s.property.filter(p => p.loaded).length != 0) {
        plugin_file_code += indent.repeat(2) + '$option = array();\n'
        plugin_file_code += indent.repeat(2) + '$option["join"] = array();\n';
        s.property.filter(p => p.loaded).forEach(p => {
            let table_name = '';
            if (plugin.use_wp_prefix) {
                plugin_file_code += indent.repeat(2) + 'global $wpdb;\n';
                table_name += '$wpdb->prefix . ';
            }
            table_name += '"' + utils.convertPruralForm(p.loaded) + '"';
            plugin_file_code += indent.repeat(2) + "$table_name = " + table_name + ';\n';
            plugin_file_code += indent.repeat(2) + '$option["join"][] = array("table" => $table_name, "type" => "inner", "foreign_key" => "' + p.name + '");\n';
        });
        plugin_file_code += `
        $entities = parent::findBy($option);
`;
    } else {
        plugin_file_code += `
            $entities = parent::findAll();
`;
    }
    plugin_file_code += `
        foreach ($entities as $entity) {
            $entity = $this->_loaded($entity);
        }
`;
    if (s.embeded) {
        s.embeded.forEach(e => {
            let upper_embeded_name = e.name[0].toUpperCase() + e.name.slice(1);
            let property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
            plugin_file_code += `
        $repository = new \\Plugin\\${plugin_name}\\Repository\\${upper_embeded_name}_Repository();`;
            plugin_file_code += `
        foreach ($entities as $entity) {
            $entity->${property_name} = $repository->findBy(array('condition' => array('${e.foreign_key}' => (int)$entity->id)));
        }`;
        });
    }
    plugin_file_code += `
        return $entities;
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
