<?php

namespace headstart\tests;

require_once("autoload.inc.php"); // use some autoloading script that was already present


use headstart\persistence\Persistence;
use headstart\persistence\PostgresPersistence;
use headstart\library\APIClient;
use PHPUnit\Framework\TestCase;

/**
 * @covers \headstart\persistence\PostgresPersistence
 */
class PostgresPersistenceTest extends TestCase
{
    public function testThatInSuccesfulConditionsReturnsAResponseObjectWeCanHandle(): void {
        $apiclient = $this->createMock(APIClient::class);
        $jsonFilePath = __DIR__ . "/test_data/successfulGetContextResponse.json";
        $jsonStringFromApi = file_get_contents($jsonFilePath); // returns string
        $mockResponse = [
            "result" => $jsonStringFromApi,
            "httpcode" => 200
        ];
        $apiclient->method("call_persistence")->willReturn($mockResponse);
        $persistence = new PostgresPersistence($apiclient);
        $response = $persistence->getContext($vis_id);
        $this->assertIsArray($response);
    }

    public function testWhenDBMissingReturnsAResponseObjectWeCanHandle(): void {
        $apiclient = $this->createMock(APIClient::class);
        $jsonFilePath = __DIR__ . "/test_data/unsuccessfulGetContextDBHostCannotBeResolved.json";
        $jsonStringFromApi = file_get_contents($jsonFilePath); // returns string
        $mockResponse = [
            "result" => $jsonStringFromApi,
            "httpcode" => 503
        ];
        $apiclient->method("call_persistence")->willReturn($mockResponse);
        $persistence = new PostgresPersistence($apiclient);
        $response = $persistence->getContext($vis_id);
        var_dump($response);
        $this->assertIsArray($response);
    }

    public function testWhenVisIDNotInDBReturnsAResponseObjectWeCanHandle(): void {
        $apiclient = $this->createMock(APIClient::class);
        $jsonFilePath = __DIR__ . "/test_data/unsuccessfulgetContextResponseVisIdNotInDB.json";
        $jsonStringFromApi = file_get_contents($jsonFilePath); // returns string
        $mockResponse = [
            "result" => $jsonStringFromApi,
            "httpcode" => 200
        ];
        $apiclient->method("call_persistence")->willReturn($mockResponse);
        $persistence = new PostgresPersistence($apiclient);
        $response = $persistence->getContext($vis_id);
        $this->assertIsArray($response);
    }
}