<?php
//
//use PHPUnit\Framework\TestCase;
//
//function cleanQuery($dirty_query, $transform_query_tolowercase, $add_slashes) {
//    $query = strip_tags($dirty_query);
//    $query = trim($query);
//
//    if ($transform_query_tolowercase) {
//        $query = strtolower($query);
//    }
//
//    if ($add_slashes) {
//        $query = addslashes($query);
//    }
//
//    return $query;
//}
//
//function packParamsJSON($params_array, $post_params) {
//
//    if($params_array === null) {
//        return null;
//    }
//
//    $output_array = array();
//
//    foreach ($params_array as $entry) {
//        $current_params = library\CommUtils::getParameter($post_params, $entry);
//        $output_array[$entry] = $current_params;
//    }
//
//    return json_encode($output_array);
//}
//
//class WriteToDbTest extends TestCase
//{
//    protected static $persistence;
//
//    public static function setUpBeforeClass(): void
//    {
//        require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';
//
//        $db_path = '/app/storage/test.sqlite';
//        self::$persistence = new headstart\persistence\SQLitePersistence($db_path);
//    }
//
//    public static function tearDownAfterClass(): void
//    {
//        self::$persistence = null;
//    }
//
//    public function testWriteToDbTest(): void
//    {
//        require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';
//
//
//        //    load json
//        $jsonFilePath = '/app/examples/project_website/data/digital-education-lang[].json';
//        $json = file_get_contents($jsonFilePath);
//        $jsonData = json_decode($json, true);
//        //    var_dump($jsonData);
//        //    var_dump($jsonData['context']);
//
//        $jsonObject = json_decode($json);
//        var_dump($jsonObject);
//        var_dump($jsonObject->context->query);
////        var_dump($jsonObject->context->params);
//
//
//        $unique_id = $jsonData['context']['id'];
//        $dirty_query = $jsonObject->context->query;
//        var_dump($dirty_query);
//        $query = cleanQuery($dirty_query, $transform_query_tolowercase = true, $add_slashes = true);
//        $unique_id = $jsonObject->context->id;
//        $service = $jsonObject->context->service;
//        $repo2snapshot = array("plos" => "PLOS"
//                            , "pubmed" => "PubMed"
//                            , "doaj" => "DOAJ"
//                            , "base" => "BASE"
//                            , "openaire" => "OpenAire"
//                            , "gsheets" => "GSheets");
//        $vis_title = $service;
//        $params_json = json_decode($jsonObject->context->params);
//        //    $params_json = packParamsJSON($param_types, $post_params);
//
//        //    $persistence->createVisualization($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);
//        self::$persistence->createVisualization($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);
//
//        $res = getLatestRevisions();
//
//        var_dump($res);
//
//    }
//}
//
