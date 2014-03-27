<?php

namespace headstart\util;

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
    
    public static function echoOrCallback($data, $callback) {
        self::initialize();
        
        if(isset($callback))
            echo $callback . '(' . $data . ');';
        else  
            echo $data;
        
    }
}
