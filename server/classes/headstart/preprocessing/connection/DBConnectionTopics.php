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
    
    public function writeKeywordsToDB($conference_id) {
        
         $query = "SELECT content.contentID, content.keywords
                            FROM content
                            WHERE content.contentID=content.contentID";
        
        $query .= $this->createConferenceIDString($conference_id);

        $result = mysql_query($query);
        
        $keyword_array = array();
        
        while ($row = mysql_fetch_assoc($result)) {
            
            $keyword_array[$row['contentID']]["topics"] = explode(", ", $row['keywords']);
            
        }
        
        $this->writeTopicsToDB($keyword_array, "keywords");
        
    }
    
    public function writeCoocFile($conference_id, $cut_off, $file_path, $api, $normalizeStrings=false) {
        $query = "SELECT DISTINCT concepts.contentID, concepts.conceptName, concepts.conceptAPI
                            FROM concepts, content
                            WHERE concepts.contentID = content.contentID";
        
        $query .= $this->createConferenceIDString($conference_id);
        
        if($api != null) {
            $query .= $this->createApiString($api);
        }

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
            
            if($normalizeStrings) {
                $terms1 = array_map('headstart\library\Toolkit::normalizeString', $terms1);
            }
            
            foreach($topic_array as $id2 => $terms2) {
                if($id1 == $id2)
                    continue;
                
                if($normalizeStrings) {
                    $terms2 = array_map('headstart\library\Toolkit::normalizeString', $terms2);
                }                
                
                $terms1_unique = array_unique($terms1);
                $terms2_unique = array_unique($terms2);

                $out = array($id1, $id2, count(array_intersect($terms1_unique, $terms2_unique)));
                fputcsv($file, $out);
            }
        }
        
        fclose($file);
    }
    
    protected function formatStrings($string) {
        
    }
}
