<?php

namespace headstart\preprocessing;

class Snapshot
{
    protected $cmd;
    public function __construct($ini_array, $query, $id, $service, $service_name) {
        $post_data = array(
            "query" => $query,
            "file" => $id,
            "service_name" => $service_name,
            "service" => $service
        );
        $url_postfix = http_build_query($post_data);

        $phantomjs = $ini_array["snapshot"]["phantomjs_path"];
        $getsvg = $ini_array["snapshot"]["getsvg_path"];
        if (isset($_SERVER) and array_key_exists('SERVER_PROTOCOL', $_SERVER)) {
          $protocol = stripos($_SERVER['SERVER_PROTOCOL'],'https') === true ? 'https://' : 'http://';
        } else {
          $protocol = 'http://';
        }
        $host = $protocol . $ini_array["general"]["host"];
        $snap_php = $ini_array["snapshot"]["snapshot_php"];
        $storage = $ini_array["snapshot"]["storage_path"];
        $width = $ini_array["snapshot"]["snapshot_width"];

        $url = "{$host}{$snap_php}?{$url_postfix}";
        $this->cmd = "{$phantomjs} {$getsvg} \"{$url}\" {$storage}{$post_data['file']}.png {$width}";
    }

    public function takeSnapshot() {
        if (substr(php_uname(), 0, 7) == "Windows"){
            pclose(popen("start /B ". $this->cmd, "r"));
        }
        else {
            exec($this->cmd . " &");
        }
    }
}
