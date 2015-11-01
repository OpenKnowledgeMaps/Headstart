<?php

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

require 'helper.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$query = library\CommUtils::getParameter($_GET, "q");

$WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

$calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
$output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query);

$output_json = end($output);

//echo $output_json;

$persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$persistence->createVisualization($query, "My Test RPLOS", $output_json);

?>
<html>
    <body>
        Here is the link to your <a href="http://localhost/headstart2/index.php?id=" <?php echo $_GET["q"] ?> target="_blank">visualization</a>
    </body>
</html>
