<?php

namespace headstart\persistence;
/**
 * Description of SQLitePersistence
 *
 * @author pkraker
 */

require 'Persistence.php';

class SQLitePersistence extends Persistence {
    
    private $db;
    
    public function __construct($db) {
        try {
            $this->db = new \PDO('sqlite:' .$db);
            $this->db->setAttribute(\PDO::ATTR_ERRMODE, 
                                    \PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }
    }
    
    public function createTables() {
        $this->db->exec("CREATE TABLE IF NOT EXISTS 'revisions' (
            'rev_id'	INTEGER NOT NULL,
            'rev_vis'	TEXT NOT NULL,
            'rev_user'	TEXT,
            'rev_timestamp'	NUMERIC,
            'rev_comment'	TEXT,
            'rev_data'  TEXT,
            PRIMARY KEY(rev_id, rev_vis)
        )");
        
        $this->db->exec("CREATE TABLE IF NOT EXISTS 'visualizations' (
            'vis_id'	TEXT NOT NULL UNIQUE,
            'vis_title'	TEXT,
            'vis_latest'	INTEGER,
            PRIMARY KEY(vis_id),
            FOREIGN KEY('vis_latest') REFERENCES revisions (rev_id)
        )");
    }
    
    public function createVisualization($vis_id, $vis_title, $data) {
        //create entry in visualization and first revision
        
        $this->prepareAndExecute("INSERT INTO visualizations (vis_id, vis_title) VALUES (?, ?)"
                , array($vis_id,$vis_title));

        $this->writeRevision($vis_id, $data, $rev_id=1);
        
    }
    
    public function getLastVersion($vis_id, $details=false) {
        return $this->getRevision($vis_id, null, $details);
    }
    
    public function getRevision($vis_id, $rev_id, $details=false) {
        
        $id = ($rev_id == null)?("revisions.rev_id"):("?");
        $array = ($rev_id == null)?(array(addslashes($vis_id))):(array(addslashes($vis_id), $rev_id));
        $return_fields = ($details==true)?("revisions.*"):("revisions.rev_data");
        
        $result = $this->prepareExecuteAndReturnResult("SELECT $return_fields FROM revisions, visualizations
                    WHERE visualizations.vis_id = ?
                        AND visualizations.vis_id = revisions.rev_vis 
                        AND visualizations.vis_latest =" . $id
                , $array, !$details);

        return $result;
    }
    
    public function writeRevision($vis_id, $data, $rev_id=null) {
        
        $rev = $rev_id;
        
        if($rev == null) {
            $ver = $this->prepareExecuteAndReturnResult("SELECT vis_latest FROM visualizations WHERE vis_id=?", array($vis_id), true);
            $rev = $ver + 1;
        }
        
        $this->prepareAndExecute("INSERT INTO revisions (rev_id, rev_vis, rev_user, rev_timestamp, rev_comment, rev_data)
                    VALUES (:rev_id, :rev_vis, :rev_user, :rev_timestamp, :rev_comment, :rev_data)"
                , array(
                    ":rev_id" => $rev
                    ,":rev_vis" => $vis_id
                    ,":rev_user" => "System"
                    ,":rev_timestamp" => date("Y-m-d H:i:s", time())
                    ,":rev_comment" => "Visualization created"
                    ,":rev_data" => $data
                ));
        
        $this->prepareAndExecute("UPDATE visualizations SET vis_latest=? WHERE vis_id=?"
                , array($rev, $vis_id));
        
    }
    
    private function prepareAndExecute($stmt, $array) {
        $query = $this->db->prepare($stmt);
        $result = $query->execute($array);
        return array("status" => $result, "query" => $query);
    }
    
    private function prepareExecuteAndReturnResult($stmt, $array, $first=false) {
        $result = $this->prepareAndExecute($stmt, $array);
        $fetch_result = $result["query"]->fetch();
        
        if($fetch_result == false) {
            return false;
        } else if($first == true) {
            return $fetch_result[0];
        } else {
            return $fetch_result;
        }
        
    }
    
}
