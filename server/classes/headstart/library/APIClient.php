<?php

namespace headstart\library;
require_once dirname(__FILE__) . '/CommUtils.php';

class APIClient {

    public function __construct($ini_array) {

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
        try {
            $res = CommUtils::call_api($route, $payload);
            if ($res["httpcode"] != 200) {
                $res["route"] = $route;
                $res = $this->handle_api_errors($res);
            }
            return $res;
        }
        catch (Exception $e) {
            $res = array("status"=>"error",
                         "httpcode"=>500,
                         "reason"=>array("unexpected data processing error"));
            error_log(print_r($res, TRUE));
            return $res;
        }
        finally {
        }        
    }

    public function call_persistence($endpoint, $payload) {
        $route = $this->base_route . "persistence/" . $endpoint . "/" . $this->database;
        var_dump('APIClient::call_persistence() $route: ' . $route);
        var_dump('APIClient::call_persistence() $endpoint: ' . $endpoint);
        var_dump('APIClient::call_persistence() $payload: ' . $payload);
        try {
            $res = CommUtils::call_api($route, $payload);
            // from this call_api we get $res["httpcode"] = 0
            var_dump('APIClient::call_persistence() =>try call_api $res["httpcode"]: ' . $res["httpcode"]);
            if ($res["httpcode"] != 200) {
                $res["route"] = $route;
                $res = $this->handle_api_errors($res);
                var_dump('APIClient::call_persistence(); res["httpcode"] != 200;  $res["httpcode"]: ' . $res["httpcode"]);
            }
            return $res;
        }
        catch (Exception $e) {
            $res = array("status"=>"error",
                         "httpcode"=>500,
                         "reason"=>array("unexpected data processing error"));
            var_dump('APIClient::call_persistence() catch Exception $e; $res["httpcode"] ' . $res["httpcode"]);
            error_log(print_r($res, TRUE));
            return $res;
        }
        finally {
        }        
    }

    public function handle_api_errors($res) {
        // if (is_string($res)) {
        //     if (str_contains($res, "503 Service Unavailable")) {
        //         $res = array("status"=>"error", reason=>array());
        //     }
        // }
        if ($res["httpcode"] == 503) {
            $res["status"] = "error";
            $res["reason"] = array();
        }
        if (!array_key_exists("reason", $res)) {
            $res["reason"] = array();
        }
        if (count($res["reason"])==0) {
            array_push($res["reason"], "unexpected data processing error");
        }
        return $res;
    }

}