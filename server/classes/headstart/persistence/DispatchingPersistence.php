<?php

namespace headstart\persistence;

/**
 * This class implements the PersistenceInterface and provides methods to interact with the database.
 */
class DispatchingPersistence implements Persistence
{
    private Persistence $newPersistence;

    public function __construct(Persistence $newPersistence)
    {
        $this->newPersistence = $newPersistence;
    }

    public function createVisualization($vis_id, $vis_title, $input_json, $query, $dirty_query, $params_json): void
    {
        $this->newPersistence->createVisualization($vis_id, $vis_title, $input_json, $query, $dirty_query, $params_json);
    }

    public function getRevision($vis_id, $rev_id): array|bool
    {
        return $this->newPersistence->getRevision($vis_id, $rev_id);
    }

    public function writeRevision($vis_id, $data): void
    {
        $this->newPersistence->writeRevision($vis_id, $data);
    }

    public function existsVisualization($vis_id): array|bool
    {
        return $this->newPersistence->existsVisualization($vis_id);
    }

    public function getLastVersion($vis_id, $details, $context): array|bool
    {
        return $this->newPersistence->getLastVersion($vis_id, $details, $context);
    }

    public function getLatestRevisions(): array|bool
    {
        return $this->newPersistence->getLatestRevisions();
    }

    public function getContext($vis_id): array|bool
    {
        return $this->newPersistence->getContext($vis_id);
    }

    public function createID($string_array, $payload): string
    {
        return $this->newPersistence->createID($string_array, $payload);
    }
}
