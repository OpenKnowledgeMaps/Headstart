<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$acronymtitle = library\CommUtils::getParameter($_POST, "acronymtitle");

$post_params = $_POST;

$result = search("openaire", $acronymtitle, $post_params, array("project_id",
                                                        "funder",
                                                        "title",
                                                        "funding_tree",
                                                        "call_id",
                                                        "start_date",
                                                        "end_date",
                                                        "oa_mandate",
                                                        "special_clause",
                                                        "organisations",
                                                        "openaire_link",
                                                        "obj_id",
                                                        "acronym"),
            ";", null, false);

echo $result

?>
