<?php

namespace headstart\persistence;
require_once 'SQLitePersistence.php';

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

  public function getUpdateMaps($vis_changed) {
    $return_fields = "visualizations.vis_title,
                      visualizations.vis_query,
                      visualizations.vis_params,
                      visualizations.vis_changed_timestamp,
                      visualizations.vis_id";
    if ($vis_changed == false) {
        $stmt = "SELECT $return_fields FROM visualizations
                 WHERE visualizations.vis_title == 'openaire'
                 ";
    } else {
        $stmt = "SELECT $return_fields FROM visualizations
                 WHERE visualizations.vis_title == 'openaire'
                 AND visualizations.vis_changed = 1
                 ";
    }
    $query = $this->db->query($stmt);
    $result = $query->fetchAll();

    return $result;
  }

  public function resetFlag($vis_id) {
    $stmt = "UPDATE visualizations
             SET vis_changed=0
             WHERE vis_title == 'openaire'
             AND vis_id == '$vis_id'";
    $this->db->query($stmt);
  }

}
