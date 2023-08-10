<?php

namespace headstart\persistence;

use headstart\library\APIClient;

require "SQLitePersistence.php";

/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */
class PostgresPersistence implements Persistence
{

    private APIClient $api_client;
    private function __construct(APIClient $apiclient)
    {
        $this->api_client = $apiclient;
    }

    public function createVisualization($vis_id, $vis_title, $data): void
    {
//        temporary values defined for testing
        $dirty_query = $data->context->query;
        $query = cleanQuery($dirty_query, $transform_query_tolowercase = true, $add_slashes = true);
        $params_json = $data->context->params;

        $payload = json_encode(array("vis_id" => $vis_id,
            "vis_title" => $vis_title,
            "data" => $data,
            "vis_clean_query" => $query,
            "vis_query" => $dirty_query,
            "vis_params" => $params_json));
        $this->api_client->call_persistence("createVisualization", $payload);
    }

    public function getRevision($vis_id, $rev_id): array
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

    public function existsVisualization($vis_id): array
    {
        $payload = json_encode(array("vis_id" => $vis_id));
        $result = $this->api_client->call_persistence("existsVisualization", $payload);
        return $result;
    }

    public function getLastVersion($vis_id): array
    {
        $payload = json_encode(array("vis_id" => $vis_id,
            "details" => false,
            "context" => false));
        $result = $this->api_client->call_persistence("getLastVersion", $payload);
        return $result;
    }

    public function getLatestRevisions(): array
    {
        $result = $this->api_client->call_persistence("getLatestRevisions", "{}");
        return $result;
    }

    public function getContext($vis_id): array
    {
        $payload = json_encode(array("vis_id" => $vis_id));
        $result = $this->api_client->call_persistence("getContext", $payload);
        return $result;
    }

    public function createId($string_array): string
    {
//        $payload = json_encode(array("params" => $post_params,
//            "param_types" => $param_types));
        $payload = $string_array;
        $result = $this->api_client->call_persistence("createId", $payload);
        return $result;
    }
}