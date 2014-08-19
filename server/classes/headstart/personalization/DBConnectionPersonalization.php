<?php

namespace headstart\personalization;

/**
 * Description of DBConnectionPersonalization
 *
 * @author pkraker
 */

require dirname(__FILE__) . '/../preprocessing/connection/DBConnection.php';

use headstart\preprocessing\connection;
use headstart\library;

class DBConnectionPersonalization extends connection\DBConnection {
    
    public function getPersonalBookmarks($user_id, $event_id) {
        
        /*$query = sprintf("SELECT DISTINCT content.contentID
            FROM bookmarking, content, userinfo, presentation, eventsession 
            WHERE (userinfo.userID=bookmarking.userID) AND (bookmarking.contentID=content.contentID) 
					AND (bookmarking.contentID=presentation.contentID) AND (presentation.eventSessionID=eventsession.eventSessionID)
                AND (userinfo.userID = %d) AND (eventsession.eventID = %d)", mysql_real_escape_string($user_id), mysql_real_escape_string($event_id));*/

        $query = sprintf("SELECT DISTINCT content.contentID
            FROM bookmarking, content
            WHERE (bookmarking.contentID=content.contentID)
                AND (bookmarking.userID = %d)", mysql_real_escape_string($user_id));
        
        $result = mysql_query($query, $this->db);

        $data = array();
        
        
        while($row = mysql_fetch_assoc($result)) {
           $data[] = $row;
        }
        
        return $data;
        
    }
    
    public function getPersonalRecommendations($user_id, $event_id) {
        
        /*$query = sprintf("SELECT DISTINCT content.contentID
            FROM predictedscore, content, userinfo, presentation, eventsession 
            WHERE (userinfo.userID=predictedscore.userID) AND (predictedscore.contentID=content.contentID) 
					AND (predictedscore.contentID=presentation.contentID) AND (presentation.eventSessionID=eventsession.eventSessionID)
                AND (userinfo.userID = %d) AND (eventsession.eventID = %d)", mysql_real_escape_string($user_id), mysql_real_escape_string($event_id));*/
        
        $query = sprintf("SELECT DISTINCT content.contentID
            FROM predictedscore, content
            WHERE (predictedscore.contentID=content.contentID)
                AND (predictedscore.userID = %d)", mysql_real_escape_string($user_id));


        $result = mysql_query($query, $this->db);

        $data = array();
        
        if($result) {
            while($row = mysql_fetch_assoc($result)) {
               $data[] = $row;
            }
        }
        
        return $data;
        
    }
    
    public function addPersonalBookmark($user_id, $content_id) {
        
        $query = sprintf("INSERT INTO bookmarking(contentID, userID, created)
            VALUES(%d, %d, now())", mysql_real_escape_string($content_id), mysql_real_escape_string($user_id));


        $result = mysql_query($query, $this->db);

        return ($result != false)?(true):(false);
        
    }
    
    public function removePersonalBookmark($user_id, $content_id) {
        
        $query = sprintf("DELETE FROM bookmarking
            WHERE contentID=%d AND userID=%d", mysql_real_escape_string($content_id), mysql_real_escape_string($user_id));


        $result = mysql_query($query, $this->db);

        return ($result != false)?(true):(false);
        
    }
    
    public function getConferenceBookmarks($conference_id) {
               
        $query = sprintf("SELECT bookmarking.bookmarkingID, bookmarking.userID, bookmarking.contentID 
            FROM bookmarking, content 
            WHERE (bookmarking.contentID=content.contentID) AND (content.contentType <> %s)"
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
            library\Toolkit::addOrInitiatlizeArrayKeyNumerical($bookmark_array, $row['contentID']);
        }
        
        $return_array = array();
        
        foreach ($bookmark_array as $id => $num) {
            $return_array[] = array("id" => $id, "num" => $num);
        }
        
        return $return_array;
    }
    
}
