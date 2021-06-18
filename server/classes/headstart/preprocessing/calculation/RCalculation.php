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

    public function performCalculationAndReturnOutputAsJSON($working_dir, $query, $params, $service) {
        $ini = $this->ini_array["calculation"];

        $base_dir = $this->ini_array["general"]["preprocessing_dir"];
        $binary = $ini["binary"];
        $script = $base_dir . $ini["script"];

        $path = '"' . $binary . '" ' .$script. ' "' . $working_dir . '" "' . $query . '" "'
                . $service . '"';

        if($params != null) {
            $path .= ' "' . $params . '"';
        }

        //library\Toolkit::info($path);
        // exec(ps(if [ $(ps -ef | grep -v grep | grep scrape_data.php | wc -l) -lt 1 ])) if n > 5
        // return $try_later with error handling
        if(exec("ps -u www-data | grep R | wc -l") <= 8) {
            exec($path, $output_r);
            return $output_r;
        } else {
            $output = array(json_encode(array("status" => "error",
                                              "reason" => "dataprocessing rate limit")));
            return $output;
        }        
    }

    public function performStreamgraphCalculation($working_dir, $service, $output_json) {
        $ini = $this->ini_array["calculation"];

        $base_dir = $this->ini_array["general"]["preprocessing_dir"];
        $binary = $ini["binary"];
        $script = $base_dir . "other-scripts/streamgraph.R";

        $tmp_jsonfile = tmpfile();
        $tmp_meta = stream_get_meta_data($tmp_jsonfile);
        $tmp_jsonname = $tmp_meta["uri"];
        fwrite($tmp_jsonfile, $output_json);

        $path = '"' . $binary . '" '
                . $script
                . ' "' . $working_dir . '" '
                . '"' . $service . '" '
                . '"' . $tmp_jsonname . '"';
        exec($path, $streamgraph_json);

        return $streamgraph_json;
    }
}
