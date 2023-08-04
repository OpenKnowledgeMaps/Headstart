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
//    public function createTables();

    public function createVisualization($vis_id, $vis_title, $data);

    public function getRevision($vis_id, $rev_id);

    public function writeRevision($vis_id, $data);

    public function existsVisualization($vis_id);

    public function getLastVersion($vis_id);

    public function getLatestRevisions();

    public function getContext($vis_id);

    public function createId($string_array);
}


//class Persistence {
//
//    public function createVisualization($vis_id, $vis_title, $data) {
//
//    }
//
//    public function getRevision($vis_id, $rev_id) {
//
//    }
//
//    public function writeRevision($vis_id, $data) {
//
//    }
//}
