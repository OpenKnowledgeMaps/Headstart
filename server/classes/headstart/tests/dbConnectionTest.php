<?php

use PHPUnit\Framework\TestCase;

class DbConnectionTest extends TestCase
{
    protected static $persistence;

    public static function setUpBeforeClass(): void
    {
        require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';

        $db_path = '/app/storage/test.sqlite';
        self::$persistence = new headstart\persistence\SQLitePersistence($db_path);
    }

    public static function tearDownAfterClass(): void
    {
        self::$persistence = null;
    }

    public function testDbConnection(): void
    {
        var_dump("testDbConnection started");

        $vis_id = 'd161dba364a1e8c0468b9c74407e3575';

        $data = self::$persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
//        var_dump($data);
        var_dump("testDbConnection ended");
    }

    public function testWriteToDbTest(): void
    {
        var_dump("testWriteToDbTest started");

        //    load json
        $jsonFilePath = '/app/examples/project_website/data/digital-education-lang[].json';
        $json = file_get_contents($jsonFilePath);
        $jsonData = json_decode($json, true);
        //    var_dump($jsonData);
        //    var_dump($jsonData['context']);

        $jsonObject = json_decode($json);
        var_dump($jsonObject);
//        var_dump($jsonObject->context->query);
//        var_dump($jsonObject->context->params);


//        $unique_id = $jsonData['context']['id'];
        $dirty_query = $jsonObject->context->query;
        var_dump($dirty_query);
        $query = cleanQuery($dirty_query, $transform_query_tolowercase = true, $add_slashes = true);
        $unique_id = $jsonObject->context->id;
        $service = $jsonObject->context->service;
        $vis_title = $service;
        $params_json = json_decode($jsonObject->context->params);
        //    $params_json = packParamsJSON($param_types, $post_params);

        //    $persistence->createVisualization($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);
        self::$persistence->createVisualization($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);

//        $res = getLatestRevisions();
//        var_dump($res);
        var_dump("testWriteToDbTest ended");

    }

// //   old version of connection to db test
//  public function testDbConnectionTest(): void
//  {
//    require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';
//
//    $db_path = '/app/storage/test.sqlite';
//    $persistence = new headstart\persistence\SQLitePersistence($db_path);
//
//    $vis_id = 'd161dba364a1e8c0468b9c74407e3575';
//
//    $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
//    var_dump($data);
////    echo($data);
//  }
}

