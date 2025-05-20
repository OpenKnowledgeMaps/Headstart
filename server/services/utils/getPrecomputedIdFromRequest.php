<?php

include_once dirname(__FILE__) . '/getQueryParameterFromRequest.php';

/**
 * Getting precomputed id that can be passed in request parameters ($_GET/$_POST).
 * @param array $requestArray - Request array ($_GET/$_POST).
 * @param string $parameterThatContainsId - Name of the parameter that contains id.
 * @return string|null - Visualization id or null.
 */
function getPrecomputedIdFromRequest(array $requestArray, string $parameterThatContainsId): string|null {
  $idFromParameter = getQueryParameterFromRequest($requestArray, $parameterThatContainsId);
  return $idFromParameter;
}

?>