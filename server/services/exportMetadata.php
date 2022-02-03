<?php

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';


function export($export_format, $metadata_json) {
    $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
    $ini_array = library\Toolkit::loadIni($INI_DIR);
    $apiclient = new \headstart\library\APIClient($ini_array);


    $payload = $metadata_json;
    $res = $apiclient->call_persistence("export/" . $export_format, $payload);
    return $res;
};

use headstart\library;

$format = (isset($_REQUEST['format'])) ? $_REQUEST['format'] : "bibtex";
$download = (isset($_REQUEST['download'])) ? $_REQUEST['download'] : false;
$metadata_json = library\CommUtils::getParameter($_POST, "metadata");
$result = export($format, $metadata_json);

if (isset($result["status"]) && $result["status"] === "error") {
    return json_encode($result);
}

if (isset($download) & $download==true ) {
    header('Content-type: application/text');
    header('Content-Disposition: attachment; filename=metadata.' . $format);
} else {
    header('Content-type: text/plain');
}

$origin = $_SERVER['HTTP_ORIGIN'];
$allowed_domains = [
    'http://openknowledgemaps.org',
    'https://openknowledgemaps.org',
    'http://dev.openknowledgemaps.org',
    'https://dev.openknowledgemaps.org'
];

if (in_array($origin, $allowed_domains)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

echo $result

?>
