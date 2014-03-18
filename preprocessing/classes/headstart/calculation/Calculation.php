<?php

namespace headstart\calculation;

/**
 * Base class for calculating ordination and clustering
 *
 * @author pkraker
 */
class Calculation {
    
    protected $ini_array;
    
    public function __construct($ini_array) {
        
        $this->ini_array = $ini_array;
        
    }
    
    public function performCalculation() {
        
    }
}
