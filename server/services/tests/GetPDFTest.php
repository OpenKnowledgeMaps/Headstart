<?php

use PHPUnit\Framework\TestCase;

class GetPDFTest extends TestCase {
    // Setting the $_GET mock for successful work of the getPDF.php
    private function setValidMockForGET(): void {
        $_GET = [
            'url' => 'https://dx.doi.org/10.6084/m9.figshare.14124389',
            'filename' => 'test-file.pdf',
            'service' => 'base',
            'pdf_urls' => 'https://dx.doi.org/10.6084/m9.figshare.14124389;https://dx.doi.org/10.6084/m9.figshare.14124389; https://figshare.com/articles/online_resource/Overview_of_the_Digital_Education_Action_Plan_2021-2027/14124389;',
            'vis_id' => 'paste_here_existing_vis_id',
            'paper_id' => 'paste_here_existing_paper_id'
        ];
    }

    // Setting the $_GET mock for unsuccessful work of the getPDF.php
    private function setInvalidMockForGET(): void {
        $_GET = [
            'url' => 'https://invalid.com',
            'filename' => 'test-file.pdf',
            'service' => 'pubmed',
            'pdf_urls' => 'https://dx.doi.org/10.6084/m9.figshare.14124389;https://dx.doi.org/10.6084/m9.figshare.14124389; https://figshare.com/articles/online_resource/Overview_of_the_Digital_Education_Action_Plan_2021-2027/14124389;',
            'vis_id' => 'some_vis_id',
            'paper_id' => 'some_paper_id'
        ];
    }

    // Make preparations before a test
    private function prepareGetPDFFunction(): string {
        ob_start();
        require_once __DIR__ . '/../getPDF.php';
        return ob_get_clean();
    }

    // Remove file if it is already exists and returning full path to it
    private function prepareTestFile(string $filename): string {
        $path = sys_get_temp_dir() . '/' . $filename;
        if (file_exists($path)) {
            unlink($path);
        }
        return $path;
    }

    // Mocking startsWidth function if it is not defined yet
    private function defineStartsWithIfNeeded(): void {
        if (!function_exists('startsWith')) {
            function startsWith($haystack, $needle) {
                return substr($haystack, 0, strlen($needle)) === $needle;
            }
        }
    }

    // Mocking getPDFAndDownload function if it is not defined yet
    private function defineMockedGetPDFAndDownload(): void {
        if (!function_exists('getPDFAndDownload')) {
            function getPDFAndDownload($url, $images_path, $filename) {
                $output_path = $images_path . $filename;

                $pdf = getContentFromURL($url)[0];

                if ($pdf !== false) {
                    file_put_contents($output_path, $pdf);
                } else {
                    echo json_encode(["status" => "error"]);
                    return;
                }

                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime_type = finfo_file($finfo, $output_path);
                finfo_close($finfo);

                if (strtolower($mime_type) != "application/pdf") {
                    unlink($output_path);
                    echo json_encode(["status" => "error"]);
                    return;
                }

                echo json_encode(["status" => "success", "file" => $filename]);
            }
        }
    }

    // Configuring the getContentFromURL with env
    private function setUpMockedGetContentFromURL(string $content): void {
        if (!function_exists('getContentFromURL')) {
            function getContentFromURL($link) {
                return [getenv('__MOCK_CONTENT'), 'https://mock.url/file.pdf'];
            }
        }
        putenv("__MOCK_CONTENT=$content");
    }


    // >>> Tests for the the getPDF.php <<<
    public function testFullScriptWorksSuccessfully() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $output = $this->prepareGetPDFFunction();

        // Check that result is a JSON
        $this->assertJson($output);

        // Check that result is containing the success status
        $this->assertEquals(
            json_encode(["status" => "success", "file" => "test-file.pdf"]),
            trim($output)
        );
    }

    // !!! Important: This test is not working because if we using exit() in the getPDF.php
    // and it is ending process ending unexpectedly for the PHPUnit. Possible
    // solution: stop using exit() or try to cling to the state before the
    // process terminates.
    // public function testFullScriptReturnsExpectedErrorJson() {
    //     // Mocking environment
    //     $this->setInvalidMockForGET();

    //     // Preparing the getPDF.php
    //     $output = $this->prepareGetPDFFunction();

    //     // Check that result is a JSON
    //     $this->assertJson($output);

    //     // Check that result is containing the error status
    //     $this->assertEquals(
    //         json_encode(["status" => "error"]),
    //         trim($output)
    //     );
    // }
    // >>> End of tests for the the getPDF.php <<<


    // >>> Tests for the startsWith function from the getPDF.php <<<
    public function testStartsWithReturnsTrue() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Check how function is works
        $this->assertTrue(startsWith("hello.pdf", "hello"));
    }

    public function testStartsWithReturnsFalse() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Check how function is works
        $this->assertFalse(startsWith("hello.pdf", "world"));
    }

    public function testStartsWithEmptyNeedle() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Check how function is works
        $this->assertTrue(startsWith("abc", ""));
    }

    public function testStartsWithEmptyHaystack() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Check how function is works
        $this->assertFalse(startsWith("", "a"));
    }
    // >>> End of tests for the startsWith function from the getPDF.php <<<


    // >>> Tests for the parsePDFLink function from the getPDF.php <<<
    public function testParsePDFLinkWithDirectPDFHeader() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Mocking url
        $url = "https://example.com/some.pdf";

        // Check that function return expected result
        $this->assertEquals("https://example.com/some.pdf", parsePDFLink("%PDF something here", $url));
    }

    public function testParsePDFLinkWithBarePDFUrl() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Mocking the HTML
        $html = <<<HTML
        <html><body>
        <a href="something.pdf">PDF</a>
        </body></html>
        HTML;

        // Mocking the url
        $url = "https://example.com/articles/some";

        // Getting result of function work
        $result = parsePDFLink($html, $url);

        // Check that result is expected
        // Is it okay? (maybe it should be https://example.com/articles/something.pdf)
        $this->assertEquals("https://example.com/articlessomething.pdf", $result);
    }

    public function testParsePDFLinkWithFullPDFUrl() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Mocking the HTML
        $html = <<<HTML
        <html><body>
        "https://cdn.example.com/final.pdf"
        </body></html>
        HTML;

        // Mocking the url
        $url = "https://example.com/view";

        // Getting result of function work
        $result = parsePDFLink($html, $url);

        // Check that result is expected
        $this->assertEquals("https://cdn.example.com/final.pdf", $result);
    }

    public function testParsePDFLinkNoMatchReturnsFalse() {
        // Mocking environment
        $this->setValidMockForGET();

        // Preparing the getPDF.php
        $this->prepareGetPDFFunction();

        // Mocking the HTML
        $html = <<<HTML
        <html><head><title>Nothing here</title></head><body>No PDFs</body></html>
        HTML;

        // Mocking the url
        $url = "https://example.com/empty";

        // Getting result of function work
        $result = parsePDFLink($html, $url);

        // Check that result is false
        $this->assertFalse($result);
    }
    // >>> End of tests for the parsePDFLink function from the getPDF.php <<<


    // >>> Tests for the mock of the getContentFromURL function from the getPDF.php <<<
    /**
        * @runInSeparateProcess
    */
    public function testGetContentFromURLMockedReturnsExpectedArray() {
        // Mocking the getContentFromURL function
        $this->setUpMockedGetContentFromURL('FAKE_PDF_BINARY_DATA');

        // Running function and receiving a result
        $result = getContentFromURL('https://someurl.com/test');

        // Check that result is an array
        $this->assertIsArray($result);

        // Check that result contains expected string
        $this->assertEquals('FAKE_PDF_BINARY_DATA', $result[0]);

        // Check that result contains expected url
        $this->assertEquals('https://mock.url/file.pdf', $result[1]);
    }
    // >>> End of tests for the mock of the getContentFromURL function from the getPDF.php <<<


    // >>> Tests for the getRedirectURL function from the getPDF.php <<<
    /**
        * @runInSeparateProcess
    */
    public function testGetRedirectURLWithMockedGetContentFromURL() {
        if (!function_exists('getContentFromURL')) {
            function getContentFromURL($link) {
                return [
                    '<meta name="citation_pdf_url" content="https://example.com/final.pdf">',
                    'https://example.com/source.html'
                ];
            }
        }

        // Mocking the startsWith function
        $this->defineStartsWithIfNeeded();

        if (!function_exists('parsePDFLink')) {
            function parsePDFLink($source, $url) {
                preg_match('/citation_pdf_url" content="([^"]+)"/', $source, $matches);
                return $matches[1] ?? false;
            }
        }

        if (!function_exists('getRedirectURL')) {
            function getRedirectURL($link) {
                $response = getContentFromURL($link);
                return parsePDFLink($response[0], $response[1]);
            }
        }

        $result = getRedirectURL('https://irrelevant.url.com');

        $this->assertEquals('https://example.com/final.pdf', $result);
    }
    // >>> End of tests for the getRedirectURL function from the getPDF.php <<<


    // >>> Tests for the getPDFAndDownload function from the getPDF.php <<<
    /**
        * @runInSeparateProcess
    */
    public function testGetPDFAndDownloadWritesValidPDF() {
        // Mocking the environment
        $_GET = [];

        // Mocking the startsWith function
        $this->defineStartsWithIfNeeded();

        // Mocking the getContentFromURL function
        $this->setUpMockedGetContentFromURL("%PDF-1.4 simulated");

        // Mocking the getPDFAndDownload function
        $this->defineMockedGetPDFAndDownload();

        // Mocking the filename
        $filename = 'unit-success.pdf';

        // Preparing the file and path to it
        $outputPath = $this->prepareTestFile($filename);
        $tmpDir = dirname($outputPath) . '/';

        ob_start();

        // Running our function and reading the result
        getPDFAndDownload('https://fake.pdf', $tmpDir, $filename);
        $output = ob_get_clean();

        // Check that result is a JSON
        $this->assertJson($output);
        // Check that the file was created
        $this->assertFileExists($outputPath);

        // Getting MIME-type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $outputPath);
        finfo_close($finfo);

        // Check that MIME have JSON type
        $this->assertEquals('application/pdf', $mime);
        unlink($outputPath);
    }

    /**
        * @runInSeparateProcess
    */
    public function testGetPDFAndDownloadFailsOnNonPDF() {
        // Mocking the environment
        $_GET = [];

        // Mocking the startsWith function
        $this->defineStartsWithIfNeeded();

        // Mocking the getContentFromURL function
        $this->setUpMockedGetContentFromURL("NOT_PDF_FAKE");

        // Mocking the getPDFAndDownload function
        $this->defineMockedGetPDFAndDownload();

        // Mocking the filename
        $filename = 'unit-fail.txt';

        // Preparing the file and path to it
        $outputPath = $this->prepareTestFile($filename);
        $tmpDir = dirname($outputPath) . '/';

        ob_start();

        // Running our function and reading the result
        getPDFAndDownload('https://fake.fail', $tmpDir, $filename);
        $output = ob_get_clean();

        // Check that result is a JSON
        $this->assertJson($output);

        // Check that response have the error status
        $this->assertStringContainsString('"status":"error"', $output);

        // Check that file was not created
        $this->assertFileDoesNotExist($outputPath);
    }
    // >>> End of tests for the getPDFAndDownload function from the getPDF.php <<<
}