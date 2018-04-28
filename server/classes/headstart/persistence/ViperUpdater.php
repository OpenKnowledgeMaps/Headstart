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
                      visualizations.vis_params";
    if ($vis_changed == false) {
        $stmt = "SELECT $return_fields FROM visualizations
                  WHERE visualizations.vis_title == 'base'
                  LIMIT 10";
    } else {
        $stmt = "SELECT $return_fields FROM visualizations
                  WHERE visualizations.vis_title == 'base'
                  WHERE visualizations.vis_changed = 1
                  LIMIT 10";
    }
    $query = $this->db->query($stmt);
    $result = $query->fetchAll();

    return $result;
  }

  public function getUpdateMapsByID($vis_changed) {
    $return_fields = "visualizations.vis_title,
                      visualizations.vis_query,
                      visualizations.vis_params";
    if ($vis_changed == false) {
        $stmt = "SELECT $return_fields FROM visualizations
                  WHERE visualizations.vis_title == 'base'
                  LIMIT 10";
    } else {
        $stmt = "SELECT $return_fields FROM visualizations
                  WHERE visualizations.vis_title == 'base'
                  WHERE visualizations.vis_changed = 1
                  LIMIT 10";
    }
    $query = $this->db->query($stmt);
    $result = $query->fetchAll();

    return $result;
  }

  public function getUpdateMapsByFunderProject($vis_changed) {
    $return_fields = "visualizations.vis_title,
                      visualizations.vis_query,
                      visualizations.vis_params";
    if ($vis_changed == false) {
        $stmt = "SELECT $return_fields FROM visualizations
                  WHERE visualizations.vis_title == 'base'
                  LIMIT 10";
    } else {
        $stmt = "SELECT $return_fields FROM visualizations
                  WHERE visualizations.vis_title == 'base'
                  WHERE visualizations.vis_changed = 1
                  LIMIT 10";
    }
    $query = $this->db->query($stmt);
    $result = $query->fetchAll();

    return $result;
  }

}
