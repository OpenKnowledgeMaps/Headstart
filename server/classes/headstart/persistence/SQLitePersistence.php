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
            $this->db = new \PDO('sqlite:' . $db);
            $this->db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }
    }

    public function createTables() {
        $this->db->exec("CREATE TABLE IF NOT EXISTS 'revisions' (
            'rev_id'	INTEGER NOT NULL,
            'rev_vis'	TEXT NOT NULL,
            'vis_query' TEXT,
            'rev_user'	TEXT,
            'rev_timestamp'	NUMERIC,
            'rev_comment'	TEXT,
            'rev_data'  TEXT,
            PRIMARY KEY(rev_id, rev_vis),
            FOREIGN KEY('vis_query') REFERENCES visualizations (vis_clean_query),
            FOREIGN KEY('rev_id') REFERENCES revisions (vis_latest)
        )");

        $this->db->exec("CREATE TABLE IF NOT EXISTS 'visualizations' (
            'vis_id' TEXT NOT NULL UNIQUE,
            'vis_query' TEXT,
            'vis_clean_query' TEXT,
            'vis_title'	TEXT,
            'vis_latest' INTEGER,
            'vis_params' TEXT,
            PRIMARY KEY(vis_id)
        )");
    }

    public function createVisualization($vis_id, $vis_title, $data, $vis_clean_query=null, $vis_query = null, $params = null) {
        //create entry in visualization and first revision
        
        $this->prepareAndExecute("INSERT INTO visualizations (vis_id, vis_query, vis_clean_query, vis_title, vis_params) "
                . "VALUES (?, ?, ?, ?, ?)"
                , array($vis_id, $vis_query, $vis_clean_query, $vis_title, $params));

        $this->writeRevision($vis_id, $data, $rev_id = 1);
    }
    
    public function existsVisualization($vis_id) {
        $result = $this->prepareExecuteAndReturnResult(
                "SELECT EXISTS(SELECT 1 FROM visualizations WHERE vis_id=?)"
                , array($vis_id)
                , $first = true);
        
        return $result[0];
    }

    public function getLastVersion($vis_id, $details = false, $context = false) {
        return $this->getRevision($vis_id, null, $details, $context);
    }

    public function getRevision($vis_id, $rev_id, $details=false, $context = false) {
        
        $id = ($rev_id == null)?("revisions.rev_id"):("?");
        $array = ($rev_id == null)?(array(addslashes($vis_id))):(array(addslashes($vis_id), $rev_id));
        $return_fields = "";
        if($context === false) {
            $return_fields = ($details==true)?("revisions.*"):("revisions.rev_data");
        } else {
            $return_fields = "revisions.rev_vis, revisions.vis_query, visualizations.vis_title, "
                    . "revisions.rev_timestamp, visualizations.vis_params, revisions.rev_data";
        }
        
        $result = $this->prepareExecuteAndReturnResult("SELECT $return_fields FROM revisions, visualizations
                    WHERE visualizations.vis_id = ?
                        AND visualizations.vis_id = revisions.rev_vis 
                        AND visualizations.vis_latest =" . $id
                , $array, (!$details && !$context));

        return $result;
    }
    
     public function getContext($vis_id) {
         $return_fields = "revisions.rev_vis, revisions.vis_query, visualizations.vis_title, "
                    . "revisions.rev_timestamp, visualizations.vis_params";
         
         $result = $this->prepareExecuteAndReturnResult("SELECT $return_fields FROM revisions, visualizations
                    WHERE visualizations.vis_id = ?
                        AND visualizations.vis_id = revisions.rev_vis 
                        AND visualizations.vis_latest = revisions.rev_id"
                , array($vis_id));

        return $result;
     }
    
    public function getLatestRevisions($limit=30, $details=false) {
        
        $count_query = $this->prepareExecuteAndReturnResult("SELECT Count(*) FROM revisions", array(), $first = true);
        $count = $count_query[0];
        $start_index = $count - $limit;
        
        $return_fields = "revisions.rev_vis, revisions.rev_timestamp, revisions.vis_query, visualizations.vis_title";
        $return_fields .= ($details==true)?(", revisions.rev_data"):("");
        
        $result = $this->prepareExecuteAndReturnResult("SELECT $return_fields FROM revisions, visualizations
                    WHERE visualizations.vis_id = revisions.rev_vis
                    LIMIT ?, ?"
                , array($start_index, $limit), $first = false);

        return $result;
    }

    public function writeRevision($vis_id, $data, $rev_id=null) {
        
        $rev = $rev_id;
        
        if($rev == null) {
            $ver = $this->prepareExecuteAndReturnResult("SELECT vis_latest FROM visualizations WHERE vis_id=?", 
                    array($vis_id), 
                    $first = true);
            $rev = $ver[0] + 1;
        }
        
        $query = $this->prepareExecuteAndReturnResult("SELECT vis_clean_query FROM visualizations WHERE vis_id=?", 
                array($vis_id), 
                $first = true);
        
        $this->prepareAndExecute("INSERT INTO revisions (rev_id, rev_vis, rev_user, rev_timestamp, rev_comment, rev_data, vis_query)
                    VALUES (:rev_id, :rev_vis, :rev_user, :rev_timestamp, :rev_comment, :rev_data, :vis_query)"
                , array(
                    ":rev_id" => $rev
                    ,":rev_vis" => $vis_id
                    ,":rev_user" => "System"
                    ,":rev_timestamp" => date("Y-m-d H:i:s", time())
                    ,":rev_comment" => "Visualization created"
                    ,":rev_data" => $data
                    ,":vis_query" => $query[0]
                ));
        
        $this->prepareAndExecute("UPDATE visualizations SET vis_latest=? WHERE vis_id=?"
                , array($rev, $vis_id));
        
    }

    private function prepareAndExecute($stmt, $array) {
        try {
            $query = $this->db->prepare($stmt);
            $result = $query->execute($array);
            return array("status" => $result, "query" => $query);
        } catch (PDOException $err) {
            var_dump($err->getMessage());
            die("..");
        }
    }

    private function prepareExecuteAndReturnResult($stmt, $array, $first = false) {
        $result = $this->prepareAndExecute($stmt, $array);
        $fetch_result = $result["query"]->fetchAll();

        if ($fetch_result == false) {
            return false;
        } else if ($first == true) {
            return $fetch_result[0];
        } else {
            return $fetch_result;
        }
    }

    public function createID($string_array) {
        $string_to_hash = implode(" ", $string_array);

        return md5($string_to_hash);
    }

}
