<?php

namespace headstart\library\tests\functions;

use PHPUnit\Framework\TestCase;
use org\bovigo\vfs\vfsStream;
use org\bovigo\vfs\vfsStreamDirectory;
use headstart\library\Toolkit;

require_once __DIR__ . "/../../Toolkit.php";

class ToolkitFileSystemTest extends TestCase {
    private vfsStreamDirectory $root;

    protected function setUp(): void {
        $this->root = vfsStream::setup('root');
    }

    /**
     * Testing method: openOrCreateFile.
     *
     * File creation test.
     */
    public function testCreatesFileInRoot(): void {
        $filename = vfsStream::url('root/test.txt');

        $handle = Toolkit::openOrCreateFile($filename);

        $this->assertIsResource($handle);
        fclose($handle);
        $this->assertTrue($this->root->hasChild('test.txt'));
    }

    /**
     * Testing method: openOrCreateFile.
     *
     * File creation with the path to it.
     */
    public function testCreatesDirectoryPathAndFile(): void {
        $filename = vfsStream::url('root/new/path/file.log');

        $this->assertFalse($this->root->hasChild('new'));

        $handle = Toolkit::openOrCreateFile($filename);
        $this->assertIsResource($handle);
        fclose($handle);
        $this->assertTrue($this->root->hasChild('new/path/file.log'));
    }

    /**
     * Testing method: openOrCreateFile.
     *
     * Exception will be thrown if some error occurs.
     */
    public function testThrowsExceptionOnFailure(): void {
        vfsStream::newDirectory('readonly_dir', 0400)->at($this->root);
        $filename = vfsStream::url('root/readonly_dir/data');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("There was an error while opening/creating the following file: " . $filename);

        Toolkit::openOrCreateFile($filename);
    }

    /**
     * Testing method: openFileForReading.
     *
     * An existing file opening.
     */
    public function testOpensExistingAndReadableFileSuccessfully(): void {
        $content = "Hello, world!";
        vfsStream::newFile('document.txt')
            ->withContent($content)
            ->at($this->root);
        $filePath = vfsStream::url('root/document.txt');

        $handle = Toolkit::openFileForReading($filePath);

        $this->assertIsResource($handle);
        $this->assertSame($content, fread($handle, strlen($content)));

        fclose($handle);
    }

    /**
     * Testing method: openFileForReading.
     *
     * Exception will be thrown if the file does not exists.
     */
    public function testThrowsExceptionIfFileDoesNotExist(): void {
        $nonExistentFile = vfsStream::url('root/file.log');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("There was an error while opening/creating the following file: " . $nonExistentFile);
        Toolkit::openFileForReading($nonExistentFile);
    }

    /**
     * Testing method: openFileForReading.
     *
     * Exception will be thrown if the file cannot be changes (no rights for editing).
     */
    public function testThrowsExceptionIfFileIsNotReadable(): void {
        $unreadableFile = vfsStream::newFile('secret', 0200)
            ->at($this->root);
        $filePath = $unreadableFile->url();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("There was an error while opening/creating the following file: " . $filePath);
        Toolkit::openFileForReading($filePath);
    }
}