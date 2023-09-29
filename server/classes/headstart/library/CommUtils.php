<?php

namespace headstart\library;

/**
 * Description of Util
 *
 * @author pkraker
 */
class CommUtils {

    private static $initialized = false;

    private static function initialize()
    {
    	if (self::$initialized)
    		return;

    	self::$initialized = true;
    }

    public static function echoOrCallback($data, $array) {
        self::initialize();

        if(isset($array["jsoncallback"]))
            echo $array["jsoncallback"] . '(' . $data . ');';
        else
            echo $data;

    }

    public static function getParameter($array, $name) {
        self::initialize();

        if(isset($array[$name])) {
            return $array[$name];
        } else {
            throw new \Exception("The following parameter is not set: " . $name);
        }

    }

    public static function call_api($route, $payload) {
        self::initialize();
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $route);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($result === false) 
            $result = curl_error($ch);
        return array("result" => $result, "httpcode" => $httpcode);
    }
}
