<?php

namespace headstart\apiclient;
require_once dirname(__FILE__) . '/CommUtils.php';
require_once dirname(__FILE__) . '/toolkit.php';

class APIClient {

    public function __construct($service_integration) {

        $this->load_configs();
    }

    public function load_configs() {
        $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
        $this->ini_array = Toolkit::loadIni($INI_DIR);
        $this->settings = $this->ini_array["general"];
        $this->processing_backend = isset($this->ini_array["general"]["processing_backend"])
        ? ($this->ini_array["general"]["processing_backend"])
        : "legacy";
        $this->persistence_backend = isset($this->ini_array["general"]["persistence_backend"])
        ? ($this->ini_array["general"]["persistence_backend"])
        : "legacy";
        $this->database = $this->ini_array["connection"]["database"];
        $this->WORKING_DIR = $this->ini_array["general"]["preprocessing_dir"] . $this->ini_array["output"]["output_dir"];
        $api_url = $ini_array["general"]["api_url"];
        $api_flavor = isset($ini_array["general"]["api_flavor"])
                                ? ($ini_array["general"]["api_flavor"])
                                : "stable";
        $this->base_route = $api_url . $api_flavor . "/";
    }

    public function call_api($endpoint, $payload) {
        $route = $base_route . $endpoint . "/" . $this->database;
        $res = library\CommUtils::call_api($route, $payload);
        return $res;
    }

    public function call_persistence($endpoint, $payload) {
        $route = $base_route . "persistence/" . $endpoint . "/" . $this->database;
        $res = library\CommUtils::call_api($route, $payload);
        return $res;
    }

}