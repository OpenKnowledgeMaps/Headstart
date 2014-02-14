<?php

/*
 * This script queries Zemanta and OpenCalais, in order to (1) find names for
 * the areas (clusters), and (2) to get all topics related to an area (cluster).
 * 
 * The script uses cUrl multi for parallel access to the APIs.
 * 
 * 
 */

require 'lib/inflector.php';

require 'lib/toolkit.php';

if(file_exists('config_local.php')) {
    include 'config_local.php';
} else {
    include 'config.php';
}

//Output of scaling and clustering script
$CLUSTERS = "../output_scaling_clustering.csv";

//Constants for column numbers in the scaling and clustering output
$LINE_CLUSTER_ID = 10;
$LINE_TITLE = 0;
$LINE_ABSTRACT = 3;

//Output file
$OUTPUT_FILE = "../output_naming.csv";

//English stop word file
$STOP_WORDS = "english.stop";

//Output file for the full API responses
$FULL_ZEMANTA = "/full_responses/zemanta/";
$FULL_CALAIS = "/full_responses/calais/";

//Thresholds for n-grams
$THRESHOLD_TITLE_NGRAMS = 2;
$THRESHOLD_TITLE_ABSTRACT_NGRAMS = 4;
$THRESHOLD_SINGLE_WORDS = 5;

//An array of names that are not allowed as a name for a research area (e.g. because they are too generic)
$FORBIDDEN_NAMES = array("research"
    , "science"
    , "inquiry"
    , "learning");

$cluster = array();
$cluster_details = array("title" => array(), "abstracts" => array());
$counts = array();
$stop_words = array();
$output = array();

$cluster_text_file = fopen($CLUSTERS, "r");
$stop_words_file = fopen($STOP_WORDS, "r");

while (($line = fgetcsv($stop_words_file, null, "\t")) !== false) {
    $stop_words[] = $line[0];
}

$row = 0;

while (($line = fgetcsv($cluster_text_file, null)) !== false) {
    if ($row == 0) {
        $output[] = $line;
        $row++;
        continue;
    }
    
    $output[] = $line;
    
    if (!isset($cluster[$line[$LINE_CLUSTER_ID]])) {
        $cluster[$line[$LINE_CLUSTER_ID]] = $line[$LINE_TITLE] . ". " . $line[$LINE_ABSTRACT];
        $cluster_details[$line[$LINE_CLUSTER_ID]]["title"] = $line[$LINE_TITLE] . ".";
        $cluster_details[$line[$LINE_CLUSTER_ID]]["abstracts"] = $line[$LINE_ABSTRACT];
        $counts[$line[$LINE_CLUSTER_ID]] = 1;
    } else {
        $cluster[$line[$LINE_CLUSTER_ID]] .= "\n" . $line[$LINE_TITLE] . ". " . $line[$LINE_ABSTRACT];
        $cluster_details[$line[$LINE_CLUSTER_ID]]["title"] .= "\n" . $line[$LINE_TITLE] . ".";
        $cluster_details[$line[$LINE_CLUSTER_ID]]["abstracts"] .= "\n" . $line[$LINE_ABSTRACT];
        $counts[$line[$LINE_CLUSTER_ID]]++;
    }
}

//Initialize cURL multi
$mh_calais_array = array();
$counter = 0;
$mh_calais_array_counter = 0;

$mh_zemanta = curl_multi_init();
$curl_calais_array = array();
$curl_zemanta_array = array();

foreach ($cluster as $id => $text) {
    
    //Open Calais only allows only for 4 requests at a given time
    if($counter % 4 == 0) {
        $mh_calais_array_counter++;
        $mh_calais_array[$mh_calais_array_counter] = curl_multi_init();
    }
    $counter++;
    
    $curl_calais_array[$id] = createNewCurlHandleCalais($text, "application/json");
    $curl_zemanta_array[$id] = createNewCurlHandleZemanta($text, "json");

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




//
$cluster_names = array();

foreach ($cluster as $id => $text) {

    info($text);

    $categories = array("topics" => array(), "topics_title" => array());
    $categories_one = array("topics" => array());

    //get 1-grams
    $response_object_one = getNgrams($cluster[$id], 1);
    
    processNgrams($response_object_one, "topics_title", $categories_one, $THRESHOLD_SINGLE_WORDS);
    
    //get 2-, 3-, and 4-grams
    for ($n = 4; $n >= 2; $n--) {

        $response_object = getNgrams($cluster[$id], $n);
        $response_object_title = getNgrams($cluster_details[$id]["title"], $n);

        arsort($response_object);

        processNgrams($response_object_title, "topics_title", $categories, $THRESHOLD_TITLE_NGRAMS);
        
        processNgrams($response_object, "topics", $categories, $THRESHOLD_TITLE_ABSTRACT_NGRAMS);
        
    }

    info($id . ": " . print_r($categories, true));
    
    $result_calais = curl_multi_getcontent($curl_calais_array[$id]);
    $cluster_names_calais = getClusterNamesCalais($result_calais);
    curl_multi_remove_handle($mh_calais, $curl_calais_array[$id]);
    
    $result_zemanta = curl_multi_getcontent($curl_zemanta_array[$id]);
    $cluster_names_zemanta = getClusterNamesZemanta($result_zemanta);
    curl_multi_remove_handle($mh_zemanta, $curl_zemanta_array[$id]);
    
    $cluster_name = "";
    
    //Search for 4-, 3-, and 2-title-grams in Calais concepts
    $cluster_name = compareConcepts($cluster_names_calais, $categories, "topics_title");
    
    //If that fails, search for 4-, 3-, and 2-title-grams in Zemanta concepts
    if($cluster_name == "") {
        $cluster_name = compareConcepts($cluster_names_zemanta, $categories, "topics_title");
    }
    
    //If that fails, search for 4-, 3-, and 2-grams in Zemanta concepts
    if($cluster_name == "") {
        $cluster_name = compareConcepts($cluster_names_zemanta, $categories, "topics");
    }
    
    //If that fails, search for 1-grams in Zemanta concepts
    if ($cluster_name == "") {

        $count_new = 0;

        $filtered_array = array_filter($categories_one["topics_title"], function ($item) {
                global $FORBIDDEN_NAMES;

                return !in_array($item, $FORBIDDEN_NAMES);
            });

        info("Filtered Array: " . print_r($filtered_array, true));


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
    
    $cluster_id = generateUriFromString($cluster_name);
    
    $cluster_temp = $cluster_id;
    $count = 1;
    
    foreach($cluster_names as $attributes) {
        if($attributes["uri"] == $cluster_id) {
            $cluster_id = $cluster_temp . "-" . $count;
            $count++;
        }
    }
    
    $cluster_names[$id] = array("name" => $cluster_name, "uri" => $cluster_id);

    info("*** CLUSTER NAME: " . $cluster_name . "\n");
    
    //Write full response for later consultation
    
    getFullResponseZemanta($text, $cluster_id, dirname(__FILE__) . "/full_responses/zemanta/");
    
    getFullResponseCalais($text, $cluster_id, dirname(__FILE__) ."/full_responses/calais/");
}

curl_multi_close($mh_calais);
curl_multi_close($mh_zemanta);

//add areas to output array
array_push($output[0], "area_uri", "area");

info(sizeof($output) . "\n");
$size = sizeof($output);

for($counter = 1; $counter < $size; $counter++) {
    
    $cluster_id = $output[$counter][$LINE_CLUSTER_ID];
    array_push($output[$counter], $cluster_names[$cluster_id]["uri"], $cluster_names[$cluster_id]["name"]);
    
    info("$counter\n");
}

$output_handle = fopen($OUTPUT_FILE, "w+");

foreach ($output as $line) {
    fputcsv($output_handle, $line);
}

fclose($output_handle);


function compareConcepts($cluster_names, $categories, $categories_part) {
    
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

function processNgrams($response_object, $category_title, &$categories_object, $threshold) {
    
    global $stop_words;
    
    foreach ($response_object as $name => $count) {
        $name_array = preg_split('/ /', $name);

        //first and last word should not be a stop word
        if (!in_array($name_array[0], $stop_words)
                && !in_array($name_array[count($name_array) - 1], $stop_words)
                && $count >= $threshold) {
            $categories_object[$category_title][] = $name;
        }
    }
}

function getNgrams($text, $n = 3) {
    
    $ngrams = array();
    $new_string = preg_replace('/[^a-zA-Z0-9\s]/', '', $text);
    $new_string = strtolower($new_string);
    $tokens = preg_split('/\s/', $new_string);
    $len = count($tokens);
    for ($i = 0; $i < $len - $n; $i++) {
        $ng = '';
        for ($j = $i; $j < $i + $n; $j++) {
            $ng .= Inflector::singularize(trim($tokens[$j])) . " ";
        }

        $ng = trim($ng);

        if (isset($ngrams[$ng]))
            $ngrams[$ng]++;
        else
            $ngrams[$ng] = 1;
    }
    return $ngrams;
}

function createNewCurlHandleCalais($text, $format) {
    
    global $API_KEY_CALAIS;
    
    $apiKey = $API_KEY_CALAIS;

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

function createNewCurlHandleZemanta($text, $format) {
    
    global $API_KEY_ZEMANTA;
    
    $url = 'http://api.zemanta.com/services/rest/0.0/';
    $key = $API_KEY_ZEMANTA;
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

function getClusterNamesCalais($response) {
    
    $response_object = json_decode($response);

    $categories = array("topics" => array(), "topics_format" => array());

    foreach ($response_object as $entity => $attributes) {
        if ($entity == "doc") {
            continue;
        }

        switch ($attributes->_typeGroup) {
            case "socialTag" : {
                    $categories["topics"][] = $attributes->name;

                    $final_string = getFormattedString($attributes->name);

                    $categories["topics_format"][] = $final_string;
                    break;
                }

            default :
                continue;
        }
    }

    info("Calais: " . print_r($categories["topics_format"], true));

    return $categories;
}

function getClusterNamesZemanta($response) {

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
                    $categories["topics_format"][] = getFormattedString($site->title);
                    $count++;
                }
            }
        }
    }

    info("Zemanta: " . print_r($categories["topics_format"], true));

    return $categories;
}

function getFullResponseCalais($text, $uri, $dir) {
    
    $ch = createNewCurlHandleCalais($text, "XML/RDF");
    $response = curl_exec($ch);
    curl_close($ch);
    
    file_put_contents($dir . $uri . ".rdf", $response);
}

function getFullResponseZemanta($text, $uri, $dir) {
    
    $ch = createNewCurlHandleZemanta($text, "rdfxml");
    $response = curl_exec($ch);
    curl_close($ch);
    
    file_put_contents($dir . $uri . ".rdf", $response);
}

function getFormattedString($old_string) {
    
    $new_string = preg_replace('/[^a-zA-Z0-9\s]/', '', strtolower($old_string));
    $new_string_array = preg_split('/ /', $new_string);
    $final_string = "";
    foreach ($new_string_array as $string) {
        $final_string .= Inflector::singularize($string) . " ";
    }

    return trim($final_string);
}

?>
