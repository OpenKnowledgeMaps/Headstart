<?php

namespace headstart\library\tests\functions;

use PHPUnit\Framework\TestCase;
use org\bovigo\vfs\vfsStream;
use org\bovigo\vfs\vfsStreamDirectory;
use headstart\library\Toolkit;

require_once __DIR__ . "/../../Toolkit.php";

class ToolkitTest extends TestCase {
    private vfsStreamDirectory $root;

    protected function setUp(): void {
        $this->root = vfsStream::setup('root');
    }

    /**
     * Testing function - loadIni.
     *
     * Loads a `config_local.ini` correctly when it is exists
     * and ignore a `config.ini`.
     */
    public function testLoadIniLoadsLocalConfigWhenExists(): void {
        $configContent = "[database]\nhost = default_db_host";
        $localConfigContent = "[database]\nhost = local_db_host";

        vfsStream::newFile('config.ini')->withContent($configContent)->at($this->root);
        vfsStream::newFile('config_local.ini')->withContent($localConfigContent)->at($this->root);

        $result = Toolkit::loadIni($this->root->url() . '/');
        $expected = [
            'database' => [
                'host' => 'local_db_host'
            ]
        ];

        $this->assertEquals($expected, $result);
    }

    /**
     * Testing function - loadIni.
     *
     * Function returns false if no configuration files were found.
     */
    public function testLoadIniReturnsFalseWhenNoConfigFilesExist(): void {
        $result = @Toolkit::loadIni($this->root->url() . '/');
        $this->assertFalse($result);
    }

    /**
     * Testing function - loadIni.
     *
     * Function loads a `config.ini` by default if a `config_local.ini` is missing.
     */
    public function testLoadIniLoadsDefaultConfigWhenLocalIsMissing(): void {
        $configContent = "[server]\nurl = https://some-example.com";
        vfsStream::newFile('config.ini')->withContent($configContent)->at($this->root);

        $result = Toolkit::loadIni($this->root->url() . '/');
        $expected = [
            'server' => [
                'url' => 'https://some-example.com'
            ]
        ];

        $this->assertEquals($expected, $result);
    }
}