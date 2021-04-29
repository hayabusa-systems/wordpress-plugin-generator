'use strict';

const { storeOptionsAsProperties } = require('commander');
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
  const is_display_menu = config.schema.filter(s => s["admin"] && s['admin']['show']).length > 0;
  let plugin_file_code = `<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/admin
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Admin;

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
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
class ${upper_plugin_name}_Admin
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
`;
    plugin_file_code += indent.repeat(2) + "\\add_action('admin_menu', array($this, 'menu'));\n";
    plugin_file_code += `
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function enqueue_styles()
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
            plugin_dir_url(__FILE__) . 'css/plugin-name-admin.css',
            array(),
            $this->_version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function enqueue_scripts()
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
            plugin_dir_url(__FILE__) . 'js/plugin-name-admin.js',
            array('jquery'),
            $this->_version,
            false
        );
    }
`;
  if (is_display_menu) {
    const menu_title = (config.plugin.admin && config.plugin.admin.menu) ? config.plugin.admin.menu.title : '';
    plugin_file_code += `

    /**
     * Display Menu
     *
     * @return void
     *
     * @since 1.0.0
     */
    public function menu()
    {
        \\add_menu_page(
            '${menu_title}',
            '${menu_title}',
            'administrator',
            '${plugin_name}',
            array($this, 'dashboard'),
            ''
        );
`;
`
    }
`
    config.schema.filter(v => v["admin"]).forEach(v => {
      const title = v['admin']['title'] ? v['admin']['title'] : '';
      const schema_title = v['name'];
      const upper_schema_title = v['name'][0].toUpperCase() + v['name'].slice(1);
      plugin_file_code += `
        include_once plugin_dir_path(__FILE__) . 'controller/class-${schema_title}-controller.php';
        \\add_submenu_page(
            '${plugin_name}',
            '${menu_title}',
            '${title}一覧',
            'administrator',
            '${plugin_name}_${schema_title}_index',
            array(Controller\\${upper_schema_title}_Controller::getInstance(), 'index')
        );

        \\add_submenu_page(
            '${plugin_name}',
            '${menu_title}',
            '${title}編集',
            'administrator',
            '${plugin_name}_${schema_title}_edit',
            array(Controller\\${upper_schema_title}_Controller::getInstance(), 'edit')
        );
`;
    });
  }
  plugin_file_code += indent + '}\n}';
  fs.promises.writeFile(
      './dist/' + plugin.name + '/admin/class-' + plugin.name + '-admin.php',
      plugin_file_code)
      .catch((err) => {
        console.error(err.toString());
      });

  config.schema.filter(s => s["admin"]).forEach(s => {
    const title = s['admin']['title'] ? s['admin']['title'] : '';
    const schema_title = s['name'];
    const upper_schema_title = s['name'][0].toUpperCase() + s['name'].slice(1);
    plugin_file_code = `<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/admin
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Admin\\Controller;
use \\Plugin\\${upper_plugin_name}\\Repository\\${upper_schema_title}_Repository;
use \\Plugin\\${upper_plugin_name}\\Entity\\${upper_schema_title};
use \\Plugin\\${upper_plugin_name}\\Validator\\${upper_schema_title}_Validator;
use \\Plugin\\${upper_plugin_name}\\Form\\${upper_schema_title}_Form;

require_once plugin_dir_path(__FILE__) . '../../includes/repository/${schema_title}-repository.php';
require_once plugin_dir_path(__FILE__) . '../../includes/entity/${schema_title}.php';
require_once plugin_dir_path(__FILE__) . '../../includes/validator/${schema_title}-validator.php';
require_once plugin_dir_path(__FILE__) . '../../includes/form/${schema_title}-form.php';

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
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
class ${upper_schema_title}_Controller
{
    const PLUGIN_ID = '${plugin_name}';
    const CREDENTIAL_ACTION = self::PLUGIN_ID.'-nonce-action';
    const CREDENTIAL_NAME = self::PLUGIN_ID.'-nonce-key';

    protected $repository;

    /**
     * Initialize the class and set its properties.
     *
     * @since 1.0.0
     */
    public function __construct()
    {
        $this->repository = new ${upper_schema_title}_Repository();
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
    protected function check_credential(): bool {
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
            <h1 class="wp-heading-inline">${title}</h1>
            <a href="./admin.php?page=${plugin_name}_${schema_title}_edit" class="page-title-action">新規追加</a>
            <hr class="wp-header-end">
            <h2 class="screen-reader-text">${title}一覧</h2>
            <table class="wp-list-table widefat fixed striped posts">
                <thead>
                    <tr>
                        <th scope="col" id="id" class="manage-column column-title column-primary">${title}ID</th>
`;
      s['admin']['list']['column'].forEach(c => {
          plugin_file_code += indent.repeat(6) + '<th scope="col" id="' + c["key"] + '" class="manage-column column-title column-primary">' + c['label'] + '</th>\n';
      });
      plugin_file_code += `                    </tr>
                </thead>
                <tbody id="the-list">
EOD;
        $entities = $this->repository->findAll();
        if (!empty($entities)) {
            foreach ($entities as $entity) {
                $display_values = [];
`;
      s.admin.list.column.forEach(c => {
          if (s.property.filter(p => p.name == c.key).length == 0) {
            return;
          }
          let convertConditions = s.property.filter(p => p.name == c.key)[0].form;
          if (convertConditions.loaded) {
            if (convertConditions.loaded == 'wp_user') {
              plugin_file_code += `
                $user_query = new \\WP_User_Query(array('ID' => $entity->${c.key}));
                if (!empty($user_query->results)) {
                    $display_values['${c.key}'] = $user_query->results[0]->display_name;
                }
`;
            } else {
              let repository_name = convertConditions.loaded[0].toUpperCase() + convertConditions.loaded.slice(1) + '_Repository';
              plugin_file_code += `
                $repository = new ${repository_name}();
                $load_entity = $repository->findById($entity->id);
                $display_values['${c.key}'] = $load_entity ? $load_entity->${c.key} : '';
`;
            }
          } else if (convertConditions.const) {
                plugin_file_code += `
                include_once plugin_dir_path(__FILE__) . '../../${plugin_name}-const.php';
                $display_values['${c.key}'] = \\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_${convertConditions.const}[$entity->${c.key}];
`;
          } else {
            plugin_file_code += indent.repeat(4) + '$display_values["' + c.key + '"] = $entity->' + c.key + ';\n';
          }
      });
      plugin_file_code += `
                echo <<< EOD
                        <tr id="post-6" class-"iedit author-self level-0 post-6 type-post status-publish format-standard hentry category-1 entry">
                            <td class="id column-id" data-colname="id"><a href="./admin.php?page=${upper_plugin_name}_${s.name}_edit&id=$entity->id">$entity->id</a></td>
EOD;
`;
      s.admin.list.column.forEach(c => {
          plugin_file_code += indent.repeat(4) + "echo '<td class=\"" + c.key + "\" column-" + c.key + " data-colname=\"" + c.key + "\">';\n";
          if (c.link) {
            plugin_file_code += indent.repeat(4) + "echo '<a href=\"./admin.php?page=" + upper_plugin_name + "_" + s.name + "_edit&id=' . $entity->id . '\">';\n";
          }
          plugin_file_code += indent.repeat(4) + 'echo $display_values["' + c.key + '"];\n';
          if (c.link) {
            plugin_file_code += indent.repeat(4) + "echo '</a>';\n";
          }
          plugin_file_code += indent.repeat(4) + "echo '</td>';\n";
      });
          plugin_file_code += `
                echo '                    </tr>';
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
        $mode = 'new';
        if (!empty($_GET['id'])) {
            $entity = $this->repository->findById($_GET['id']);
            $mode = 'edit';
        } else if (!empty($_POST['id'])) {
            $entity = $this->repository->findById($_POST['id']);
            $mode = 'edit';
        }
        if (isset($_POST['mode'])) {
            $entity = ${upper_schema_title}_Form::convertToEntity($_POST);
        } else if (!$entity) {
            $entity = new ${upper_schema_title}();
        }
        print_r($entity);
        $errors = [];
        if (isset($_POST['mode'])) {
            $errors = ${upper_schema_title}_Validator::validate($entity);
            if (!$this->check_credential()) {
                $errors['general'][] = '不正なアクセスです。';
            }
            if ($_POST['mode'] == 'new' && empty($errors) && $this->repository->save($entity)) {
                echo <<< EOD
                <div class="notice notice-success settings-success is-dismissible">
                  <p>${title}の作成に成功しました。</p>
                  <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">この通知を非表示にする</span>
                  </button>
                </div>
EOD;
            } else if ($_POST['mode'] == 'edit' && empty($errors) && $this->repository->save($entity)) {
                echo <<< EOD
                <div class="notice notice-success settings-success is-dismissible">
                  <p>${title}の更新に成功しました。</p>
                  <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">この通知を非表示にする</span>
                  </button>
                </div>
EOD;
            }
        }
        if (!empty($errors)) {
            echo '<div class="notice notice-error settings-error is-dismissible">';
            foreach ($errors as $error) {
                foreach ($error as $message) {
                    echo '<p>'.esc_html($message).'</p>';
                }
            }
            echo <<< EOD
              <button type="button" class="notice-dismiss">
                <span class="screen-reader-text">この通知を非表示にする</span>
              </button>
            </div>
EOD;
        }
        $form_action = './admin.php?page=${plugin_name}_${schema_title}_edit';
        if (!empty($entity->id)) {
            $form_action .= '&id=' . $entity->id;
        }
        $upload_base_url = \\wp_upload_dir()['baseurl'];
        echo <<< EOD
            <div class="wrap">
                <h1 id="edit-${schema_title}">${title}編集</h1>
                <form method="post" action="$form_action" id="${plugin_name}_${schema_title}_edit" enctype="multipart/form-data">
EOD;
        \\wp_nonce_field(self::CREDENTIAL_ACTION, self::CREDENTIAL_NAME);
        echo <<< EOD
                    <input type="hidden" name="mode" value="$mode" />
                    <input type="hidden" name="id" value="$entity->id" />
                    <table class="form-table" role="presentation">
`;
        let drag_drop_zone = 0;
        s.property.forEach(p => {
          plugin_file_code += indent.repeat(6) + '<tr class="form-field';
          if (p.required) {
            plugin_file_code += ' form-required';
          }
          const label_name = (p.form && p.form.label) ? p.form.label : p.name;
          const form_name = (p.form && p.form.name) ? p.form.name : p.name;
          plugin_file_code += '">\n' + indent.repeat(7) + '<th scope="row">\n';
          plugin_file_code += indent.repeat(8) + '<label for="' + p.name + '">' + label_name + '</label>\n' + indent.repeat(7) + '</th>\n' + indent.repeat(7) + '<td>\n';
          if (p.form && p.form.type) {
            if (p.form.type == "select") {
              plugin_file_code += indent.repeat(8) + '<select name="' + form_name + '" id="' + form_name + '">\n';
              plugin_file_code += 'EOD;\n';
              if (p.form.loaded) {
                if (p.form.loaded == 'wp_user') {
                  plugin_file_code += `
        $user_query = new \\WP_User_Query(array('orderby' => 'ID'));
        if (!empty($user_query->results)) {
            foreach ($user_query->results as $user) {
                echo '<option value="' . $user->ID . '"';
                if ($entity->${p.name} == $user->ID) {
                    echo ' selected';
                }
                echo '>' . $user->display_name . '</option>\n';
            }
        }`;
                } else {
                  let repository_name = s.name[0].toUpperCase() + s.name.slice(1) + '_Repository';
                  let var_name = utils.convertPruralForm(p.name);
                  plugin_file_code += `
            $repository = new ${repository_name}();
            $${var_name} = $repository->findAll();
            foreach ($${var_name} as $e) {
                echo '<option value="' . $e->id . '"';
                if ($e->id == $entity->${s.name}) {
                    echo ' selected';
                }
                echo '>' . $e->${p.column} . '</option>';
            }
`;
                }
              } else if (p.form.const) {
                plugin_file_code += `
        include_once plugin_dir_path(__FILE__) . '../../${plugin_name}-const.php';
        foreach (\\Plugin\\${upper_plugin_name}\\${all_upper_plugin_name}_${p.form.const} as $i => $v) {
            echo '<option value="' . $i . '"';
            if ($entity->${p.name} == $i) {
                echo ' selected';
            }
            echo '>' . $v . '</option>\n';
        }
`;
              }
              plugin_file_code += indent.repeat(2) + 'echo <<< EOD\n';
              plugin_file_code += indent.repeat(8) + '</select>\n';

            } else if (p.form.type == "file") {
              drag_drop_zone++;
              let file_form_name = form_name + '_file';
              const accept = p.form.accept ? p.form.accept : "";
              plugin_file_code += `
              <div id="drop-zone${drag_drop_zone}" style="border: 1px solid; padding: 30px;">
                <p>ファイルをドラッグ＆ドロップもしくは</p>
                <input type="file" name="${file_form_name}" id="${file_form_name}" accept="${accept}">
              </div>
              <input type="hidden" name="${form_name}" value="$entity->${p.name}" />
              <div id="preview${drag_drop_zone}">
EOD;
        $img_url${drag_drop_zone} = empty($entity->${p.name}) ? "" : $upload_base_url . $entity->${p.name};
        if (!empty($img_url${drag_drop_zone})) {
            echo <<< EOD
                <img src="$img_url${drag_drop_zone}" />
EOD;
        }
        echo <<< EOD
              </div>
              <script>
              var dropZone${drag_drop_zone} = document.getElementById('drop-zone${drag_drop_zone}');
              var fileInput${drag_drop_zone} = document.getElementById('${file_form_name}');

              dropZone${drag_drop_zone}.addEventListener('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
                this.style.background = '#e1e7f0';
              }, false);

              dropZone${drag_drop_zone}.addEventListener('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();
                this.style.background = '#ffffff';
              }, false);

              fileInput${drag_drop_zone}.addEventListener('change', function() {
                previewFile('preview${drag_drop_zone}', this.files[0]);
              });

              dropZone${drag_drop_zone}.addEventListener('drop', function(e) {
                e.stopPropagation();
                e.preventDefault();
                this.style.background = '#ffffff';
                let files = e.dataTransfer.files;
                if (files.length > 1) {
                  return alert('アップロードできるファイルは1つだけです。');
                }
                fileInput${drag_drop_zone}.files = files;
                previewFile('preview${drag_drop_zone}', files[0]);
              });
              </script>
`
            }
          } else if (['int', 'float'].includes(utils.convertPhpType(p.type))) {
            plugin_file_code += indent.repeat(8) + '<input type="number" name="' + form_name + '" id="' + form_name + '" value="{$entity->' + p.name + '}"';
            if (p.required) {
              plugin_file_code += ' required aria-required="true"';
            }
            if (utils.convertPhpType(p.type) == 'float') {
              plugin_file_code += ' step="0.01"'
            }
            plugin_file_code += ' />\n';

          } else if (utils.convertPhpType(p.type) == 'DateTime') {
          } else if (['TEXT', 'BLOB'].includes(p.type.toUpperCase())) {
            plugin_file_code += indent.repeat(8) + '<textarea name="' + form_name + '"';
            if (p.required) {
              plugin_file_code += ' required aria-required="true"';
            }
            if (p.form.rule && p.form.rule.min) {
              plugin_file_code += ' min="' + p.form.rule.min + '"';
            }
            if (p.form.rule && p.form.rule.max) {
              plugin_file_code += ' max="' + p.form.rule.max + '"';
            }
            plugin_file_code += '>{$entity->' + p.name + '}</textarea>';
          } else {
            plugin_file_code += indent.repeat(8) + '<input type="text" name="' + form_name + '" id="' + form_name + '" value="{$entity->' + p.name + '}"';
            if (p.required) {
              plugin_file_code += ' required aria-required="true"';
            }
            if (p.form.rule && p.form.rule.maxlength) {
              plugin_file_code += ' maxlength="' + p.form.rule.maxlength + '"';
            }
            if (p.form.rule && p.form.rule.kana) {
              plugin_file_code += ' pattern="^[ァ-ヶ][ァ-ヶー 　]*$"';
            }
            if (p.form.rule && p.form.rule.mailaddress) {
              plugin_file_code += ' pattern="[\\w\\-._]+@[\\w\\-._]+\\.[A-Za-z]+"';
            }
            if (p.form.rule && p.form.rule.phone) {
              plugin_file_code += ' pattern="^0\\d{2,3}-?\\d{1,4}-?\\d{4}$"';
            }
            if (p.form.rule && p.form.rule.url) {
              plugin_file_code += ' pattern="https?:\\/\\/[-_.!~*()a-zA-Z0-9;\\/?:@&=+$%#纊-黑亜-熙ぁ-んァ-ヶ]+"';
            }
            if (p.form.rule && p.form.rule.zipcode) {
              plugin_file_code += ' pattern="^\\d{3}-?\\d{4}$"';
            }
            if (p.form.rule && p.form.rule.regex) {
              plugin_file_code += ' pattern="' + p.form.rule.regex + '"';
            }
            plugin_file_code += ' autocapitalize="none" autocorrect="off"';
            plugin_file_code += ' />\n';
          }
          plugin_file_code += indent.repeat(7) + '</td>\n' + indent.repeat(6) + '</tr>\n';
        });
        plugin_file_code += `                    </table>
                  <p class="submit">
                    <input type="submit" name="submit" id="submit" class="button button-primary" value="保存">
                  </p>
                </form>
            </div>
            <script>
            function previewFile(previewId, file) {
              let fr = new FileReader();
              fr.readAsDataURL(file);
              fr.onload = function() {
                var img = document.createElement('img');
                img.setAttribute('src', fr.result);
                var preview = document.getElementById(previewId);
                preview.innerHTML = '';
                preview.appendChild(img);
              }
            }
            </script>
EOD;
    }
}
`;
    fs.promises.writeFile(
        './dist/' + plugin.name + '/admin/controller/class-' + schema_title + '-controller.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};

