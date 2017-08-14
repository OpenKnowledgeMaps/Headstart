<?php

namespace headstart\preprocessing;

class Snapshot
{
    protected $cmd;
    public function __construct($ini_array, $search_result, $service)
    {
        $decoded_result = json_decode($search_result);
        $post_data = array(
            "query" => $decoded_result->query,
            "file" => $decoded_result->id,
            "service_name" => $service["name"],
            "service" => $service["service"]
        );
        $url_postfix = http_build_query($post_data);

        $phantomjs = $ini_array["snapshot"]["phantomjs_path"];
        $getsvg = $ini_array["snapshot"]["getsvg_path"];
        $host = $ini_array["general"]["host"];
        $snap_php = $ini_array["snapshot"]["snapshot_php"];
        $storage = $ini_array["snapshot"]["storage_path"];
        $width = $ini_array["snapshot"]["snapshot_width"];

        $url = "{$host}{$snap_php}?{$url_postfix}";
        $this->cmd = "{$phantomjs} {$getsvg} '{$url}' {$storage}{$post_data['file']}.png {$width}";
    }

    public function takeSnapshot() {
        if (substr(php_uname(), 0, 7) == "Windows"){
            pclose(popen("start /B ". $this->cmd, "r"));
        }
        else {
            exec($this->cmd . " 1>/dev/null 2>/dev/null  &");
        }
    }
}