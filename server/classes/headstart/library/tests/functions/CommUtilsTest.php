<?php

namespace headstart\library\tests\functions;

use PHPUnit\Framework\TestCase;
use headstart\library\CommUtils;

require_once __DIR__ . "/../../CommUtils.php";

class CommUtilsTest extends TestCase {
    /**
     * Tests that the output is correctly wrapped in a JSONP callback function
     * when the 'jsoncallback' parameter is provided.
     */
    public function testEchoOrCallbackWithCallback(): void {
        $data = '{"status":"ok"}';
        $params = ['jsoncallback' => 'myFunc'];

        $this->expectOutputString('myFunc({"status":"ok"});');
        CommUtils::echoOrCallback($data, $params);
    }

    /**
     * Tests that raw data is echoed when the 'jsoncallback' parameter
     * is not provided.
     */
    public function testEchoOrCallbackWithoutCallback(): void {
        $data = '{"status":"ok"}';
        $params = [];

        $this->expectOutputString('{"status":"ok"}');
        CommUtils::echoOrCallback($data, $params);
    }

    /**
     * Tests that the correct value is returned for a parameter that exists
     * in the input array.
     */
    public function testGetParameterExists(): void {
        $params = ['id' => '123', 'query' => 'test'];

        $this->assertEquals('123', CommUtils::getParameter($params, 'id'));
        $this->assertEquals('test', CommUtils::getParameter($params, 'query'));
    }

    /**
     * Tests that an Exception is thrown when a requested parameter
     * does not exist in the input array.
     */
    public function testGetParameterNotExists(): void {
        $params = ['id' => '123'];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('The following parameter is not set: query');
        CommUtils::getParameter($params, 'query');
    }
}