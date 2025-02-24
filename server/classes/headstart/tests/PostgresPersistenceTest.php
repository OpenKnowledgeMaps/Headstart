<?php

namespace headstart\tests;

require_once("autoload.inc.php"); // use some autoloading script that was already present


use headstart\persistence\Persistence;
use headstart\persistence\PostgresPersistence;
use headstart\library\APIClient;
use PHPUnit\Framework\TestCase;
use headstart\persistence\VisualizationContext;

/**
 * @covers \headstart\persistence\PostgresPersistence
 */
class PostgresPersistenceTest extends TestCase
{
    public function testThatInSuccesfulConditionsReturnsAResponseObjectWeCanHandle(): void {
        $apiclient = $this->getMockedApiclient("successfulGetContextResponse.json", 200);
        $persistence = new PostgresPersistence($apiclient);
        $vis_id = "asdfasdf";
        $response = $persistence->getContext($vis_id);

        $this->assertIsArray($response);
    }

    public function testWhenDBMissingReturnsAResponseObjectWeCanHandle(): void {
        $apiclient = $this->getMockedApiclient("unsuccessfulGetContextDBHostCannotBeResolved.json", 503);
        $persistence = new PostgresPersistence($apiclient);
        $vis_id = "asdfasdf";
        $response = $persistence->getContext($vis_id);

        $this->assertIsArray($response);
    }

    public function testWhenVisIDNotInDBReturnsAResponseObjectWeCanHandle(): void {
        $apiclient = $this->getMockedApiclient("unsuccessfulgetContextResponseVisIdNotInDB.json", 200);
        $persistence = new PostgresPersistence($apiclient);
        $vis_id = "asdfasdf";
        $response = $persistence->getContext($vis_id);

        $this->assertIsArray($response);
    }

    public function testThatInSuccesfulConditionsReturnsAVisualizationContextWeCanHandle(): void {
        $apiclient = $this->getMockedApiclient("successfulGetContextResponse.json", 200);
        $persistence = new PostgresPersistence($apiclient);
        $vis_id = "asdfasdf";
        $response = $persistence->getVisualizationContext($vis_id);

        $this->assertInstanceOf(VisualizationContext::class, $response);
    }

    public function testWhenDBMissingReturnsAVisualizationContextWeCanHandle(): void {
        $apiclient = $this->getMockedApiclient("unsuccessfulGetContextDBHostCannotBeResolved.json", 503);
        $persistence = new PostgresPersistence($apiclient);
        $vis_id = "asdfasdf";
        $response = $persistence->getVisualizationContext($vis_id);

        $this->assertInstanceOf(VisualizationContext::class, $response);
    }

    private function getMockedApiclient(string $jsonFileName, int $statusCode): Apiclient {
        $apiclient = $this->createMock(APIClient::class);
        $jsonFilePath = __DIR__ . "/test_data/" . $jsonFileName;
        $jsonStringFromApi = file_get_contents($jsonFilePath);
        $mockResponse = [
            "result" => $jsonStringFromApi,
            "httpcode" => $statusCode
        ];
        $apiclient->method("call_persistence")->willReturn($mockResponse);
        return $apiclient;
    }
}