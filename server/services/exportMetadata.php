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


$result = '@article{007f9e706022c47e76dc473387c78cd95c867ccd10a962ea6daa9fdeca329ca0,
    title={Calcium deposition within coronary atherosclerotic lesion: Implications for plaque stability},
    author={Hiroyuki Jinnouchi, Yu Sato, Atsushi Sakamoto, Anne Cornelissen, Masayuki Mori, Rika Kawakami, Neel V. Gadhoke, Frank D. Kolodgie, Renu Virmani, Aloke V. Finn},
    year={2020},
    journal={Atherosclerosis},
    volume={306},
    pages={85--95}
    issn={0021-9150}
    doi={10.1016/j.atherosclerosis.2020.05.017}
}';


if (isset($download) & $download==true ) {
    header('Content-type: application/text');
    header('Content-Disposition: attachment; filename=metadata.' . $format);
} else {
    header('Content-type: text/plain');
}

echo $result

?>
