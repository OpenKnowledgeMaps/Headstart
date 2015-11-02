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

        $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

        if ($persistence->getLastVersion($query) != null) {
            echo "Here is the link to your <a href=\"http://localhost/headstart2/index.php?id=" . $query . "\" target=\"_blank\">visualization</a>";
            return;
        }

        $WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

        $calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
        $output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query);

        $output_json = end($output);
        
        if(!library\Toolkit::isJSON($output_json)) {
            echo "Sorry! Something went wrong - most likely we haven't found any documents matching your search term. Please <a href=\"http://localhost/headstart2/search_plos.html\">go back and try again.</a>";
            return;
        }

        if ($persistence->getLastVersion($query) == null) {
            $persistence->createVisualization($query, "My Test RPLOS", $output_json);
        } else {
            $persistence->writeRevision($query, $output_json);
        }
        ?>
        Here is the link to your <a href="http://localhost/headstart2/index.php?id=<?php echo $query ?>" target="_blank">visualization</a>
    </body>
</html>
