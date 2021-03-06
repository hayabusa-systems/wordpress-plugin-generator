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
  if (plugin.approval) {
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

namespace Plugin\\${upper_plugin_name}\\Entity;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/approval
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class Approval
{
`;
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'int '
    }
    plugin_file_code += '$id;\n';
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'int '
    }
    plugin_file_code += '$target_id;\n';
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'int '
    }
    plugin_file_code += '$status_id;\n';
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'string '
    }
    plugin_file_code += '$class_name;\n';
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'string '
    }
    plugin_file_code += '$content;\n';
    plugin_file_code += indent + 'public ';
    if (plugin_requires_php >= '7.4.0') {
      plugin_file_code += 'string '
    }
    plugin_file_code += '$message;';
    plugin_file_code += `

    /**
     * Cast from db result value.
     *
     * @param $obj object
     *
     * @since 1.0.0
     */
    public function cast($obj)
    {
        $this->id = property_exists($obj, 'id') ? $obj->id : $this->id;
        $this->target_id = property_exists($obj, 'target_id') ? $obj->target_id : $this->target_id;
        $this->status_id = property_exists($obj, 'status_id') ? $obj->status_id : $this->status_id;
        $this->class_name = property_exists($obj, 'class_name') ? $obj->class_name : $this->class_name;
        $this->content = property_exists($obj, 'content') ? $obj->content : $this->content;
        $this->message = property_exists($obj, 'message') ? $obj->message : $this->message;
    }
}
`;
    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/entity/approval.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });

    let table_name = '';
    if (plugin.use_wp_prefix) {
      table_name += '$wpdb->prefix . ';
    }
    table_name += '"' + plugin.name.toLowerCase() + '_approvals"';
    plugin_file_code = `<?php

/**
 * Fired during plugin deactivation
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/repository
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
 * @subpackage ${plugin_name}/includes/repository
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class Approval_Repository extends Base_Repository
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
        $this->class_name = "Plugin\\${upper_plugin_name}\\Entity\\Approval";
        $this->column_name[] = 'id';
        $this->column_name[] = 'target_id';
        $this->column_name[] = 'status_id';
        $this->column_name[] = 'class_name';
        $this->column_name[] = 'content';
        $this->column_name[] = 'message';
    }
}
`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/repository/approval-repository.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });

    plugin_file_code = `<?php

/**
 * Fired during plugin deactivation
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/approval
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */

namespace Plugin\\${upper_plugin_name}\\Approval;

use \\Plugin\\${upper_plugin_name}\\Entity\\Approval;
use \\Plugin\\${upper_plugin_name}\\Repository\\Approval_Repository;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_APPROVAL;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_REJECT;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_CANCEL;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/approval
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class Approval_Request
{
    /**
     * Request
     * 
     * @param $entity object
     * 
     * @since 1.0.0
     */
    public static function request($entity, $is_update = false)
    {
        $approval = new Approval();
        $approval->target_id = $entity->id;
        $approval->status_id = ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST;
        $approval->class_name = get_class($entity);
        if ($is_update) {
            $approval->content = serialize($entity);
        }
        $repository = new Approval_Repository();
        
        Approval_Request::cancel($entity);
        return $repository->save($approval) != null;
    }

    /**
     * Cancel
     * 
     * @param $entity object
     * 
     * @since 1.0.0
     */
    public static function cancel($entity)
    {
        $repository = new Approval_Repository();
        
        $approvals = $repository->findBy(
            array('condition' => 
                array(
                    'target_id' => $entity->id, 
                    'status_id' => ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST, 
                    'class_name' => get_class($entity)
            ))
        );
        if (!empty($approvals)) {
            foreach ($approvals as $a) {
                $a->status_id = ${all_upper_plugin_name}_APPROVAL_STATUS_CANCEL;
                $repository->save($a);
            }
        }
        return;
    }

    /**
     * Approve
     * 
     * @param $id int approval_id
     * @param $message string approve message
     * 
     * @return bool
     * 
     * @since 1.0.0
     */
    public static function approve($id, $message): bool
    {
        $repository = new Approval_Repository();
        $approval = $repository->findById($id);
        if (!$approval || $approval->status_id != ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST) {
            return false;
        }
        $approval->status_id = ${all_upper_plugin_name}_APPROVAL_STATUS_APPROVAL;
        $approval->message = $message;
        if ($repository->save($approval) != null) {
            if (!empty($approval->content)) {
                $obj = unserialize($approval->content);
                // ToDo ?????????
                $obj->status_id = 1;
                $repository_name = "\\Plugin\\${upper_plugin_name}\\Repository" . substr($approval->class_name, strrpos($approval->class_name, '\\\\')) . "_Repository";
                $entity_repository = new $repository_name();
                return $entity_repository->save($obj) != null;
            } else {
                $repository_name = "\\Plugin\\${upper_plugin_name}\\Repository" . substr($approval->class_name, strrpos($approval->class_name, '\\\\')) . "_Repository";
                $entity_repository = new $repository_name();
                $obj = $entity_repository->findById($approval->target_id);
                $obj->status_id = 1;
                return $entity_repository->save($obj) != null;
            }
        }
        return false;
    }

    /**
     * Reject
     * 
     * @param $id int approval_id
     * @param $message string reject message
     * 
     * @return bool
     * 
     * @since 1.0.0
     */
    public static function reject($id, $message): bool
    {
        $repository = new Approval_Repository();
        $approval = $repository->findById($id);
        if (!$approval || $approval->status_id != ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST) {
            return false;
        }
        $approval->status_id = ${all_upper_plugin_name}_APPROVAL_STATUS_REJECT;
        $approval->message = $message;
        return $repository->save($approval) != null;
    }
}
`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/approval/approval.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });

    plugin_file_code = `<?php

/**
 * Fired during plugin deactivation
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/admin/controller
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */

namespace Plugin\\${upper_plugin_name}\\Admin\\Controller;

use Error;
use \\Plugin\\${upper_plugin_name}\\Approval\\Approval_Request;
use \\Plugin\\${upper_plugin_name}\\Entity\\Approval;
use \\Plugin\\${upper_plugin_name}\\Repository\\Approval_Repository;
`;
    config.schema.forEach(s => {
      let repository_name = "\\Plugin\\" + upper_plugin_name + "\\Repository\\" + s.name[0].toUpperCase() + s.name.slice(1) + "_Repository";
      plugin_file_code += "use " + repository_name + ";\n";
    });
    plugin_file_code += `
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_APPROVAL;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_REJECT;
use const \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_APPROVAL_STATUS_CANCEL;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/admin/controller
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class Approval_Controller
{
    const PLUGIN_ID = '${plugin_name}';
    const CREDENTIAL_ACTION = self::PLUGIN_ID . '-nonce-action';
    const CREDENTIAL_NAME = self::PLUGIN_ID . '-nonce-key';

    protected $repositories;
    protected $approval_map;
    protected $label_map;
    protected $edit_script;

    /**
     * Initialize the class and set its properties.
     *
     * @since 1.0.0
     */
    private function __construct()
    {
        $this->repositories[] = array();
        $this->repositories['approval'] = new Approval_Repository();
`;
    config.schema.forEach(s => {
      let entity_name = s.name[0].toUpperCase() + s.name.slice(1);
      let repository_name = entity_name + "_Repository";
      plugin_file_code += indent.repeat(2) + "$this->repositories['" + entity_name + "'] = new " + repository_name + "();\n"; 
    });
    plugin_file_code += `
        $this->approval_map = array();
`;
    plugin.approval.forEach(a => {
      plugin_file_code += indent.repeat(2) + "$this->approval_map['" + a.class_name + "'] = array('label' => '" + a.label + "', 'column' => '" + a.column + "');\n";
    });

    plugin_file_code += `
        $this->label_map = array();
`;
    config.schema.forEach(s => {
        let label_name = s.name[0].toUpperCase() + s.name.slice(1);
    plugin_file_code += indent.repeat(2) + "$this->label_map['" + label_name + "'] = array();\n";
    plugin_file_code += indent.repeat(2) + "$this->label_map['" + label_name + "']['id'] = 'ID';\n";
    s.property.filter(p => p.form && p.form.label).forEach(p => {
        plugin_file_code += indent.repeat(2) + "$this->label_map['" + label_name + "']['" + p.name + "'] = '" + p.form.label + "';\n";
    });
    if (s.embeded) {
        s.embeded.filter(e => e.form && e.form.label).forEach(e => {
            let jump_name = e.form.object_name[0].toUpperCase() + e.form.object_name.slice(1);
            let embeded_property_name = utils.convertSnakeCase(utils.convertPruralForm(e.name));
            plugin_file_code += indent.repeat(2) + "$this->label_map['" + label_name + "']['" + embeded_property_name + "'] = '" + jump_name + "';\n";
        });
    }
    plugin_file_code += '\n';
    });
    
    plugin_file_code += indent.repeat(2) + `$this->edit_script = <<< EOD
        <script>
        function appendParameters(aElement) {
            let message = document.getElementById('approval_message').value;

            aElement.href = aElement.href + "&approval_message=" + encodeURI(message);
        }
        </script>
EOD;
    }

    /**
     * Singleton pattern.
     *
     * @return object
     *
     * @since 1.0.0
     */
    public static function getInstance()
    {
        static $instance = null;
        if ($instance == null) {
            $instance = new self();
        }
        return $instance;
    }

    /**
     * Check credential for sent form.
     *
     * @return bool
     *
     * @since 1.0.0
     */
    protected function check_credential(): bool
    {
        if (!isset($_POST[self::CREDENTIAL_NAME]) || !\\wp_verify_nonce($_POST[self::CREDENTIAL_NAME], self::CREDENTIAL_ACTION)) {
            return false;
        }
        return true;
    }

    /**
     * Call index page.
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function index()
    {
        echo <<< EOD
        <div class="wrap">
            <h1 class="wp-heading-inline">????????????</h1>
            <hr class="wp-header-end">
            <h2 class="screen-reader-text">????????????</h2>
            <table class="wp-list-table widefat fixed striped posts">
                <thead>
                    <tr>
                        <th scope="col" id="id" class="manage-column column-title column-primary">??????ID</th>
                        <th scope="col" id="type" class="manage-column column-title column-primary">?????????????????????</th>
                        <th scope="col" id="name" class="manage-column column-title column-primary">??????????????????</th>
                    </tr>
                </thead>
EOD;
        $entities = $this->repositories['approval']->findBy(array('condition' => array('status_id' => ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST)));
        if (!empty($entities)) {
            foreach ($entities as $entity) {
                $obj = null;
                if (empty($entity->content)) {
                    $short_class_name = substr($entity->class_name, strrpos($entity->class_name, '\\\\') + 1);
                    $obj = $this->repositories[$short_class_name]->findById($entity->target_id);
                } else {
                    $obj = unserialize($entity->content);
                }
                $label = $this->approval_map[$entity->class_name]['label'];
                $name = $obj->{$this->approval_map[$entity->class_name]['column']};
                echo <<< EOD
                    <tr id="post-6" class-"iedit author-self level-0 post-6 type-post status-publish format-standard hentry category-1 entry">
                        <td class="id column-id" data-colname="id"><a href="./admin.php?page=${upper_plugin_name}_approval_edit&id=$entity->id">$entity->id</a></td>
                        <td class="type column-type" data-colname="type"><a href="./admin.php?page=${upper_plugin_name}_approval_edit&id=$entity->id">$label</a></td>
                        <td class="type column-type" data-colname="type"><a href="./admin.php?page=${upper_plugin_name}_approval_edit&id=$entity->id">$name</a></td>
                    </tr>
EOD;
            }
        }
        echo <<< EOD
                </tbody>
            </table>
        </div>
EOD;
    }

    /**
     * Call edit page.
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function edit()
    {
        $entity = null;
        if (!empty($_GET['id'])) {
            $entity = $this->repositories['approval']->findById($_GET['id']);
        } else if (!empty($_POST['id'])) {
            $entity = $this->repositories['approval']->findById($_POST['id']);
        } else {
            die;
        }
        if ($entity->status_id != ${all_upper_plugin_name}_APPROVAL_STATUS_REQUEST) {
            $this->index();
            die;
        }
        $short_class_name = substr($entity->class_name, strrpos($entity->class_name, '\\\\') + 1);
        $before_entity = $this->repositories[$short_class_name]->findById($entity->target_id);
        $after_entity = null;
        if (!empty($entity->content)) {
            $after_entity = unserialize($entity->content);
        }

        $message = !empty($_GET['approval_message']) ? $_GET['approval_message'] : '';

        if (isset($_GET['action'])) {
            if ($_GET['action'] == 'approval') {
                Approval_Request::approve($entity->id, $message);
                $this->index();
            } else if ($_GET['action'] == 'reject') {
                Approval_Request::reject($entity->id, $message);
                $this->index();
            }
        } else {
            // ToDo: Nesting class's compare.
            if (is_null($after_entity)) {
                $this->_display_register($entity, $before_entity);
            } else {
                $this->_display_update($entity, $before_entity, $after_entity);
            }
        }
    }

    /**
     * Call register approval request.
     * 
     * @param $entity       object Approval's entity
     * @param $after_entity object Registered entity
     * 
     * @return void
     * 
     * @since  1.0.0
     */
    private function _display_register($entity, $after_entity)
    {
        $short_class_name = substr($entity->class_name, strrpos($entity->class_name, '\\\\') + 1);
        $object_name = $this->approval_map[$entity->class_name]['label'];
        $current_page_url = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        echo <<< EOD
		<div class="wrap">
			<h1 id="approval">$object_name ????????????</h1>
			<p>?????????????????????????????????????????????</p>
			<table class="form-table" role="presentation">
				<tbody>
EOD;
        foreach ($this->label_map[$short_class_name] as $property => $label) {
            $this->_display_register_row($after_entity, $property, $label);
        }
        echo <<< EOD
                        <tr class="form-field">
                        <th scope="row">
                            <label>?????????????????????</label>
                        </th>
                        <td>
                            <textarea id="approval_message" name="approval_message" rows="5"></textarea>
                        </td>
                    </tr>
                </tbody>
            </table>
            <a class="button button-primary" href="$current_page_url&action=approval" onClick="appendParameters(this)">????????????</a>
            <a class="button delete" href="$current_page_url&action=reject" onClick="appendParameters(this)">????????????</a>
        </div>
EOD;
        echo $this->edit_script;
    }

    private function _display_register_row($after_entity, $property, $label)
    {
        if (array_key_exists($label, $this->label_map)) {
            if (is_array($after_entity->{$property})) {
                foreach ($after_entity->{$property} as $a) {
                    foreach ($this->label_map[$label] as $child_property => $child_label) {
                        $this->_display_register_row($a, $child_property, $child_label);
                    }
                }
            } else {
                foreach ($this->label_map[$label] as $child_property => $child_label) {
                    $this->_display_register_row($after_entity->{$property}, $child_property, $child_label);
                }
            }
        } else {
            $display_value = nl2br($this->_convert_value($after_entity->{$property}, get_class($after_entity), $property));
            echo <<< EOD
                <tr class="form-field">
                    <th scope="row">
                        <label>$label</label>
                    </th>
                    <td>
                        $display_value
                    </td>
                </tr>
EOD;
        }
    }

    /**
     * Call update approval request.
     * 
     * @param $entity        object Approval's entity
     * @param $before_entity object Already registered entity
     * @param $after_entity  object Update entity
     * 
     * @return void
     * 
     * @since  1.0.0
     */
    private function _display_update($entity, $before_entity, $after_entity)
    {
        $short_class_name = substr($entity->class_name, strrpos($entity->class_name, '\\\\') + 1);
        $object_name = $this->approval_map[$entity->class_name]['label'];
        $current_page_url = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        echo <<< EOD
		<div class="wrap">
			<h1 id="approval">$object_name ????????????</h1>
			<p>?????????????????????????????????????????????</p>
			<table class="form-table" role="presentation">
				<tbody>
                    <tr class="form-field">
                        <th scope="row"></th>
                        <td>?????????</td>
                        <td>?????????</td>
                    </tr>
EOD;
        foreach ($this->label_map[$short_class_name] as $property => $label) {
            $this->_display_update_row($before_entity, $after_entity, $property, $label);
        }
        echo <<< EOD
                        <tr class="form-field">
                        <th scope="row">
                            <label>?????????????????????</label>
                        </th>
                        <td colspan="2">
                            <textarea id="approval_message" name="approval_message" rows="5"></textarea>
                        </td>
                    </tr>
                </tbody>
            </table>
            <a class="button button-primary" href="$current_page_url&action=approval" onClick="appendParameters(this)">????????????</a>
            <a class="button delete" href="$current_page_url&action=reject" onClick="appendParameters(this)">????????????</a>
        </div>
EOD;
        echo $this->edit_script;
    }

    private function _display_update_row($before_entity, $after_entity, $property, $label)
    {
        if ($before_entity != null && $after_entity != null && array_key_exists($label, $this->label_map)) {
            if (is_array($after_entity->{$property})) {
                if (count($after_entity->{$property}) > count($before_entity->{$property})) {
                    $ai = 0;
                    foreach ($after_entity->{$property} as $a) {
                        $ai++;
                        $bi = 0;
                        foreach ($before_entity->{$property} as $b) {
                            $bi++;
                            if ($ai == $bi) {
                                foreach ($this->label_map[$label] as $child_property => $child_label) {
                                    $this->_display_update_row($b, $a, $child_property, $child_label);
                                }
                            }
                        }
                        if ($ai > $bi) {
                            foreach ($this->label_map[$label] as $child_property => $child_label) {
                                $this->_display_update_row(null, $a, $child_property, $child_label);
                            }
                        }
                    }
                } else {
                    $bi = 0;
                    foreach ($before_entity->{$property} as $b) {
                        $bi++;
                        $ai = 0;
                        foreach ($after_entity->{$property} as $a) {
                            $ai++;
                            if ($ai == $bi) {
                                foreach ($this->label_map[$label] as $child_property => $child_label) {
                                    $this->_display_update_row($b, $a, $child_property, $child_label);
                                }
                            }
                        }
                        if ($ai < $bi) {
                            foreach ($this->label_map[$label] as $child_property => $child_label) {
                                $this->_display_update_row($b, null, $child_property, $child_label);
                            }
                        }
                    }
                }
            } else {
                foreach ($this->label_map[$label] as $child_property => $child_label) {
                    $this->_display_update_row($before_entity->{$property}, $after_entity->{$property}, $child_property, $child_label);
                }
            }
        } else {
            $before_display_value = nl2br($before_entity ? $this->_convert_value($before_entity->{$property}, get_class($before_entity), $property) : '');
            $after_display_value = nl2br($after_entity ? $this->_convert_value($after_entity->{$property}, get_class($after_entity), $property) : '');
            echo <<< EOD
                        <tr class="form-field">
                            <th scope="row">
                                <label>$label</label>
                            </th>
                            <td>
                                $before_display_value
                            </td>
                            <td>
                                $after_display_value
                            </td>
                        </tr>
EOD;
        }
    }
    
    private function _convert_value($value, $class, $property)
    {
        if (preg_match('/.(jpg|jpeg|png|gif)$/', $value) > 0) {
            return '<img src="' . wp_upload_dir()['baseurl'] . $value . '">';
        }
        return $value;
    }
}
`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/admin/controller/class-approval-controller.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  }
};
