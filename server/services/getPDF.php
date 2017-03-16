<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

require 'helper.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$url = library\CommUtils::getParameter($_GET, "url");
$filename = library\CommUtils::getParameter($_GET, "filename");
$service = library\CommUtils::getParameter($_GET, "service");
$pdf_urls = library\CommUtils::getParameter($_GET, "pdf_urls");
$images_path = $ini_array["general"]["images_path"];

if ($service == "base") {
  $pdf_link = getPDFLinkforBASE($pdf_urls);
  if($pdf_link != false) {
      getPDFAndDownload($pdf_link, $images_path, $filename);
  } else {
      library\CommUtils::echoOrCallback(json_encode(array("status" => "error")), $_GET);
      exit();
  }
} else {
    getPDFAndDownload($url, $images_path, $filename);
}

library\CommUtils::echoOrCallback(json_encode(array("status" => "success", "file" => $filename)), $_GET);

function getPDFLinkforBASE($url) {
  $link_list = preg_split("/;/", $url);
  //Remove all entries that are not URLs
  //$link_list = array_filter($link_list, function($item) { return filter_var($item, FILTER_VALIDATE_URL); });
  
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
      }
  }
    
  return getRedirectURL($link_list[0]);
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
    curl_setopt($ch, CURLOPT_VERBOSE, true);
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
        library\CommUtils::echoOrCallback(json_encode(array("status" => "error")), $_GET);
        exit();
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE); 

    $mime_type = finfo_file($finfo, $output_path);

    finfo_close($finfo);

    if (strtolower($mime_type) != "application/pdf") {
        unlink($output_path);
        library\CommUtils::echoOrCallback(json_encode(array("status" => "error")), $_GET);
        exit();
    }
}


