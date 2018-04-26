<?php

namespace headstart\persistence;
require 'SQLitePersistence.php';

class ViperUpdater extends SQLitePersistence {

  private $db;

  public function __construct($db) {
      try {
          $this->db = new \PDO('sqlite:' . $db);
          $this->db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
      } catch (PDOException $e) {
          echo 'Connection failed: ' . $e->getMessage();
      }
  }

  public function getUpdateMaps($vis_changed = false) {
    $return_fields = "revisions.rev_vis, revisions.rev_timestamp, revisions.vis_query, visualizations.vis_title";
    if ($vis_changed == false) {
        $stmt = "SELECT $return_fields FROM revisions, visualizations
                  LIMIT 10";
    } else {
        $stmt = "SELECT $return_fields FROM revisions, visualizations
                  WHERE visualizations.vis_changed = 1
                  LIMIT 10";
    }
    $query = $this->db->query($stmt);
    $result = $query->fetchAll();

    return $result;
  }

}
