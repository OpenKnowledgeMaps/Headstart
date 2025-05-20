<?php

header('Content-Type: application/json');

include_once dirname(__FILE__) . '/search.php';
include_once dirname(__FILE__) . '/utils/normalizeAndSanitizeString.php';
include_once dirname(__FILE__) . '/utils/getPrecomputedIdFromRequest.php';
include_once dirname(__FILE__) . '/utils/getQueryParameterFromRequest.php';

/**
 * Get parameters from the request array ($_POST).
 * @param mixed $requestArray - Request array ($_POST).
 * @return string[] - Array with request parameters.
 */
function getQueryParametersFromRequest($requestArray): array {
    $DEFAULT = ["from", "to", "sorting"];
    $parameters = [...$DEFAULT];

    if (isset($requestArray["article_types"])) {
        $parameters[] = "article_types";
    }

    return $parameters;
}

$query = getQueryParameterFromRequest($_POST, "q");
$normalizedAndSanitizedQuery = normalizeAndSanitizeString($query);
$precomputedId = getPrecomputedIdFromRequest($_POST, "unique_id");
$parameters = getQueryParametersFromRequest($_POST);
$requestArray = $_POST;

$result = search(
    "pubmed",
    $normalizedAndSanitizedQuery,
    $requestArray,
    $parameters,
    true,
    true,
    null,
    $precomputedId,
    false
);

echo $result;

?>