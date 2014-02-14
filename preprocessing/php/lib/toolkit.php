<?php

function write_csv_line($fp, $strings, $delim="\t") {
    
    $line = "";
    
    if($strings != null) {
        foreach($strings as $string) {
            if ($string != NULL) {
                $line .= $string . $delim;
            } else {
                $line .= $delim;
            }
        }

        $line = substr_replace($line, "\n", strrpos($line,$delim),strlen($delim));
        fwrite($fp, $line);
    }
}

function info($string) {
    fwrite(STDOUT, $string . "\n");
}

function infoCount($string, $current_count, $count) {
    if(($current_count % $count) == 0) {
        fwrite(STDOUT, $string . "\nTimestamp: " . date('H:i:s'). "\n");
    }
}

function generateUriFromString($string) {
    
    $uri = preg_replace("/[^A-Za-z0-9\s\-]/", "", strtolower($string));
    $uri = preg_replace("/[\s]/", "-", $uri);
    
    return $uri;
}

function localName($uri) {
    $string = strrchr($uri, "/");
    return substr($string, 1);
}

?>
