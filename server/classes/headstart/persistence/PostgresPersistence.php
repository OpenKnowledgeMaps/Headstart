<?php

namespace headstart\persistence;
require "SQLitePersistence.php";

/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */
class PostgresPersistence implements Persistence
{

    public function __construct($ini_array)
    {
        $apiclient = new \headstart\library\APIClient($ini_array);
        $this->api_client = $apiclient;
    }

    public function createVisualization($vis_id, $vis_title, $data)
    {
        // TODO: Implement createVisualization() method.
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