<?php

namespace headstart\library;
use headstart\persistence\VisualizationContext;

/**
 * Description of getContextResultBuilder:
 * This class is responsible for building the context result for the services endpoints.
 * It is a thin layer on top of the Persistence class and is used to build the context result
 * from the database response.
 *
 * @author ckittel
 */


class getContextResultBuilder {

    public function getContext(VisualizationContext $visualizationContext): string {
        // if data result is not success, return error reason array
        $httpcode = $visualizationContext->httpcode;
        $data = $visualizationContext->data;
        if ($httpcode === 200) {
            $return_data = array("id" => $data["rev_vis"],
                        "query" => $data["vis_query"],
                        "service" => $data["vis_title"],
                        "timestamp" => $data["rev_timestamp"],
                        "params" => $data["vis_params"]);
            if (array_key_exists("additional_context", $data)) {
               $return_data = array_merge($return_data, $data["additional_context"]);
            }
        } else {
                $return_data = $data;
        }
        $result = json_encode($return_data);
        return $result;
    }
}