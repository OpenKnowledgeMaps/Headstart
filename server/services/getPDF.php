<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require 'helper.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

$url = library\CommUtils::getParameter($_GET, "url");
$filename = library\CommUtils::getParameter($_GET, "filename");
$service = library\CommUtils::getParameter($_GET, "service");
$pdf_urls = library\CommUtils::getParameter($_GET, "pdf_urls");
$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$paper_id = library\CommUtils::getParameter($_GET, "paper_id");
$images_path = $ini_array["general"]["images_path"];

if (isServiceWithPDFList($service)) {
    handleMultiPdfService($vis_id, $paper_id, $images_path, $filename);
} else {
    handleSingleUrlService($vis_id, $paper_id, $url, $images_path, $filename);
}

library\CommUtils::echoOrCallback(json_encode(array("status" => "success", "file" => $filename)), $_GET);

function isServiceWithPDFList(string $service): bool {
    return in_array($service, ["base", "openaire"]);
}

function handleMultiPdfService(string $vis_id, string $paper_id, string $images_path, string $filename): void {
    $valid_pdf_urls = getValidURLs($vis_id, $paper_id);
    $filtered_urls_string = implode(";", $valid_pdf_urls);
    $pdf_link = getPDFLinkForBASE($filtered_urls_string);

    if (!$pdf_link) {
        returnError("No valid PDF link could be resolved from filtered URLs.");
    }

    getPDFAndDownload($pdf_link, $images_path, $filename);
}

function handleSingleUrlService(string $vis_id, string $paper_id, string $url, string $images_path, string $filename): void {
    $valid_pdf_urls = getValidURLs($vis_id, $paper_id);

    if (!in_array($url, $valid_pdf_urls)) {
        returnError("Provided URL not found in valid paper links");
    }

    getPDFAndDownload($url, $images_path, $filename);
}

function getValidURLs(string $vis_id, string $paper_id) {
    $revision_data = fetchLatestRevision($vis_id);

    if (!$revision_data) {
        returnError("There are no revision data for such visualization id");
    }

    $valid_pdf_urls = extractValidPdfUrls($revision_data, $paper_id);

    if (empty($valid_pdf_urls)) {
        returnError("There are no valid PDF URLs from revision");
    }

    return $valid_pdf_urls;
}

function fetchLatestRevision(string $vis_id): ?array {
    $latest_url = "http://" . $_SERVER['SERVER_NAME'] . dirname($_SERVER['REQUEST_URI']) . "/getLatestRevision.php?vis_id=" . urlencode($vis_id) . "&context=true";

    $revision_json = @file_get_contents($latest_url);
    if ($revision_json === false) {
        error_log("Failed to fetch metadata from getLatestRevision.php");
        return null;
    }

    $revision_data = json_decode($revision_json, true);
    if (!is_array($revision_data)) {
        error_log("Invalid JSON returned from getLatestRevision.php");
        return null;
    }

    return $revision_data;
}

function extractValidPdfUrls(array $revision_data, string $paper_id): array {
    $valid_urls = [];

    $inner_data = json_decode($revision_data["data"], true);
    $documents_raw = $inner_data["documents"] ?? null;
    $documents = json_decode($documents_raw, true);

    if (!is_array($documents)) {
        error_log("Invalid or missing documents array: " . json_encode($documents_raw));
        return [];
    }

    $url_fields = ['link', 'oa_link', 'identifier', 'relation', 'fulltext'];

    foreach ($documents as $entry) {
        if (($entry["id"] ?? null) !== $paper_id) {
            continue;
        }

        foreach ($url_fields as $field) {
            if (!isset($entry[$field])) {
                continue;
            }

            $urls = is_array($entry[$field]) ? $entry[$field] : explode(";", $entry[$field]);

            foreach ($urls as $url) {
                $url = trim($url);
                if (filter_var($url, FILTER_VALIDATE_URL)) {
                    $valid_urls[] = $url;
                }
            }
        }
    }

    return array_unique($valid_urls);
}

function getPDFLinkForBASE($url) {
    $link_list = preg_split("/;/", $url);

    $matches_pdf = array_filter($link_list, function($item) { return substr($item, -strlen(".pdf")) === ".pdf"; }); 
    if(count($matches_pdf) != 0) {
        return array_values($matches_pdf)[0];
    }

    $matches_doi = array_filter($link_list, function($item) { return strpos($item, "dx.doi.org"); });
    if(count($matches_doi) != 0) {
        return getRedirectURL(array_values($matches_doi)[0]);
    }

    $matches_doaj = array_filter($link_list, function($item) { return strpos($item, "doaj.org"); });
    if(count($matches_doaj) != 0) {
        $url = getRedirectDOAJ(array_values($matches_doaj)[0]);
        if($url != false) {
            return getRedirectURL($url);
        } else {
            //Remove all DOAJ entries and all entries that are not URLs
            $link_list = array_filter($link_list, function($item) { return !strpos($item, "doaj.org"); });
            $link_list = array_filter($link_list, function($item) { return filter_var($item, FILTER_VALIDATE_URL); });
        }
    }

    return getRedirectURL(array_values($link_list)[0]);
}

//Example:
//https://doaj.org/api/v1/search/articles/id%3A90764de0bd144959b1d2727c91285eb3
function getRedirectDOAJ($doaj_url) {
    $id = substr(strrchr($doaj_url, '/' ), 1);
    $url = "https://doaj.org/api/v1/search/articles/id%3A" . $id;

    $response = file_get_contents($url);

    $array = json_decode($response, true);
    $fulltext_link = null;
    if($array["total"] > 0) {
        $links = $array["results"][0]["bibjson"]["link"];
        foreach($links as $link) {
            if($link["type"] === "fulltext") {
                $fulltext_link = $link["url"];
            }
        }
    }
    return ($fulltext_link === null)?(false):($fulltext_link);
}

function getContentFromURL($link) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $link);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_VERBOSE, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
    $response = curl_exec($ch);
    $redir = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);

    return array($response, $redir);
}

function getRedirectURL($link) {
    $response = getContentFromURL($link);
    return parsePDFLink($response[0], $response[1]);
}

function parsePDFLink($source, $url) {
    if(substr($source, 0, 4) === "%PDF") {
        return $url;
    }

    $has_match = preg_match_all('/meta[\s]+content=["\']+([^"\']+)["\']+[\s]+name[\s]*=[\s]*["\']+citation_pdf_url["\']+/i', $source, $matches);
    if(!$has_match) {
        $has_match = preg_match_all('/meta[\s]+name[\s]*=[\s]*["\']+citation_pdf_url["\']+[\s]+content=["\']+([^"\']+)["\']+/i', $source, $matches);

        if(!$has_match) {
            $has_match = preg_match_all('/["\']?([^"\'\s>]+(?:\.pdf))["\']?/i', $source, $matches);
        }
    }

    if($has_match) {
        $best_match = $matches[1][0];
        if(!startsWith($best_match, "http://") && !startsWith($best_match, "https://") && !startsWith($best_match, "ftp://")) {
            return substr($url, 0, strrpos( $url, '/')) . $best_match;
        } else {
            return $best_match;
        }
    } else {
        return false;
    }
}

function startsWith($haystack, $needle) {
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function getPDFAndDownload($url, $images_path, $filename) {
    $output_path = $images_path . $filename;
    $pdf = getContentFromURL($url)[0];

    if ($pdf !== false) {
        file_put_contents($output_path, $pdf);
    } else {
        returnError("Unable to get PDF from the URL");
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $output_path);
    finfo_close($finfo);

    if (strtolower($mime_type) != "application/pdf") {
        unlink($output_path);
        returnError("MIME type is not application/pdf");
    }
}

function returnError(string $reason): void {
    error_log("Error: " . $reason);
    library\CommUtils::echoOrCallback(json_encode(["status" => "error"]), $_GET);
    exit();
}