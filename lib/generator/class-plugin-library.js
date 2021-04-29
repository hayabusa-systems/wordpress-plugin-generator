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
  if (plugin.upload_dir === undefined) {
    return;
  }
  config.schema.forEach(s => {
    let upper_schema_name = s.name[0].toUpperCase() + s.name.slice(1);
    let plugin_file_code = `<?php
/**
 * Fired during plugin deactivation
 *
 * PHP Version >= ${plugin_requires_php}
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/library
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
namespace Plugin\\${upper_plugin_name}\\Library;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @category   WordpressPlugin
 * @package    ${plugin_name}
 * @subpackage ${plugin_name}/includes/library
 * @author     ${plugin_author}
 * @license    ${plugin_license} License
 * @link       ${plugin_link}
 *
 * @since 1.0.0
 */
class File
{
    public static function upload_image_file(string $elm_name): string
    {
      // 画像がアップロードされているかをチェックする。
      $photo_url = 'error';
      if (isset($_FILES[$elm_name]) && is_uploaded_file($_FILES[$elm_name]['tmp_name'])) {
        // ファイルを上書きしないように名前を変える
        $new_name = date('YmdHis');
        $new_name .= mt_rand();
        switch (exif_imagetype($_FILES[$elm_name]['tmp_name'])) {
          case IMAGETYPE_JPEG:
            $new_name .= '.jpg';
            break;
          case IMAGETYPE_GIF:
            $new_name .= '.gif';
            break;
          case IMAGETYPE_PNG:
            $new_name .= '.png';
            break;
          default:
            return $photo_url;
        }

        $upload_dir = wp_upload_dir();
        $upload_path = $upload_dir['basedir'] . '/${plugin.upload_dir}/' . $new_name;
        if (move_uploaded_file($_FILES[$elm_name]['tmp_name'], $upload_path)) {
          $photo_url = '/${plugin.upload_dir}/' . $new_name;
        }
      }
      return $photo_url;
    }
}`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/library/file.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
  });
};



