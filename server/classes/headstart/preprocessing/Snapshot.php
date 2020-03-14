<?php

namespace headstart\preprocessing;

class Snapshot
{
    protected $cmd;
    public function __construct($ini_array, $query, $id, $service, $service_name, $vis_type) {
        $post_data = array(
            "query" => $query,
            "file" => $id,
            "service_name" => $service_name,
            "service" => $service
        );
        if ($service_name == "LinkedCat") {
          $post_data["vis_type"] = $vis_type;
          }
        $url_postfix = http_build_query($post_data);

        $node_path = $ini_array["snapshot"]["node_path"];
        $getsvg = $ini_array["snapshot"]["getsvg_path"];
        if (isset($_SERVER) and array_key_exists('SERVER_PROTOCOL', $_SERVER)) {
          $protocol = stripos($_SERVER['SERVER_PROTOCOL'],'https') === true ? 'https://' : 'http://';
        } elseif (array_key_exists('snapshot_local_protocol', $ini_array)) {
          $protocol = $ini_array['snapshot_local_protocol'];
        } else {
          $protocol = 'http://';
        }
        $host = $protocol . $ini_array["general"]["host"];
        $snap_php = $ini_array["snapshot"]["snapshot_php"];
        $storage = $ini_array["snapshot"]["storage_path"];
        $nodemodules = $ini_array["snapshot"]["nodemodules_path"];

        $url = "{$host}{$snap_php}?{$url_postfix}";
        $this->cmd = "{$node_path} {$getsvg} \"{$url}\" {$storage}{$post_data['file']}.png {$nodemodules}";
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
