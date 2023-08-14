<?php

namespace headstart;

//require_once("autoload.inc.php"); // use some autoloading script that was already present

use PHPUnit\Framework\TestCase;

use headstart\persistence\SQLitePersistence as SQLitePersistence;

/**
 * @covers \headstart\persistence\SQLitePersistence
 */
class DbConnectionTest extends TestCase
{

    public function testCreateVisualizationAndRetrieve(): void
    {
        $tempFile = tempnam("/tmp", "test-db");
        $persistence = new SQLitePersistence($tempFile);

        $jsonFilePath = __DIR__ . "/test_data/digital-education.json";

        $data = file_get_contents($jsonFilePath); // returns string

        $jsonObject = json_decode($data); // returns object

        $vis_id = $jsonObject->context->id;
        $vis_title = $jsonObject->context->service;

        // Since this is a totally new SQLite file that we will have each time we need to initialise the tables
        $persistence->createTables();

        // Let's store something in it that looks like a visualisation
        $persistence->createVisualization($vis_id, $vis_title, $data);

        // Now let's try to retrieve the visualisation that we stored
        $resultFromDataBase = $persistence->getLastVersion($vis_id);

//        $persistence->writeRevision($vis_id, $data);

        $jsonRes = $resultFromDataBase["rev_data"];
        $jsonDecoded = json_decode($jsonRes);

        $resId = $jsonDecoded->context->id;
        $resTitle = $jsonDecoded->context->service;

        $this->assertEquals($resId, $vis_id, "actual value of ID is not equals to expected");
        $this->assertEquals($resTitle, $vis_title, "actual value of Title is not equals to expected");
//        does not work anymore for version 10
//        $this->assertObjectHasAttribute("context", $jsonDecoded, "context is not in jsonDecoded");
        $this->assertIsObject($jsonDecoded->context, "context is not an object");
        $this->assertIsString($jsonDecoded->data, "data is not a string");
    }

}

// // structure from Tom
//class DbConnectionTest extends TestCase
//{
//
//    public function testCreateVisualizationAndRetrieve(): void
//    {
//        $tempFile = tempnam("/tmp", "test-db");
//        $persistence = new SQLitePersistence($tempFile);
//        $vis_id = 'd161dba364a1e8c0468b9c7s4407e3575'; // this is just some random hash
//        $vis_title = 'base'; // Is this right? Looks to Tom like vis_title parameter is actually the service name?
//        $data = '{"some": "pretty-empty-json"}'; // here is a very small malformed map json. We could load a proper from disk in the future
//
//        // Since this is a totally new SQLite file that we will have each time we need to initialise the tables
//        $persistence->createTables();
//
//        // Let's store something in it that looks like a visualisation
//        $persistence->createVisualization($vis_id, $vis_title, $data);
//
//        // Now let's try to retrieve the visualisation that we stored
//        $resultFromDataBase = $persistence->getLastVersion($vis_id);
//
//        // Finally let's assert that we get back the response that we expected to get
//        $this->assertEquals($resultFromDataBase, [
//            "rev_data" => $data,
//            0 => $data
//        ]); // quite an interesting response from the Persistence layer, not really what I would have expected
//    }
//
//}

