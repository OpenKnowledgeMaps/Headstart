<?php

namespace headstart\persistence;
require "SQLitePersistence.php";

/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */
class DispatchingPersistence implements Persistence
{

    public function __construct($ini_array, $sqliteDbPath, $shiftReadPercentage = 0.5)
    {
        $persistence = new \headstart\persistence\SQLitePersistence($sqliteDbPath);
//        $persistence2 = new \headstart\persistence\PostgresPersistence($ini_array);
        $this->sqlPersistence = $persistence;
//        $this->postgresPersistence = $persistence2;
        $this->postgresPersistence = $persistence;
        $this->shiftReadPercentage = $shiftReadPercentage;
    }

    public function createVisualization($vis_id, $vis_title, $data)
    {
        $this->sqlPersistence->createVisualization($vis_id, $vis_title, $data);
        $this->postgresPersistence->createVisualization($vis_id, $vis_title, $data);
    }

    public function getRevision($vis_id, $rev_id)
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 < $this->shiftReadPercentage * 100) {
            $result = $this->sqlPersistence->getRevision($vis_id, $rev_id);
        } else {
            $result = $this->postgresPersistence->getRevision($vis_id, $rev_id);
        }

        return $result;
    }

    public function writeRevision($vis_id, $data)
    {
        $this->sqlPersistence->writeRevision($vis_id, $data);
        $this->postgresPersistence->writeRevision($vis_id, $data);
    }

    public function existsVisualization($vis_id)
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 < $this->shiftReadPercentage * 100) {
            $result = $this->sqlPersistence->existsVisualization($vis_id);
        } else {
            $result = $this->postgresPersistence->existsVisualization($vis_id);
        }

        return $result;
    }

    public function getLastVersion($vis_id)
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 < $this->shiftReadPercentage * 100) {
            $result = $this->sqlPersistence->getLastVersion($vis_id);
        } else {
            $result = $this->postgresPersistence->getLastVersion($vis_id);
        }

        return $result;
    }

    public function getLatestRevisions()
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 < $this->shiftReadPercentage * 100) {
            $result = $this->sqlPersistence->getLatestRevisions();
        } else {
            $result = $this->postgresPersistence->getLatestRevisions();
        }

        return $result;
    }

    public function getContext($vis_id)
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 < $this->shiftReadPercentage * 100) {
            $result = $this->sqlPersistence->getContext($vis_id);
        } else {
            $result = $this->postgresPersistence->getContext($vis_id);
        }

        return $result;
    }

    public function createId($string_array)
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 < $this->shiftReadPercentage * 100) {
            $result = $this->sqlPersistence->createId($string_array);
        } else {
            $result = $this->postgresPersistence->createId($string_array);
        }

        return $result;
    }
}


//    function for random float number generation from 0 to 1
function getRandomFloat()
{
    return mt_rand() / mt_getrandmax();
}
