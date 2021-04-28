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

require_once plugin_dir_path(__FILE__) . '../../includes/repository/${schema_title}-repository.php';
require_once plugin_dir_path(__FILE__) . '../../includes/entity/${schema_title}.php';

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

    /**
     * Initialize the class and set its properties.
     *
     * @since 1.0.0
     */
    public function __construct()
    {
        $this->nonce_field = wp_nonce_field(self::CREDENTIAL_ACTION, self::CREDENTIAL_NAME);
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
        $repository = new ${upper_schema_title}_Repository();
        $entities = $repository->findAll();
        if (!empty($entities)) {
            foreach ($entities as $entity) {
                echo <<< EOD
                        <tr id="post-6" class-"iedit author-self level-0 post-6 type-post status-publish format-standard hentry category-1 entry">
                            <td class="id column-id" data-colname="id">$entity->id</td>
    `;
          s['admin']['list']['column'].forEach(c => {
              plugin_file_code += indent.repeat(6) + '<td class="' + c['key'] + ' column-' + c['key'] + '" data-colname="' + c['key'] + '">$entity->' + c['key'] + '</td>\n';
          });
          plugin_file_code += `                    </tr>
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
        $entity = new ${upper_schema_title}();
        $mode = 'new';
        if (!empty($_GET['id'])) {
            $repository = new ${upper_schema_title}_Repository();
            $entity = $repository->findById($_GET['id']);
            $mode = 'edit';
        }
        if (!empty($_POST['mode'])) {
            if ($_POST['mode'] == 'new') {
                echo <<< EOD
                <div class="notice notice-success settings-success is-dismissible">
                  <p>${title}の作成に成功しました。</p>
                  <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">この通知を非表示にする</span>
                  </button>
                </div>
                EOD;
            } else if ($_POST['mode'] == 'edit') {
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
        echo <<< EOD
            <div class="wrap">
                <h1 id="edit-${schema_title}">${title}編集</h1>
                <form method="post" id="${plugin_name}_${schema_title}_edit" enctype="multipart/form-data">
                $this->nonce_field
                    <input type="hidden" name="mode" value="$mode" />
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
              plugin_file_code += indent.repeat(2) + 'EOD;\n';
              if (p.form.loaded) {
                  plugin_file_code += `
        if (strpos('${p.form.loaded}', 'wp_user') == 0) {
            $user_query = new \\WP_User_Query(array('orderby' => 'ID'));
            if (!empty($user_query->results)) {
                foreach ($user_query->results as $user) {
                    echo '<option value="' . $user->ID . '"';
                    if ($entity->${p.name} == $user->ID) {
                        echo ' selected';
                    }
                    echo '>' . $user->display_name . '</option>\n';
                }
            }
        } else {`;
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
        }
`;
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
              <div id="preview${drag_drop_zone}"></div>
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
            plugin_file_code += indent.repeat(8) + '<input type="number" name="' + form_name + '" id="' + form_name + '" value="$entity->' + p.name + '"';
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
            plugin_file_code += '>$entity->' + p.name + '</textarea>';
          } else {
            plugin_file_code += indent.repeat(8) + '<input type="text" name="' + form_name + '" id="' + form_name + '" value="$entity->' + p.name + '"';
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
              plugin_file_code += ' pattern="[\w\-._]+@[\w\-._]+\.[A-Za-z]+"';
            }
            if (p.form.rule && p.form.rule.phone) {
              plugin_file_code += ' pattern="^0\d{2,3}-?\d{1,4}-?\d{4}$"';
            }
            if (p.form.rule && p.form.rule.url) {
              plugin_file_code += ' pattern="https?:\/\/[-_.!~*()a-zA-Z0-9;\/?:@&=+$%#纊-黑亜-熙ぁ-んァ-ヶ]+"';
            }
            if (p.form.rule && p.form.rule.zipcode) {
              plugin_file_code += ' pattern="^\d{3}-?\d{4}$"';
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

