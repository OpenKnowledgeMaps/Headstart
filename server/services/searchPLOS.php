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

        $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

        $ini_array = library\Toolkit::loadIni($INI_DIR);

        $dirty_query = library\CommUtils::getParameter($_GET, "q");

        $query = strip_tags($dirty_query);
        
        $unique_id = $query;

        $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
        
        $settings = $ini_array["general"];
        
        if ($persistence->getLastVersion($unique_id) != null) {
            header("Location: http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id); 
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

        if ($persistence->getLastVersion($unique_id) == null) {
            $persistence->createVisualization($unique_id, "PLOS Search: " .$query, $output_json);
        } else {
            $persistence->writeRevision($unique_id, $output_json);
        }
        ?>
        <?php header("Location: http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id); ?>
    </body>
</html>
