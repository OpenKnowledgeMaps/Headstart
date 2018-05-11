<?php

namespace headstart\persistence;
require_once 'SQLitePersistence.php';

class ViperUpdater extends SQLitePersistence {

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
             AND vis_id ==?";
    
    $this->prepareAndExecute($stmt, array($vis_id));
  }
  
  public function markVisChanged($vis_id) {
    $stmt = "UPDATE visualizations
             SET vis_changed = 1, vis_changed_timestamp = ?
             WHERE vis_title == 'openaire'
             AND vis_id == ?";
    
    $now = date("Y-m-d H:i:s");
    
    $this->prepareAndExecute($stmt, array($now, $vis_id));
    
  }

}
