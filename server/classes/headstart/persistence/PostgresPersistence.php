<?php

namespace headstart\persistence;
use headstart\library\APIClient;

require_once 'Persistence.php';

/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */

class PostgresPersistence implements Persistence
{

    private APIClient $api_client;

    public function __construct(APIClient $apiclient)
    {
        $this->api_client = $apiclient;
    }

    public function createVisualization($vis_id, $vis_title, $input_json, $query, $dirty_query, $params_json): void
    {
        $payload = json_encode(array("vis_id" => $vis_id,
            "vis_title" => $vis_title,
            "data" => $input_json,
            "vis_clean_query" => $query,
            "vis_query" => $dirty_query,
            "vis_params" => $params_json));
        $this->api_client->call_persistence("createVisualization", $payload);
    }

    public function getRevision($vis_id, $rev_id): array|bool
    {
        $payload = json_encode(array("vis_id" => $vis_id,
            "rev_id" => $rev_id));
        $result = $this->api_client->call_persistence("getRevision", $payload);
        return $result;
    }

    public function writeRevision($vis_id, $data): void
    {
        $payload = json_encode(array("vis_id" => $vis_id,
            "data" => $data));
        $this->api_client->call_persistence("writeRevision", $payload);
    }

    public function existsVisualization($vis_id): array|bool
    {
        $payload = json_encode(array("vis_id" => $vis_id));
        $res = $this->api_client->call_persistence("existsVisualization", $payload);
        if ($res["httpcode"] != 200) {
          return json_encode($res);
        } else {
          $result = json_decode($res["result"], true);
          $exists = $result["exists"];
        }
        return $exists;
    }

    public function getLastVersion($vis_id, $details, $context): array|bool
    {
        $payload = json_encode(array("vis_id" => $vis_id,
            "details" => $details,
            "context" => $context));
        $res = $this->api_client->call_persistence("getLastVersion", $payload);
        error_log(message: "PostgresPersistence.php: raw result: " . print_r($res, true));
        // this sometimes looks like array("result" => "null", "httpcode" => 200)
        error_log(message: "PostgresPersistence.php: result http code: " . $res["httpcode"]);
        if ($res["httpcode"] != 200) {
            // we could throw here and then handle the error in the calling function, e.g. getLastVersion.php
            $data = $res;            
          } else {
            // in case of an error with misleading http code, the result is unpacked and returned
            $data = json_decode($res["result"], true);
          }
        if ($data != "null") {
            // this is a workaround for the case that the result is not an array
            $data = array($data);
        }
        //hypothesis: does not return a response that search.php can recognize as failed search/request
        error_log("PostgresPersistence.php: raw data: " . print_r($data, true));
        error_log("PostgresPersistence.php: data: " . json_encode($data));
        return $data;
    }

    public function getLatestRevisions(): array|bool
    {
        $result = $this->api_client->call_persistence("getLatestRevisions", "{}");
        return $result;
    }

    public function getContext($vis_id): array|bool
    {
        $payload = json_encode(array("vis_id" => $vis_id));
        $res = $this->api_client->call_persistence("getContext", $payload);
        $data = json_decode($res["result"], true);
        return array($data);
    }

    public function createID($string_array, $payload): string
    {
        $res = $this->api_client->call_persistence("createID", $payload);
        if ($res["httpcode"] != 200) {
            echo json_encode($res);
        } else {
            $result = json_decode($res["result"], true);
            $unique_id = $result["unique_id"];
            return $unique_id;
        }

        throw new \Exception("Could not create ID, response code was : " . $res["httpcode"]);
    }
}
