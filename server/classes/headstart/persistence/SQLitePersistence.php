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
    
    public function getLastVersion($vis_id) {
        return $this->getRevision($vis_id, null);
    }
    
    public function getRevision($vis_id, $rev_id) {
        
        $id = ($rev_id == null)?("revisions.rev_id"):("?");
        $array = ($rev_id == null)?(array($vis_id)):(array($vis_id, $rev_id));
        
        $result = $this->prepareExecuteAndReturnFirstResult("SELECT revisions.rev_data FROM revisions, visualizations
                    WHERE visualizations.vis_id = ?
                        AND visualizations.vis_id = revisions.rev_vis 
                        AND visualizations.vis_latest =" . $id
                , $array);

        return $result;
    }
    
    public function writeRevision($vis_id, $data, $rev_id=null) {
        
        $rev = $rev_id;
        
        if($rev == null) {
            $ver = $this->prepareExecuteAndReturnFirstResult("SELECT vis_latest FROM visualizations WHERE vis_id=?", array($vis_id));
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
    
    private function prepareExecuteAndReturnFirstResult($stmt, $array) {
        $result = $this->prepareAndExecute($stmt, $array);
        $fetch_result = $result["query"]->fetch();
        
        return $fetch_result[0];
        
    }
    
}
