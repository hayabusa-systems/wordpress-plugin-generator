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
  const all_lower_plugin_name = plugin_name.toLowerCase();
  if (plugin.upload_dir === undefined) {
    return;
  }
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
            $upload_dir = wp_upload_dir();

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
                    // HEICの変換が必要な場合は、ここのコメントアウトを外す
                    /* 
                    $imageMagick = new \\Imagick();
                    $fp = fopen($_FILES[$elm_name]['tmp_name'], "r");
                    $imageMagick->readImageFile($fp);
                    if ($imageMagick->getImageCompression() == "image/x-heic") {
                        $imageMagick->setFormat("jpg");
                        $new_name .= '.jpg';
                        $upload_path = $upload_dir['basedir'] . '/shizuoka/' . $new_name;
                        $imageMagick->writeImage($upload_path);
                        $photo_url = '/shizuoka/' . $new_name;
                    }
                    fclose($fp);
                    */
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
}
`;

    fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/library/file.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });

  plugin_file_code = `<?php

/**
 * Log class
 * 
 * ログ出力のヘルパークラスです。Debug, Trace, Info, Warning, Error, Criticalといったレベルごとに出力することができます。
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

const LOGLEVEL_DEBUG = 0;
const LOGLEVEL_TRACE = 1;
const LOGLEVEL_INFO = 2;
const LOGLEVEL_WARNING = 3;
const LOGLEVEL_ERROR = 4;
const LOGLEVEL_CRITICAL = 5;

class Log
{
    private $fp;
    private $loglevel = LOGLEVEL_DEBUG;
    private $isOpen = false;

    private static $singleton;

    private function __construct()
    {
    }

    public function __destruct()
    {
        if ($this->isOpen) {
            fclose($this->fp);
        }
    }

    public function open($path = "/var/log/${all_lower_plugin_name}.log"): bool
    {
        if ($this->isOpen) {
            fclose($this->fp);
        }
        $this->fp = fopen($path, "a");
        $this->isOpen = $this->fp != E_WARNING;
        return $this->isOpen;
    }

    public function setLogLevel($level)
    {
        $this->loglevel = $level;
    }

    public static function getInstance()
    {
        if (!isset(self::$singleton)) {
            self::$singleton = new Log();
        }
        return self::$singleton;
    }

    private function output($level, $message)
    {
        $timezone = new \\DateTimeZone('Asia/Tokyo');
        $d = new \\DateTime('now', $timezone);
        $backtrace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT, 2)[1];
        fwrite($this->fp, $level . " " . $d->format('Y-m-d H:i:s') . " " . $message . " : " . $backtrace["file"] . "(" . $backtrace["line"] . ")\\n");
    }

    public function debug($message)
    {
        if ($this->loglevel <= LOGLEVEL_DEBUG) {
            $this->output("DEBUG", $message);
        }
    }

    public function trace($message)
    {
        if ($this->loglevel <= LOGLEVEL_TRACE) {
            $this->output("TRACE", $message);
        }
    }

    public function info($message)
    {
        if ($this->loglevel <= LOGLEVEL_INFO) {
            $this->output("INFO", $message);
        }
    }

    public function warning($message)
    {
        if ($this->loglevel <= LOGLEVEL_WARNING) {
            $this->output("WARNING", $message);
        }
    }

    public function error($message)
    {
        if ($this->loglevel <= LOGLEVEL_ERROR) {
            $this->output("ERROR", $message);
        }
    }

    public function critical($message)
    {
        if ($this->loglevel <= LOGLEVEL_CRITICAL) {
            $this->output("CRITICAL", $message);
        }
    }
}
`;

  fs.promises.writeFile(
        './dist/' + plugin.name + '/includes/library/log.php',
        plugin_file_code)
        .catch((err) => {
          console.error(err.toString());
        });
};



