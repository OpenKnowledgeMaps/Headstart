<html>
    <head>
    </head>
    <body>
        <?php
        require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
        require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
        require dirname(__FILE__) . '/../classes/headstart/preprocessing/naming/KeywordNaming.php';
        require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
        require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

        require 'helper.php';

        use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

        $ini_array = library\Toolkit::loadIni($INI_DIR);

        $dirty_query = library\CommUtils::getParameter($_GET, "q");

        $query = strip_tags($dirty_query);

        $unique_id = addslashes($query);

        $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

        $settings = $ini_array["general"];

        $last_version = $persistence->getLastVersion($query, true);

        if ($last_version != false) {
            $now = new DateTime();
            $last_version_timestamp = new DateTime($last_version["rev_timestamp"]);
            $diff = $last_version_timestamp->diff($now);
            
            if ($diff->d == 0) {
                redirect("http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id);
                return;
            }
        }

        $WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

        $calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
        $output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query);

        //print_r($output);

        $output_json = end($output);

        $output_json = mb_convert_encoding($output_json, "UTF-8");

        if (!library\Toolkit::isJSON($output_json)) {
            echo "Sorry! Something went wrong - most likely we haven't found any documents matching your search term. Please <a href=\"http://" . $settings["host"] . $settings["vis_path"] . "\">go back and try again.</a>";
            //    echo $output_json;
            return;
        }

        $result = json_decode($output_json, true);

        $naming = new \headstart\preprocessing\naming\KeywordNaming($ini_array);
        $naming->performNaming($result, 3);

        $input_json = json_encode($result);

        if ($persistence->getLastVersion($query) == false) {
            $persistence->createVisualization($unique_id, "PLOS Search: " . $query, $input_json);
        } else {
            $persistence->writeRevision($unique_id, $input_json);
        }

        redirect("http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id);
        ?>
    </body>
</html>
