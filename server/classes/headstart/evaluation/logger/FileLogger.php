<?php

namespace headstart\evaluation\logger;
/**
 * Description of FileLogger
 *
 * @author pkraker
 */

require "Logger.php";
require dirname(__FILE__) . '/../../library/KLogger/src/KLogger.php';

class FileLogger extends Logger {
    
    private $log;
    
    public function __construct($log_directory, $debug_level) {
        $level = ($debug_level != null)?($debug_level):(\KLogger::DEBUG);
        $this->log   = \KLogger::instance($log_directory, $level);
    }
    
    public function writeToLog($log_data) {
        $this->log->logInfo(json_encode($log_data));
    }
    
}
