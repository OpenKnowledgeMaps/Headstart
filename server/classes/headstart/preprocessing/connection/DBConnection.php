<?php

namespace headstart\preprocessing\connection;

/**
 * Database class for connecting to a data source and creating the metadata and the
 * cooccurrence file.
 *
 * @author pkraker
 */

require_once 'Connection.php';

use headstart\library;

class DBConnection extends Connection {
    
    protected $ini_array;
    protected $db;
    private $numBookmarks = array();
    
    public function __construct($ini_array) {
        $this->ini_array = $ini_array;
    }

    public function establishConnection() {
        
        $ini = $this->ini_array["connection"];
        
        $this->db = mysql_connect( $ini["host"] . ":" . $ini["port"], 
                $ini["username"], $ini["password"] );
        
        if(!$this->db)
            throw new \Exception("Failed to connect to MySQL: " . mysql_error());
        
        mysql_set_charset('utf8',$this->db);
        
        mysql_select_db($ini["db"]);
    }
     
    public function writeCoocFile($conference_id, $cut_off, $file_path) {
        
        $libraries = $this->getBookmarks($conference_id, $cut_off);
        
        $count = 0;
        
        $cooc = array();
        
        foreach($libraries as $line) {
            fwrite(STDOUT, "Processing line #".$count."\n");
            foreach ($line as $article) {
                
                if (!array_key_exists($article, $this->numBookmarks))
                    continue;
                
                if($article != "") {
                    for($row=0; $row < count($line); $row++) {
                        $coarticle = $line[$row];
                        
                        if (!array_key_exists($coarticle, $this->numBookmarks))
                            continue;
                        
                        if($coarticle != "") {
                            if(!isset($cooc[$article.",".$coarticle])) {
                                $cooc[$article.",".$coarticle] = 1;
                            } else {
                                $cooc[$article.",".$coarticle] += 1;
                                fwrite(STDOUT, "Added to ".$article.",".$coarticle.": ".$cooc[$article.",".$coarticle]."\n");
                            }
                        }
                    }
                }
            }
            $count++;
        }

        arsort($cooc, SORT_NUMERIC);
        

        $file_out = library\Toolkit::openOrCreateFile($file_path);
        foreach($cooc as $entry=>$count) {
            if(intval($count) >= 1) {
                fwrite($file_out, $entry.",".$count."\n");
            }
        }
        fclose($file_out);
    }
    
    public function writeMetadataFile($conference_id, $file, $cut_off) {
        
        $query_authors = sprintf("SELECT DISTINCT content.contentID, author.name
            FROM content, authorpresenter, author 
            WHERE (content.contentID=authorpresenter.contentID) AND (authorpresenter.authorID=author.authorID)
                 AND (content.contentType <> %s)" ,"\"no-paper\"");
        
        $query_authors .= $this->createConferenceIDString($conference_id);
        
        $result_authors = mysql_query($query_authors); 
        
        $paper_authors = array();
        
        while ($row = mysql_fetch_assoc($result_authors)) {
            library\Toolkit::addOrInitiatlizeArrayKey($paper_authors, $row['contentID'], $row['name']);
        }
        
        $query = sprintf("SELECT DISTINCT content.contentID, content.title, content.abstract, content.contentType, content.contentTrack, content.contentLink
            FROM content 
            WHERE (content.contentType <> %s)" ,"\"no-paper\"");
        
        $query .= $this->createConferenceIDString($conference_id);
        
        $result = mysql_query($query);       
        
        $file = fopen($file, "w+");
        
        fputcsv($file, array('id', 'title', 'paper_abstract', 'published_in', 'year', 'url', 'readers', 'authors'));
        
        while ($row = mysql_fetch_assoc($result)) {
            
            if (!array_key_exists($row['contentID'], $this->numBookmarks)) {
                $row[] = 0;
            } else {        
                $row[] = $this->numBookmarks[$row['contentID']];
            }
            
            $author_string = "";

            if(isset($paper_authors[$row['contentID']])) {
                foreach($paper_authors[$row['contentID']] as $author) {
                    $author_string .= $author . ";";
                }     
            }

            $row[] = $author_string;

            fputcsv($file, $row);
        }
       
    }
    
    protected function getBookmarks($conference_id, $cut_off) {
               
        $query = sprintf("SELECT bookmarking.bookmarkingID, bookmarking.userID, bookmarking.contentID 
            FROM bookmarking, presentation, eventsession, content 
            WHERE (bookmarking.contentID=presentation.contentID) AND (bookmarking.contentID = content.contentID)
                AND (presentation.eventSessionID=eventsession.eventSessionID) AND (content.contentType <> %s)"
            ,"\"no-paper\"");
        
        $query .= $this->createConferenceIDString($conference_id);
           
        $result = mysql_query($query);
        
        if (!$result) {
            $message  = 'Invalid Query: ' . mysql_error() . "\n";
            $message .= 'Full query: ' . $query;
            die($message);
        }
        
        $bookmark_array = array();
        
        while ($row = mysql_fetch_assoc($result)) {
            $bookmark_array[] = $row;
            library\Toolkit::addOrInitiatlizeArrayKeyNumerical($this->numBookmarks, $row['contentID']);
        }
        
        if(count($this->numBookmarks) > 0) {

            $this->numBookmarks = array_filter($this->numBookmarks, 
                    function($item) use($cut_off) {
                        return $item >= $cut_off;
                    });
        }
        
        $library_array = array();
        
        foreach($bookmark_array as $line) {
            if(!isset($library_array[$line['userID']]))
                $library_array[$line['userID']] = array($line['contentID']);
            else
                $library_array[$line['userID']][] = $line['contentID'];
        }
        
        return $library_array;
        
    }
    
    protected function createConferenceIDString($conference_id) {
        
        $query = " AND (";
        
        if(is_array($conference_id)) {
            foreach($conference_id as $id) {
                $query .= sprintf("(content.conferenceID=%d) OR ", mysql_real_escape_string($id));
            }
            
            $query = substr($query, 0, strlen($query)-4);
            $query .= ")";
            
        } else {
            $query .= sprintf("content.conferenceID=%d)", mysql_real_escape_string($conference_id));
        }
        
        return $query;
        
    }
    
    protected function createApiString($api) {
        
        $query = " AND (";
        
        if(is_array($api)) {
            foreach($api as $value) {
                $query .= sprintf("(concepts.conceptAPI=\"%s\") OR ", mysql_real_escape_string($value));
            }
            
            $query = substr($query, 0, strlen($query)-4);
            $query .= ")";
            
        } else {
            $query .= sprintf("concepts.conceptAPI=\"%s\")", mysql_real_escape_string($api));
        }
        
        return $query;
        
    }
}
