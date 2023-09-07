<?php

namespace headstart\persistence;
/**
 * Description of Logger
 *
 * @author pkraker
 */

/**
 * Interface Persistence
 */
interface Persistence
{

    public function createVisualization($vis_id, $vis_title, $data): void;

    public function getRevision($vis_id, $rev_id): array|bool;

    public function writeRevision($vis_id, $data): void;

    public function existsVisualization($vis_id): array|bool;

    public function getLastVersion($vis_id): array|bool;

    public function getLatestRevisions(): array|bool;

    public function getContext($vis_id): array|bool;

    public function createID($string_array, $payload): string;
}
