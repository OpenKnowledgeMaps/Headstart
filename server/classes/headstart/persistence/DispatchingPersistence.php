<?php

namespace headstart\persistence;


/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */
class DispatchingPersistence implements Persistence
{
    private Persistence $oldPersistence;
    private Persistence $newPersistence;
    private int|float $shiftReadPercentage;


    public function __construct(Persistence $oldPersistence, Persistence $newPersistence, $shiftReadPercentage)
    {
        $this->shiftReadPercentage = $shiftReadPercentage;
        $this->oldPersistence = $oldPersistence;
        $this->newPersistence = $newPersistence;
    }

    public function createVisualization($vis_id, $vis_title, $data): void
    {
        $this->oldPersistence->createVisualization($vis_id, $vis_title, $data);
        $this->newPersistence->createVisualization($vis_id, $vis_title, $data);
    }

    public function getRevision($vis_id, $rev_id): array|bool
    {
        $randomFloat = getRandomFloat();

        if (($randomFloat * 100) > ($this->shiftReadPercentage * 100)) {
            $result = $this->oldPersistence->getRevision($vis_id, $rev_id);
        } else {
            $result = $this->newPersistence->getRevision($vis_id, $rev_id);
        }

        return $result;
    }

    public function writeRevision($vis_id, $data): void
    {
        $this->oldPersistence->writeRevision($vis_id, $data);
        $this->newPersistence->writeRevision($vis_id, $data);
    }

    public function existsVisualization($vis_id): array|bool
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 > $this->shiftReadPercentage * 100) {
            $result = $this->oldPersistence->existsVisualization($vis_id);
        } else {
            $result = $this->newPersistence->existsVisualization($vis_id);
        }

        return $result;
    }

    public function getLastVersion($vis_id): array|bool
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 > $this->shiftReadPercentage * 100) {
            $result = $this->oldPersistence->getLastVersion($vis_id);
        } else {
            $result = $this->newPersistence->getLastVersion($vis_id);
        }

        return $result;
    }

    public function getLatestRevisions(): array|bool
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 > $this->shiftReadPercentage * 100) {
            $result = $this->oldPersistence->getLatestRevisions();
        } else {
            $result = $this->newPersistence->getLatestRevisions();
        }

        return $result;
    }

    public function getContext($vis_id): array|bool
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 > $this->shiftReadPercentage * 100) {
            $result = $this->oldPersistence->getContext($vis_id);
        } else {
            $result = $this->newPersistence->getContext($vis_id);
        }

        return $result;
    }

    public function createId($string_array, $payload): string
    {
        $randomFloat = getRandomFloat();

        if ($randomFloat * 100 > $this->shiftReadPercentage * 100) {
            $result = $this->oldPersistence->createId($string_array, $payload);
        } else {
            $result = $this->newPersistence->createId($string_array, $payload);
        }

        return $result;
    }
}


//    function for random float number generation from 0 to 1
function getRandomFloat(): float
{
    return mt_rand() / mt_getrandmax();
}
