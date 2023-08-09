<?php

namespace headstart\persistence;

use headstart\library\APIClient;

require "SQLitePersistence.php";

/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */
class PostgresPersistence implements Persistence
{

//    private function __construct($ini_array)
    private function __construct(APIClient $apiclient)
    {
//        $apiclient = new \headstart\library\APIClient($ini_array);
        $this->api_client = $apiclient;
//        set persistence to postgres
    }

    public function createVisualization($vis_id, $vis_title, $data): void
    {
//        temporary values defined for testing
        $unique_id = "test";
        $input_json = json_encode($data);
        $input_json = preg_replace("/\<U\+(.*?)>/", "&#x$1;", $input_json);
        $query = $vis_id;
        $dirty_query = $vis_id;
        $params_json = json_encode(array());

        $payload = json_encode(array("vis_id" => $unique_id,
            "vis_title" => $vis_title,
            "data" => $input_json,
            "vis_clean_query" => $query,
            "vis_query" => $dirty_query,
            "vis_params" => $params_json));
        $this->api_client->call_persistence("createVisualization", $payload);
    }

    public function getRevision($vis_id, $rev_id)
    {
        // TODO: Implement getRevision() method.
    }

    public function writeRevision($vis_id, $data)
    {
        // TODO: Implement writeRevision() method.
    }

    public function existsVisualization($vis_id)
    {
        // TODO: Implement existsVisualization() method.
    }

    public function getLastVersion($vis_id)
    {
        // TODO: Implement getLastVersion() method.
    }

    public function getLatestRevisions()
    {
        // TODO: Implement getLatestRevisions() method.
    }

    public function getContext($vis_id)
    {
        // TODO: Implement getContext() method.
    }

    public function createId($string_array)
    {
        // TODO: Implement createId() method.
    }
}