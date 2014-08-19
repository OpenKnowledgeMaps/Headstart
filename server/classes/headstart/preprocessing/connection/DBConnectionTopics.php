<?php

namespace headstart\preprocessing\connection;

/**
 * Description of DBConnectionTopics
 *
 * @author pkraker
 */

use headstart\library;

class DBConnectionTopics extends DBConnectionWordnet {
    
    public function writeTopicsToDB($topics, $api) {      
        
        foreach($topics as $id => $values) {
            $rank = 1;
            
            foreach($values["topics"] as $value) {
            
                $query = sprintf("INSERT INTO concepts (contentID,conceptName,conceptAPI,conceptRank) VALUES(%d, \"%s\", \"%s\", %d)",
                        mysql_real_escape_string($id), mysql_real_escape_string($value), mysql_real_escape_string($api), 
                        mysql_real_escape_string($rank));

                $result = mysql_query($query, $this->db);

                if(!$result) {
                    echo mysql_error();
                }

                $rank++;
            }
        }
    }
    
    public function writeCoocFile($conference_id, $cut_off, $file_path) {
        $query = "SELECT DISTINCT concepts.contentID, concepts.conceptName, concepts.conceptAPI
                            FROM concepts, content
                            WHERE concepts.contentID = content.contentID";
        
        $query .= $this->createConferenceIDString($conference_id);

        $result = mysql_query($query);
        
        if($result == false) {
            throw new \Exception("Query failed! " . mysql_error());
        }
        
        $topic_array = array();

        while ($row = mysql_fetch_assoc($result)) {
            
            $topic_array[$row['contentID']][] = $row['conceptName'];
            
        }
        
        $file = library\Toolkit::openOrCreateFile($file_path);
        
        foreach($topic_array as $id1 => $terms1) {
            foreach($topic_array as $id2 => $terms2) {
                if($id1 == $id2)
                    continue;

                $terms1 = array_unique($terms1);
                $terms2 = array_unique($terms2);

                $out = array($id1, $id2, count(array_intersect($terms1, $terms2)));
                fputcsv($file, $out);
            }
        }
        
        fclose($file);
    }
    
    protected function formatStrings($string) {
        
    }
}
