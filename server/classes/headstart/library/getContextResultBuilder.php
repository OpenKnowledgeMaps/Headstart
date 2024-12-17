<?php

namespace headstart\library;

/**
 * Description of getContextResultBuilder:
 * This class is responsible for building the context result for the services endpoints.
 * It is a thin layer on top of the Persistence class and is used to build the context result
 * from the database response.
 *
 * @author pkraker
 */


class getContextResultBuilder {

    private $persistence;

    public function __construct($persistence) {
        $this->persistence = $persistence;
    }

    public function getContext($vis_id) {
        // TODO: remove the [0] unpacking from array
        $data = $this->persistence->getContext($vis_id)[0];
        $return_data = array("id" => $data["rev_vis"],
                      "query" => $data["vis_query"],
                      "service" => $data["vis_title"],
                      "timestamp" => $data["rev_timestamp"],
                      "params" => $data["vis_params"]);
        if (array_key_exists("additional_context", $data)) {
        $return_data = array_merge($return_data, $data["additional_context"]);
        }
        $result = json_encode($return_data);
        return $result;
    }

}