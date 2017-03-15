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
$images_path = $ini_array["general"]["images_path"];

if ($service == "base") {
  $pdf_link = getPDFLinkforBASE($url);
  if($pdf_link != false) {
      getPDFAndDownload($pdf_link, $images_path, $filename);
  } else {
      library\CommUtils::echoOrCallback(json_encode(array("status" => "error")), $_GET);
  }
} else {
    getPDFAndDownload($url, $images_path, $filename);
}

library\CommUtils::echoOrCallback(json_encode(array("status" => "success", "file" => $filename)), $_GET);

function getPDFLinkforBASE($url) {
   $link_list = preg_split("/;/", $url);
  //Remove all entries that are not URLs
  $link_list = array_filter($link_list, function($item) { return filter_var($item, FILTER_VALIDATE_URL); });
  
  $matches_pdf = array_filter($link_list, function($item) { return substr($item, -strlen(".pdf")) === ".pdf"; }); 
  if(count($matches_pdf) != 0) {
      return $matches_pdf[0];
  }
  
  $matches_doi = array_filter($link_list, function($item) { return strpos($item, "dx.doi.org"); });
  if(count($matches_doi) != 0) {
      return getRedirectURL($matches_doi[0]);
  }
  
  $matches_doaj = array_filter($link_list, function($item) { return strpos($item, "doaj.org"); });
  if(count($matches_doaj) != 0) {
      return getRedirectURL(getRedirectDOAJ($matches_doaj[0]));
  }
  
  return false;
}

function getRedirectDOAJ($doaj_url) {
    //Example:
    //https://doaj.org/api/v1/search/articles/id%3A90764de0bd144959b1d2727c91285eb3
}

function getRedirectURL($doi_link) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $doi_link);
    curl_setopt($ch, CURLOPT_HEADER, TRUE);
    //curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    $header = curl_exec($ch);
    $redir = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    return $redir;
}

function getPDFAndDownload($url, $images_path, $filename) {
    
    $output_path = $images_path . $filename;

    $pdf = file_get_contents($url);

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


