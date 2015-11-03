<?php

namespace headstart\preprocessing\naming;

/**
 * Naming the clusters with the APIs of Zemanta and OpenCalais
 *
 * @author pkraker
 */

use headstart\library;
use headstart\persistence;

require_once 'Naming.php';
require_once '/../../library/Inflector.php';

class ApiNaming extends Naming {
    
    private $stop_words = array();
    
    public function performNaming($working_dir) {
        
        $ini = $this->ini_array["naming"];
        $ini_general = $this->ini_array["general"];
        $ini_output = $this->ini_array["output"];
        $ini_connection = $this->ini_array["connection"];
        
        $WORKING_DIR = $working_dir;
        
        //Output of scaling and clustering script
        $CLUSTERS = $WORKING_DIR . $ini_output["output_scaling_clustering"];
        
        //Output file
        $OUTPUT_FILE = $WORKING_DIR . $ini_output["output_naming"];
                
        //Output file for the full API responses
        $FULL_ZEMANTA = $WORKING_DIR . "full_responses/zemanta/";
        $FULL_CALAIS = $WORKING_DIR . "full_responses/calais/";

        $cluster = array();
        $cluster_details = array("title" => array(), "abstracts" => array());
        $counts = array();
        $stop_words = array();
        $output = array();

        $cluster_text_file = library\Toolkit::openFileForReading($CLUSTERS);
        $stop_words_file = library\Toolkit::openFileForReading($ini_general["preprocessing_dir"] . $ini["stop_words"]);

        while (($line = fgetcsv($stop_words_file, null, "\t")) !== false) {
            $this->stop_words[] = $line[0];
        }

        $row = 0;

        while (($line = fgetcsv($cluster_text_file, null)) !== false) {
            if ($row == 0) {
                $output[] = $line;
                $row++;
                continue;
            }

            $output[] = $line;
            
            $line_cluster_id = intval($ini["line_cluster_id"]);
            $line_title = intval($ini["line_title"]);
            $line_abstract = intval($ini["line_abstract"]);
            
            if(!isset($line[$line_cluster_id])) {
                throw new \Exception("Error in line: " . $line[0]);
            }

            if (!isset($cluster[$line[$line_cluster_id]])) {
                $cluster[$line[$line_cluster_id]] = $line[$line_title] . ". " . $line[$line_abstract];
                $cluster_details[$line[$line_cluster_id]]["title"] = $line[$line_title] . ".";
                $cluster_details[$line[$line_cluster_id]]["abstracts"] = $line[$line_abstract];
                $counts[$line[$line_cluster_id]] = 1;
            } else {
                $cluster[$line[$line_cluster_id]] .= "\n" . $line[$line_title] . ". " . $line[$line_abstract];
                $cluster_details[$line[$line_cluster_id]]["title"] .= "\n" . $line[$line_title] . ".";
                $cluster_details[$line[$line_cluster_id]]["abstracts"] .= "\n" . $line[$line_abstract];
                $counts[$line[$line_cluster_id]]++;
            }
        }

        $topics = $this->executeCurl($cluster);

        $cluster_names = array();

        foreach ($cluster as $id => $text) {

            library\Toolkit::info($text);

            $categories = array("topics" => array(), "topics_title" => array());
            $categories_one = array("topics" => array());

            //get 1-grams
            $response_object_one = $this->getNgrams($cluster[$id], 1);

            $this->processNgrams($response_object_one, "topics_title", $categories_one, $ini["threshold_single_words"]);

            //get 2-, 3-, and 4-grams
            for ($n = 4; $n >= 2; $n--) {

                $response_object = $this->getNgrams($cluster[$id], $n);
                $response_object_title = $this->getNgrams($cluster_details[$id]["title"], $n);

                arsort($response_object);

                $this->processNgrams($response_object_title, "topics_title", $categories, $ini["threshold_title_ngrams"]);

                $this->processNgrams($response_object, "topics", $categories, $ini["threshold_title_abstract_ngrams"]);

            }

            library\Toolkit::info($id . ": " . print_r($categories, true));
            
            $cluster_names_calais = $topics["calais"][$id];
            $cluster_names_zemanta = $topics["zemanta"][$id];

            $cluster_name = "";

            //Search for 4-, 3-, and 2-title-grams in Calais concepts
            $cluster_name = $this->compareConcepts($cluster_names_calais, $categories, "topics_title");

            //If that fails, search for 4-, 3-, and 2-title-grams in Zemanta concepts
            if($cluster_name == "") {
                $cluster_name = $this->compareConcepts($cluster_names_zemanta, $categories, "topics_title");
            }

            //If that fails, search for 4-, 3-, and 2-grams in Zemanta concepts
            if($cluster_name == "") {
                $cluster_name = $this->compareConcepts($cluster_names_zemanta, $categories, "topics");
            }

            //If that fails, search for 1-grams in Zemanta concepts
            if ($cluster_name == "") {

                $count_new = 0;

                $filtered_array = array_filter($categories_one["topics_title"], function ($item) {
                        return !in_array($item, $this->ini_array["naming"]["forbidden_names"]);
                    });

                library\Toolkit::info("Filtered Array: " . print_r($filtered_array, true));


                foreach ($cluster_names_zemanta["topics_format"] as $name) {
                    $key = array_search($name, $filtered_array);
                    if ($key !== false) {
                        $cluster_name = $cluster_names_zemanta["topics"][$count_new];
                        break;
                    }
                    $count_new++;
                }
            }

            //If everything above fails, name the cluster after the most important concept
            //returned by (1) Zemanta or (2) Calais. Finally, name the cluster
            //"Miscellaneous"
            if ($cluster_name == "") {
                if(isset($cluster_names_zemanta["topics"][0])) {
                    $cluster_name = $cluster_names_zemanta["topics"][0];
                } elseif (isset($cluster_names_calais["topics"][0])) {
                    $cluster_name = $cluster_names_calais["topics"][0];
                } else {
                    $cluster_name = "Miscellaneous";
                }
            }

            $cluster_id = library\Toolkit::generateUriFromString($cluster_name);

            $cluster_temp = $cluster_id;
            $count = 1;

            foreach($cluster_names as $attributes) {
                if($attributes["uri"] == $cluster_id) {
                    $cluster_id = $cluster_temp . "-" . $count;
                    $count++;
                }
            }

            $cluster_names[$id] = array("name" => $cluster_name, "uri" => $cluster_id);

            library\Toolkit::info("*** CLUSTER NAME: " . $cluster_name . "\n");

            //Write full response for later consultation

            $this->getFullResponseZemanta($text, $cluster_id, $FULL_ZEMANTA);

            $this->getFullResponseCalais($text, $cluster_id, $FULL_CALAIS);
        }

        //add areas to output array
        array_push($output[0], "area_uri", "area");

        library\Toolkit::info(sizeof($output) . "\n");
        $size = sizeof($output);

        for($counter = 1; $counter < $size; $counter++) {

            $cluster_id = $output[$counter][$line_cluster_id];
            array_push($output[$counter], $cluster_names[$cluster_id]["uri"], $cluster_names[$cluster_id]["name"]);

            library\Toolkit::info("$counter\n");
        }

        $output_handle = library\Toolkit::openOrCreateFile($OUTPUT_FILE);

        foreach ($output as $line) {
            fputcsv($output_handle, $line);
        }

        fclose($output_handle);
        
        $UNIQUE_ID = $ini_output["unique_id"];
        $TITLE = $ini_output["title"];
        $persistence = new persistence\SQLitePersistence($ini_connection["sqlite_db"]);
        
        $header = array_shift($output);
        $json_array = array();
        foreach ($output as $row) {
            $json_array[] = array_combine($header, $row);
        }
        
        $json = json_encode($json_array);
        
        $persistence->createVisualization($UNIQUE_ID, $TITLE, $json);
    }
    
    public function executeCurl($clusters) {
        
        //Initialize cURL multi
        $mh_calais_array = array();
        $counter = 0;
        $mh_calais_array_counter = 0;

        $mh_zemanta = curl_multi_init();
        $curl_calais_array = array();
        $curl_zemanta_array = array();

        foreach ($clusters as $id => $text) {

            //Open Calais only allows only for 4 requests at a given time
            if($counter % 4 == 0) {
                $mh_calais_array_counter++;
                $mh_calais_array[$mh_calais_array_counter] = curl_multi_init();
            }
            $counter++;

            $curl_calais_array[$id] = $this->createNewCurlHandleCalais($text, "application/json");
            $curl_zemanta_array[$id] = $this->createNewCurlHandleZemanta($text, "json");

            curl_multi_add_handle($mh_calais_array[$mh_calais_array_counter], $curl_calais_array[$id]);
            curl_multi_add_handle($mh_zemanta, $curl_zemanta_array[$id]);

        }

        $active1 = null;
        $active2 = null;

        // Run cURL handles
        foreach($mh_calais_array as $mh_calais) {
            do {
                usleep(100000);
                $status = curl_multi_exec($mh_calais, $active1);

            } while ($status === CURLM_CALL_MULTI_PERFORM || $active1 > 0);

            $active1 = null;
        }

        do {

            usleep(10000);
            $status = curl_multi_exec($mh_zemanta, $active2);
            $info = curl_multi_info_read($mh_zemanta);

        } while ($status === CURLM_CALL_MULTI_PERFORM || $active2 > 0);
        
        $topics = array("calais" => array(), "zemanta" => array());
        
        foreach($clusters as $id => $cluster) {
        
            $result_calais = curl_multi_getcontent($curl_calais_array[$id]);
            $topics["calais"][$id] = $this->getClusterNamesCalais($result_calais);
            curl_multi_remove_handle($mh_calais, $curl_calais_array[$id]);

            $result_zemanta = curl_multi_getcontent($curl_zemanta_array[$id]);
            $topics["zemanta"][$id] = $this->getClusterNamesZemanta($result_zemanta);
            curl_multi_remove_handle($mh_zemanta, $curl_zemanta_array[$id]);
        }
        
        curl_multi_close($mh_calais);
        curl_multi_close($mh_zemanta);
        
        return $topics;
        
    }
    
    public function executeCurlSensium($clusters) {
        //Initialize cURL multi
        $mh_sensium_array = array();
        $counter = 0;
        $mh_sensium_array_counter = 0;

        foreach ($clusters as $id => $text) {

            //Open Calais only allows only for 4 requests at a given time
            if($counter % 2 == 0) {
                $mh_sensium_array_counter++;
                $mh_sensium_array[$mh_sensium_array_counter] = curl_multi_init();
            }
            $counter++;

            $curl_sensium_array[$id] = $this->createNewCurlHandleSensium($text);

            curl_multi_add_handle($mh_sensium_array[$mh_sensium_array_counter], $curl_sensium_array[$id]);

        }

        $active1 = null;

        // Run cURL handles
        foreach($mh_sensium_array as $mh_sensium) {
            do {
                usleep(100000);
                $status = curl_multi_exec($mh_sensium, $active1);

            } while ($status === CURLM_CALL_MULTI_PERFORM || $active1 > 0);

            $active1 = null;
        }
        
        $topics = array("sensium" => array());
        
        foreach($clusters as $id => $cluster) {
        
            $result_sensium = curl_multi_getcontent($curl_sensium_array[$id]);
            $topics["sensium"][$id] = $this->getClusterNamesSensium($result_sensium);
            curl_multi_remove_handle($mh_sensium, $curl_sensium_array[$id]);

        }
        
        curl_multi_close($mh_sensium);
        
        return $topics;
    }
    
    private function compareConcepts($cluster_names, $categories, $categories_part) {
    
        $cluster_name = "";
        $count = 0;

        foreach ($cluster_names["topics_format"] as $name) {

            $key = array_search($name, $categories[$categories_part]);
            if (!$key === false) {
                $key = array_search($name, $categories["topics"]);
            }

            if ($key !== false) {
                $cluster_name = $cluster_names["topics"][$count];
                break;
            }
            $count++;
        }

        return $cluster_name;
    
    }

    private function processNgrams($response_object, $category_title, &$categories_object, $threshold) {
        
        $categories_object[$category_title] = array();

        foreach ($response_object as $name => $count) {
            $name_array = preg_split('/ /', $name);

            //first and last word should not be a stop word
            if (!in_array($name_array[0], $this->stop_words)
                    && !in_array($name_array[count($name_array) - 1], $this->stop_words)
                    && $count >= $threshold) {
                $categories_object[$category_title][] = $name;
            }
        }
    }

    private function getNgrams($text, $n = 3) {

        $ngrams = array();
        $new_string = preg_replace('/[^a-zA-Z0-9\s]/', '', $text);
        $new_string = strtolower($new_string);
        $tokens = preg_split('/\s/', $new_string);
        $len = count($tokens);
        for ($i = 0; $i < $len - $n; $i++) {
            $ng = '';
            for ($j = $i; $j < $i + $n; $j++) {
                $ng .= \Inflector::singularize(trim($tokens[$j])) . " ";
            }

            $ng = trim($ng);

            if (isset($ngrams[$ng]))
                $ngrams[$ng]++;
            else
                $ngrams[$ng] = 1;
        }
        return $ngrams;
    }

    private function createNewCurlHandleCalais($text, $format) {

        $apiKey = $this->ini_array["naming"]["api_key_calais"];

        $contentType = "text/xml";
        $outputFormat = $format;

        $metaDataType = "GenericRelations,SocialTags";

        $restURL = "http://api.opencalais.com/enlighten/rest/";
        $paramsXML = "<c:params xmlns:c=\"http://s.opencalais.com/1/pred/\" " .
                "xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> " .
                "<c:processingDirectives c:contentType=\"" . $contentType . "\" " .
                "c:outputFormat=\"" . $outputFormat . "\" c:enableMetadataType=\"" . $metaDataType . "\"" .
                "></c:processingDirectives> " .
                "<c:userDirectives c:allowDistribution=\"false\" " .
                "c:allowSearch=\"false\" c:externalID=\" \" " .
                "c:submitter=\"Calais REST Sample\"></c:userDirectives> " .
                "<c:externalMetadata><c:Caller>Educational Technology</c:Caller>" .
                "</c:externalMetadata>                           
                    </c:params>";


        $data = "licenseID=" . urlencode($apiKey);
        $data .= "&paramsXML=" . urlencode($paramsXML);
        $data .= "&content=" . urlencode($text);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $restURL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        return $ch;

    }

    private function createNewCurlHandleZemanta($text, $format) {

        $url = 'http://api.zemanta.com/services/rest/0.0/';
        $key = $this->ini_array["naming"]["api_key_zemanta"];
        $method = "zemanta.suggest";
        $categories = "dmoz";

        /* It is easier to deal with arrays */
        $args = array(
            'method' => $method,
            'api_key' => $key,
            'text' => $text,
            'format' => $format,
            'return_rdf_links' => 1
            , 'return_categories' => 1
            , 'return_keywords' => 1
            , 'return_images' => 0
            , 'return_categories' => $categories
        );


        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($args, '', '&'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        return $ch;

    }
    
    private function createNewCurlHandleSensium($text) {

        $url = 'https://api.sensium.io/v1/extract';
        $key = $this->ini_array["naming"]["api_key_sensium"];

        $args = array(
            'apiKey' => $key,
            'text' => $text,
            "extractors" => array("Summary")
        );

        $header_args = array(
            'Content-Type: application/json'
            , 'Accept: application/json'
            //, 'Accept-encoding: \'gzip\''
        );
        
        $json_args = json_encode($args);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header_args);
        curl_setopt($ch, CURLOPT_POST, 1);
        //curl_setopt($ch, CURLOPT_PROXY, '127.0.0.1:8888');
        //curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($args, '', '&'));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json_args);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        return $ch;

    }

    private function getClusterNamesCalais($response) {

        $response_object = json_decode($response);

        $categories = array("topics" => array(), "topics_format" => array());

        foreach ($response_object as $entity => $attributes) {
            if ($entity == "doc") {
                continue;
            }

            switch ($attributes->_typeGroup) {
                case "socialTag" : {
                        $categories["topics"][] = $attributes->name;

                        $final_string = library\Toolkit::normalizeString($attributes->name);

                        $categories["topics_format"][] = $final_string;
                        break;
                    }

                default :
                    continue;
            }
        }

        library\Toolkit::info("Calais: " . print_r($categories["topics_format"], true));

        return $categories;
    }

    private function getClusterNamesZemanta($response) {

        $response_object = json_decode($response);

        $categories = array("topics" => array(), "topics_format" => array());

        $links = $response_object->markup->links;
        $count = 0;

        foreach ($links as $link) {
            foreach ($link->target as $site) {
                if (stristr($site->url, "http://dbpedia.org")) {
                    if ($link->entity_type != NULL) {
                        foreach ($link->entity_type as $entity_type) {
                            if (isset($categories[$entity_type])) {
                                $categories[$entity_type][] = $site->title;
                            } else {
                                $categories[$entity_type] = array($site->title);
                            }
                        }
                    } else {
                        $categories["topics"][] = $site->title;
                        $categories["topics_format"][] = library\Toolkit::normalizeString($site->title);
                        $count++;
                    }
                }
            }
        }

        library\Toolkit::info("Zemanta: " . print_r($categories["topics_format"], true));

        return $categories;
    }
    
     private function getClusterNamesSensium($response) {

        $response_object = json_decode($response);

        $categories = array("topics" => array(), "topics_format" => array());

        foreach ($response_object->summary->keyPhrases as $phrase) {

            $categories["topics"][] = $phrase->text;

            $final_string = library\Toolkit::normalizeString($phrase->text);

            $categories["topics_format"][] = $final_string;
        }

        library\Toolkit::info("Sensium: " . print_r($categories["topics_format"], true));

        return $categories;
    }

    private function getFullResponseCalais($text, $uri, $dir) {

        $ch = $this->createNewCurlHandleCalais($text, "XML/RDF");
        $response = curl_exec($ch);
        curl_close($ch);

        library\Toolkit::putContentsToFile($dir . $uri . ".rdf", $response);
    }

    private function getFullResponseZemanta($text, $uri, $dir) {

        $ch = $this->createNewCurlHandleZemanta($text, "rdfxml");
        $response = curl_exec($ch);
        curl_close($ch);

        library\Toolkit::putContentsToFile($dir . $uri . ".rdf", $response);
    }
}
