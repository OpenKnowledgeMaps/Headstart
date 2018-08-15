<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require 'search.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;
$post_params['key'] = $ini_array['naming']['api_key_core'];


$result = search("core", $dirty_query, $post_params, array("article_types", "journals", "from", "to", "sorting", "key"), ";", "/");

echo $result

?>
