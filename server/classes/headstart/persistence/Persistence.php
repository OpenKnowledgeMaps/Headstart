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

    public function getRevision($vis_id, $rev_id): array;

    public function writeRevision($vis_id, $data): void;

    public function existsVisualization($vis_id): array;

    public function getLastVersion($vis_id): array;

    public function getLatestRevisions(): array;

    public function getContext($vis_id): array;

    public function createId($string_array): string;
}
