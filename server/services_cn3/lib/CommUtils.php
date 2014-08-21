<?php

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
            throw new Exception("The following parameter is not set: " . $name);
        }
        
    }
}
