<?php

namespace Headstart\Naming;

/**
 * Base class for naming the clusters
 *
 * @author pkraker
 */
class Naming {
    
    protected $ini_array;
    
    public function __construct($ini_array) {
        
        $this->ini_array = $ini_array;
        
    }
    
    public function performNaming() {
        
    }
    
}
