<?php

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
use headstart\library;

function export($export_format, $metadata_json) {
    $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
    $ini_array = library\Toolkit::loadIni($INI_DIR);
    $apiclient = new \headstart\library\APIClient($ini_array);


    $payload = $metadata_json;
    #$res = $apiclient->call_persistence("export/" . $export_format, $payload);
    $res = $apiclient->call_api("export/" . $export_format, $payload);
    return $res;
};

$json = $_POST['paper'];
$format = (isset($_REQUEST['format'])) ? $_REQUEST['format'] : "bibtex";
$download = (isset($_REQUEST['download'])) ? $_REQUEST['download'] : false;
$result = export($format, $json);

if (isset($result["status"]) && $result["status"] === "error") {
    header('Content-type: application/json');
    echo json_encode($result);
}

if ($format == "bibtex") {
    $format = "bib";
}

if (isset($download) & $download==true ) {
    header('Content-type: application/text');
    header('Content-Disposition: attachment; filename=metadata.' . $format);
} else {
    header('Content-type: text/plain');
}

$result = json_decode($result["result"], true);
echo $result["export"];

?>
