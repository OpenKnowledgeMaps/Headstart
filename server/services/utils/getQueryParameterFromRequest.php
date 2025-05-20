<?php

require_once dirname(__FILE__) . '/../../classes/headstart/library/CommUtils.php';
use headstart\library;

/**
 * This function retrieves a parameter from the associative array of the request
 * ($_GET or $_POST) or displays a message in the logs that there is no such item.
 * @param array $requestArray - Request array array ($_GET or $_POST).
 * @param string $parameterToRetrieve - Parameter that should be retrieved from the request array.
 * @return string|null - Retrieved parameter
 */
function getQueryParameterFromRequest(array $requestArray, string $parameterToRetrieve): string|null {
  $parameter = library\CommUtils::getParameter($requestArray, $parameterToRetrieve);

  if (!$parameter) {
    error_log("Parameter {$parameterToRetrieve} was not found in the request array");
  }

  return $parameter;
}

?>