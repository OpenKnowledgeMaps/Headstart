<?php

namespace headstart\library;
require_once dirname(__FILE__) . '/CommUtils.php';

class APIClient {

    public function __construct($service_integration, $ini_array) {

        $this->load_configs($ini_array);
    }

    public function load_configs($ini_array) {
        $this->ini_array = $ini_array;
        $this->settings = $this->ini_array["general"];
        $this->processing_backend = isset($this->ini_array["general"]["processing_backend"])
        ? ($this->ini_array["general"]["processing_backend"])
        : "legacy";
        $this->persistence_backend = isset($this->ini_array["general"]["persistence_backend"])
        ? ($this->ini_array["general"]["persistence_backend"])
        : "legacy";
        $this->database = $this->ini_array["connection"]["database"];
        $this->WORKING_DIR = $this->ini_array["general"]["preprocessing_dir"] . $this->ini_array["output"]["output_dir"];
        $api_url = $this->ini_array["general"]["api_url"];
        $api_flavor = isset($this->ini_array["general"]["api_flavor"])
                                ? ($this->ini_array["general"]["api_flavor"])
                                : "stable";
        $this->base_route = $api_url . $api_flavor . "/";
    }

    public function call_api($endpoint, $payload) {
        $route = $this->base_route . $endpoint;
        $res = CommUtils::call_api($route, $payload);
        return $res;
    }

    public function call_persistence($endpoint, $payload) {
        $route = $this->base_route . "persistence/" . $endpoint . "/" . $this->database;
        $res = CommUtils::call_api($route, $payload);
        return $res;
    }

}