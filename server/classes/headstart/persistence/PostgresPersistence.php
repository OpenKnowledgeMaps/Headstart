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
        if ($res["httpcode"] != 200) {
            $data = $res;
          } else {
            $data = json_decode($res["result"], true);
          }
        if ($data != "null") {
            $data = array($data);
        }
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
