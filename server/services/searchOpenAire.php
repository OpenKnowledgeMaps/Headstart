<?php

header('Content-Type: application/json');

include_once dirname(__FILE__) . '/search.php';
include_once dirname(__FILE__) . '/utils/normalizeAndSanitizeString.php';
include_once dirname(__FILE__) . '/utils/getPrecomputedIdFromRequest.php';
include_once dirname(__FILE__) . '/utils/getQueryParameterFromRequest.php';

/**
 * Getting query string from the request array ($_POST) depending on type of request.
 * @param array $requestArray - Request array ($_POST).
 * @param bool $isWithAcronymTitle - Is request with acronym title.
 * @return string|null - Query string.
 */
function getQuery(array $requestArray, bool $isWithAcronymTitle): string|null {
    $query = $isWithAcronymTitle ? getQueryParameterFromRequest($requestArray, "acronymtitle") : getQueryParameterFromRequest($requestArray, "project_id");
    return $query;
}

/**
 * Returning the array with ids depends on the request type.
 * @param bool $isWithAcronymTitle - Is request with acronym title.
 * @return string[] - Array with ids.
 */
function getArrayWithIds(bool $isWithAcronymTitle): array {
    $DEFAULT = ["project_id", "funder"];
    return $isWithAcronymTitle ? $DEFAULT : [... $DEFAULT, "today"];
}

$PARAMETERS = [
    "project_id",
    "funder",
    "acronym",
    "title",
    "start_date",
    "end_date",
    "special_clause",
    "oa_mandate",
    "organisations",
    "openaire_link",
    "obj_id",
    "call_id",
    "funding_tree",
];

$requestArray = $_POST;
$isWithAcronymTitle = array_key_exists("acronymtitle", $requestArray);

$query = getQuery($_POST, $isWithAcronymTitle);
$normalizedAndSanitizedQuery = normalizeAndSanitizeString($query);
$precomputedId = getPrecomputedIdFromRequest($requestArray, "unique_id");
$arrayWithIds = getArrayWithIds($isWithAcronymTitle);

$result = search(
    "openaire",
    $normalizedAndSanitizedQuery,
    $requestArray,
    $PARAMETERS,
    false,
    true,
    $arrayWithIds,
    $precomputedId,
    true
);

echo $result

?>
