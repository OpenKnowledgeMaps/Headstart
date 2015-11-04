<html>
    <head>
    </head>
    <body>
        <?php
        require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
        require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
        require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
        require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

        require 'helper.php';

        use headstart\library;


        function attachMostUsedKeywords(&$array, $num_keywords) {

            $working_array = array();

            foreach($array as $entry) {
                $uri = $entry["area_uri"];
                $keywords = split("; ", $entry["subject"]);
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
                $array[$key]["area"] = $result_array[$entry["area_uri"]];
            }

        }
        
        function redirect($url){
            if (headers_sent()){
              die('<script type="text/javascript">window.location=\''.$url.'\';</script>');
            }else{
              header('Location: ' . $url);
              die();
            }    
        }

        $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

        $ini_array = library\Toolkit::loadIni($INI_DIR);

        $dirty_query = library\CommUtils::getParameter($_GET, "q");

        $query = strip_tags($dirty_query);

        $unique_id = addslashes($query);

        $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

        $settings = $ini_array["general"];

        if ($persistence->getLastVersion($query) != null) {
            redirect("http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id); 
            return;
        }

        $WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

        $calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
        $output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query);

        //print_r($output);

        $output_json = end($output);

        $output_json = mb_convert_encoding($output_json, "UTF-8");

        if(!library\Toolkit::isJSON($output_json)) {
            echo "Sorry! Something went wrong - most likely we haven't found any documents matching your search term. Please <a href=\"http://" . $settings["host"] . $settings["vis_path"] ."\">go back and try again.</a>";
            //    echo $output_json;
            return;
        }
        
        $result = json_decode($output_json, true);
        
        attachMostUsedKeywords($result, 3);
        
        $input_json = json_encode($result);

        if ($persistence->getLastVersion($unique_id) == null) {
            $persistence->createVisualization($unique_id, "PLOS Search: " .$query, $input_json);
        } else {
            $persistence->writeRevision($unique_id, $input_json);
        }
        
        redirect("http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id); 
        
        ?>
    </body>
</html>
