<?php

namespace headstart\preprocessing\connection;

/**
 * Database class for connecting to a data source and creating the metadata and the
 * cooccurrence file.
 *
 * @author pkraker
 */

use headstart\library;
use headstart\preprocessing\naming;

class DBConnectionWordnet extends DBConnection {
       
    public function writeCoocFile($conference_id, $cut_off, $file_path) {
        
        $result = $this->queryDB($conference_id);
        
        $this->writeToFile($file_path, $result);
        
    }
    
    public function returnContents($conference_id, $limit_from = null, $limit_to = null) {
        
        $result = $this->queryDB($conference_id, $limit_from, $limit_to);
        
        $contents = array();
        
        while ($row = mysql_fetch_assoc($result)) {
            $contents[$row['contentID']] = $row['title'] . " " . $row['abstract'];
        }
        
        return $contents;
    }
    
    
    protected function queryDB($conference_id, $limit_from = null, $limit_to = null) {
        
        $query = sprintf("SELECT DISTINCT content.contentID, content.title, content.abstract
            FROM content
            WHERE (content.contentType <> %s)"
            ,"\"no-paper\"");
        
        $query .= $this->createConferenceIDString($conference_id);
        
        if(!is_null($limit_from) && !is_null($limit_to)) {
            $query .= " LIMIT " . $limit_from . "," . $limit_to;
        }
        
        $result = mysql_query($query, $this->db);
        
        return $result;
    }
    
    protected function writeToFile($file_path, $result) {
        
        $file = library\Toolkit::openOrCreateFile($file_path);

        fputcsv($file, array('id', 'content'));

        while ($row = mysql_fetch_assoc($result)) {
            
            $merged_string = $row['title'] . " " . $row['abstract'];

            $merged_array = array($row['contentID'], $merged_string);

            fputcsv($file, $merged_array);
        }
        fclose($file);
        
    }
           
}
