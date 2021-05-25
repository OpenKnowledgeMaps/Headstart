<?php

namespace headstart\library;

class Toolkit {

    private static $initialized = false;

    private static function initialize() {
        if (self::$initialized)
            return;

        self::$initialized = true;
    }

    public static function addOrInitiatlizeArrayKeyNumerical(&$array, $key) {
        self::initialize();

        if (!isset($array[$key])) {
            $array[$key] = 1;
        } else {
            $array[$key] ++;
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

    public static function write_csv_line($fp, $strings, $delim = "\t") {
        self::initialize();

        $line = "";

        if ($strings != null) {
            foreach ($strings as $string) {
                if ($string != NULL) {
                    $line .= $string . $delim;
                } else {
                    $line .= $delim;
                }
            }

            $line = substr_replace($line, "\n", strrpos($line, $delim), strlen($delim));
            fwrite($fp, $line);
        }
    }

    public static function info($string) {
        self::initialize();
        $out = fopen('php://output', 'w');
        fwrite($out, $string . "\n");
    }

    public static function infoCount($string, $current_count, $count) {
        self::initialize();
        if (($current_count % $count) == 0) {
            $out = fopen('php://output', 'w');
            fwrite($out, $string . "\nTimestamp: " . date('H:i:s') . "\n");
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

    public static function openOrCreateFile($file) {
        self::initialize();

        //let's first see if there is a path
        $file_name_pos = strrpos($file, "/");

        if ($file_name_pos != false) {

            //ok, so there is a path, let's see, if it exists. If not, let's create it.
            $path = substr($file, 0, $file_name_pos);
            if (!is_dir($path)) {
                mkdir($path, 0777, true);
            }
        }

        //now, we should be good, let's open or create the file
        $handle = fopen($file, "w+");
        if ($handle == false)
            throw new Exception("There was an error while opening/creating the following file: " . $file);

        return $handle;
    }

    public static function openFileForReading($file) {
        self::initialize();

        $handle = fopen($file, "r");
        if ($handle == false)
            throw new \Exception("There was an error while opening/creating the following file: " . $file);

        return $handle;
    }

    public static function putContentsToFile($file, $text) {
        self::initialize();

        $handle = self::openOrCreateFile($file);
        fwrite($handle, $text);
        fclose($handle);
    }

    public static function loadIni($path) {
        self::initialize();

        if (file_exists($path . 'config_local.ini')) {
            $ini_array = parse_ini_file($path . "config_local.ini", true);
        } else {
            $ini_array = parse_ini_file($path . "config.ini", true);
        }

        return $ini_array;
    }

    public static function isJson($string) {
        self::initialize();

        json_decode($string);
        $error = json_last_error();
        return ($error == JSON_ERROR_NONE);
    }

    public static function array_diff_assoc_recursive($array1, $array2) {
        self::initialize();
        
        $difference = array();
        foreach ($array1 as $key => $value) {
            if (is_array($value)) {
                if (!isset($array2[$key]) || !is_array($array2[$key])) {
                    $difference[$key] = $value;
                } else {
                    $new_diff = array_diff_assoc_recursive($value, $array2[$key]);
                    if (!empty($new_diff))
                        $difference[$key] = $new_diff;
                }
            } else if (!array_key_exists($key, $array2) || $array2[$key] !== $value) {
                $difference[$key] = $value;
            }
        }
        return $difference;
    }

}

?>
