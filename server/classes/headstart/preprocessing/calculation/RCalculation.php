<?php

namespace headstart\preprocessing\calculation;

/**
 * Calculation using an R script for ordination and clustering
 *
 * @author pkraker
 */

use headstart\library;

require_once 'Calculation.php';

class RCalculation extends Calculation {
      
    public function performCalculationAndWriteOutputToFile($working_dir) {
        $ini = $this->ini_array["calculation"];
        $output = $this->ini_array["output"];
        
        $base_dir = $this->ini_array["general"]["preprocessing_dir"];
        $binary = $ini["binary"];
        $script = $base_dir . $ini["script"];
        
        $path = '"' . $binary . '" ' .$script. ' "' . $working_dir . '" "'
                . $output["cooc"] . '" "' . $output["metadata"] . '" "' . $output["output_scaling_clustering"] . '" "' . $ini["mode"] .'"';
        
        library\Toolkit::info($path);
        exec($path); 
    }
    
    public function performCalculationAndReturnOutputAsJSON($working_dir, $query, $params=null) {
        $ini = $this->ini_array["calculation"];
        $output = $this->ini_array["output"];
        
        $base_dir = $this->ini_array["general"]["preprocessing_dir"];
        $binary = $ini["binary"];
        $script = $base_dir . $ini["script"];
        
        $path = '"' . $binary . '" ' .$script. ' "' . $working_dir . '" "'
                . $query . '"';
        
        if($params != null) {
            $path .= ' "' . $params . '"';
        }
        
        //library\Toolkit::info($path);
        exec($path, $output_r);
        
        return $output_r;
    }
}
