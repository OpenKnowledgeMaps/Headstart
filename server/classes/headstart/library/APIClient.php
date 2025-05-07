<?php

namespace headstart\library;
use Exception;
require_once dirname(__FILE__) . '/CommUtils.php';

class APIClient {
    private array $ini_array;
    private string $database;
    private string $base_route;
    private array $settings;

    public function __construct($ini_array) {
        $this->load_configs($ini_array);
    }

    public function load_configs(array $ini_array): void {
        $this->ini_array = $ini_array;
        $this->settings = $this->ini_array["general"];
        $this->database = $this->ini_array["connection"]["database"];
        $api_url = $this->ini_array["general"]["api_url"];
        $api_flavor = $this->ini_array["general"]["api_flavor"] ?? "";
        $this->base_route = $api_url . ($api_flavor ? $api_flavor . "/" : "");
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
            error_log("Error in APIClient: " . $e);
            $res = array("status"=>"error", "httpcode"=>500, "reason"=>array("unexpected data processing error"));
            return $res;
        }
    }

    public function call_persistence($endpoint, $payload) {
        $route = $this->base_route . "persistence/" . $endpoint . "/" . $this->database;

        try {
            $res = CommUtils::call_api($route, $payload);

            if ($res["httpcode"] != 200) {
                $res["route"] = $route;
                $res = $this->handle_api_errors($res);
            }

            return $res;
        }
        catch (Exception $e) {
            // what happens here is instead of bubbling the error up,
            // fake a response that looks like an error
            // because of the hardcoded reason we loose the original error information
            $res = array("status"=>"error", "httpcode"=>500, "reason"=>array("unexpected data processing error"));
            return $res;
        }
    }

    public function handle_api_errors($res) {
        // if (is_string($res)) {
        //     if (str_contains($res, "503 Service Unavailable")) {
        //         $res = array("status"=>"error", reason=>array());
        //     }
        // }
        error_log(("Trying to handle API errors: " . print_r($res, true)));
        $res["status"] = "error";
        if ($res["httpcode"] == 503) {
            // we had a 503 for the database connection error
            // this implementation actively suppresses the reason by resetting to an empty array
            // $res["reason"] = array();
        }
        if (!array_key_exists("reason", $res)) {
            $res["reason"] = array();
        }
        if (count($res["reason"])==0) {
            array_push($res["reason"], "unexpected data processing error");
        }
        error_log(("Trying to handle API errors: " . print_r($res, true)));
        return $res;
    }
}