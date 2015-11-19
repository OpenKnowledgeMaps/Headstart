<?php

namespace headstart\preprocessing\naming;

/**
 * Naming the clusters with the APIs of Zemanta and OpenCalais
 *
 * @author pkraker
 */

require_once 'Naming.php';

class KeywordNaming extends Naming {

    public function performNaming(&$array, $num_keywords, $id="area_uri", $subjects="subject") {
        
        $working_array = array();

            foreach($array as $entry) {
                $uri = $entry[$id];
                $keywords = split("; ", $entry[$subjects]);
                foreach($keywords as &$keyword) {
                    $keyword = substr($keyword, strrpos($keyword, "/") + 1);
                }

                if(isset($working_array[$uri])) {
                    $working_array[$uri] = array_merge($working_array[$uri], $keywords);
                } else {
                    $working_array[$uri] = $keywords;
                }
            }
            
            $result_array = array();
            foreach($working_array as $key => $current_array) {
                $counted_sorted_array = array_count_values($current_array);
                arsort($counted_sorted_array);
                $important_terms = array_keys(array_slice($counted_sorted_array, 0, $num_keywords));
                $final_string = implode(", ", $important_terms);
                $result_array[$key] = $final_string;
            }
            
            foreach($array as $key => $entry) {
                $array[$key]["area"] = $result_array[$entry[$id]];
            }
        
    }
}
