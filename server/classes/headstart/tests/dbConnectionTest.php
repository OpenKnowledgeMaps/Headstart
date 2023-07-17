<?php

use PHPUnit\Framework\TestCase;

use headstart\persistence\SQLitePersistence as SQLitePersistence;
//use app\persistence\SQLitePersistence as SQLitePersistence;

//use headstart\tests\test_data as test_data;
//use app\storage as storage;

class DbConnectionTest extends TestCase
{
    protected static $persistence;
    private $db_path;


    protected function setUp(): void
    {
        parent::setUp();

//        require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';

//        $this->db_path = '/../../storage/tmp_test.sqlite';
//        $db_path = '/app/storage/test.sqlite';
//        $db_path = dirname(__FILE__) . '/../../storage/tmp_test.sqlite';
//        self::$persistence = new SQLitePersistence($db_path);
        
// Specify the folder path
        $folderPath = __DIR__ . '/../tests/test_data/';

// Create a temporary filename
        $tempFile = tempnam($folderPath, 'temp_test_db');

// Rename the temporary file with the desired name
        $newFile = $tempFile . '.sqlite';
        rename($tempFile, $newFile);
        self::$persistence = new SQLitePersistence($folderPath . $newFile);

    }


    protected function tearDown(): void
    {
//        self::$persistence = null;

        // Clean up the temporary database file after the test
        if (file_exists($this->db_path)) {
            unlink($this->db_path);
        }

        parent::tearDown();

    }

    public function testCreateTables(): void
    {
        var_dump("createTables started");
        self::$persistence->createTables();
        var_dump("createTables ended");
    }


    public function testDbConnection($vis_id = 'd161dba364a1e8c0468b9c74407e3575'): void
    {
        var_dump("testDbConnection started");

        $data = self::$persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
//        var_dump($data);
        var_dump("testDbConnection ended");
    }


    public function testCreateVisualization($vis_id, $vis_title, $data, $vis_clean_query = null, $vis_query = null, $params = null): void
    {
        self::$persistence->createVisualization($vis_id, $vis_title, $data, $vis_clean_query = null, $vis_query = null, $params = null);
    }

//    get variables from json

    function getJson($jsonFilePath)
    {
        $json = file_get_contents($jsonFilePath);
        return json_decode($json);
    }


////    todo: testWriteToDbTest() is not working yet
//    public function testWriteToDbTest(): void
//    {
//        var_dump("testWriteToDbTest started");
//
//        //    load json
//        $jsonFilePath = 'app/tests/test_data/digital-education.json';
////        $jsonFilePath = headstart\tests\test_data::getTestDataPath() . 'digital-education.json';
////        $jsonFilePath = test_data::getTestDataPath() . 'digital-education.json';
//        $json = file_get_contents($jsonFilePath);
//        $jsonData = json_decode($json, true);
//        //    var_dump($jsonData);
//        //    var_dump($jsonData['context']);
//
//        $jsonObject = json_decode($json);
//        var_dump($jsonObject);
////        var_dump($jsonObject->context->query);
////        var_dump($jsonObject->context->params);
//
//
////        $unique_id = $jsonData['context']['id'];
//        $dirty_query = $jsonObject->context->query;
//        var_dump($dirty_query);
//        $query = cleanQuery($dirty_query, $transform_query_tolowercase = true, $add_slashes = true);
//        $unique_id = $jsonObject->context->id;
//        $service = $jsonObject->context->service;
//        $vis_title = $service;
//        $params_json = json_decode($jsonObject->context->params);
//        //    $params_json = packParamsJSON($param_types, $post_params);
//
////        self::$persistence->createVisualization($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);
//
//        // Mock the persistence object
//        $persistenceMock = $this->createMock(headstart\persistence\SQLitePersistence::class);
//        $persistenceMock->expects($this->once())
//            ->method('createVisualization')
//            ->with($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);
//
//        // Replace the real persistence object with the mock
//        $this->persistence = $persistenceMock;
//
//        // Test the method that depends on the mocked persistence object
//        $this->persistence->createVisualization($unique_id, $vis_title, $jsonObject, $query, $dirty_query, $params_json);
//
////        $res = getLatestRevisions();
////        var_dump($res);
//        var_dump("testWriteToDbTest ended");
//
//    }
}

