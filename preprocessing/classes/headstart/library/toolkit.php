<?php

namespace headstart\library;

class Toolkit
{
    private static $initialized = false;

    private static function initialize()
    {
    	if (self::$initialized)
    		return;

    	self::$initialized = true;
    }
    
    public static function addOrInitiatlizeArrayKeyNumerical(&$array, $key) {
        self::initialize();
        
        if (!isset($array[$key])) {
            $array[$key] = 1;
        } else {
            $array[$key]++;
        }
    }

    public static function addOrInitiatlizeArrayKey(&$array, $key, $value) {
        self::initialize();
        
        if (!isset($array[$key])) {
            $array[$key] = array($value);
        } else {
            $array[$key][] = $value;
        }
    }

    public static function write_csv_line($fp, $strings, $delim="\t") {
        self::initialize();

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

    public static function info($string) {
        self::initialize();
        fwrite(STDOUT, $string . "\n");
    }

    public static function infoCount($string, $current_count, $count) {
        self::initialize();
        if(($current_count % $count) == 0) {
            fwrite(STDOUT, $string . "\nTimestamp: " . date('H:i:s'). "\n");
        }
    }

    public static function generateUriFromString($string) {
        self::initialize();
        $uri = preg_replace("/[^A-Za-z0-9\s\-]/", "", strtolower($string));
        $uri = preg_replace("/[\s]/", "-", $uri);

        return $uri;
    }

    public static function localName($uri) {
        self::initialize();
        $string = strrchr($uri, "/");
        return substr($string, 1);
    }
}

?>
