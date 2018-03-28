<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$acronym = library\CommUtils::getParameter($_POST, "acronym");

$post_params = $_POST;

$result = search("openaire", $acronym, $post_params, array("project_id",
                                                        "funder",
                                                        "title",
                                                        "funding_tree",
                                                        "call_id",
                                                        "start_date",
                                                        "end_date",
                                                        "oa_mandate",
                                                        "special_clause",
                                                        "organisations",
                                                        "openaire_link"),
            ";", null);

echo $result

?>
