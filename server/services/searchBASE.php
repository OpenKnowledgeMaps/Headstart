<?php

header('Content-Type: application/json');

include_once dirname(__FILE__) . '/search.php';
include_once dirname(__FILE__) . '/utils/normalizeAndSanitizeString.php';
include_once dirname(__FILE__) . '/utils/getPrecomputedIdFromRequest.php';
include_once dirname(__FILE__) . '/utils/getQueryParameterFromRequest.php';

/**
 * Re-establish historic order for backwards ID compatibility
 * Order: [from, to, document_types, sorting, min_descsize,
 * repo, coll, vis_type, lang_id, q_advanced, exclude_date_filters,
 * custom_title, custom_clustering].
 * @param array $parameters - Array with parameters.
 * @return array - Reordered array with parameters.
 */
function reorderParametersForIdCompatibility(array $parameters): array {
    $reorderedParameters = [];
    $historicOrder = [
        "from",
        "to",
        "document_types",
        "sorting",
        "min_descsize",
        "repo",
        "coll",
        "vis_type",
        "lang_id",
        "q_advanced",
        "exclude_date_filters",
        "custom_title",
        "custom_clustering"
    ];

    foreach($historicOrder as $param) {
        if (isset($requestArray[$param])) {
            $reorderedParameters[] = $param;
        }
    }

    foreach($parameters as $param) {
        if (!in_array($param, $reorderedParameters)) {
            $reorderedParameters[] = $param;
        }
    }

    return $reorderedParameters;
}

/**
 * Preparing parameters array.
 * @param array $requestArray - Request array ($_POST).
 * @return array - Array with parameters.
 */
function getParameters(array $requestArray): array {
    $parameters = ["document_types", "sorting", "min_descsize"];
    $optionalParameters = ["repo", "coll", "vis_type", "q_advanced", "lang_id", "custom_title", "exclude_date_filters", "from", "to", "custom_clustering"];

    // Adding optional parameters if they were passed
    foreach ($optionalParameters as $param) {
        if (isset($_POST[$param])) {
            $parameters[] = $param;
        }
    }

    // Set min_descsize if it is not
    if (!isset($requestArray["min_descsize"])) {
        $requestArray["min_descsize"] = 300;
    }

    // Set lang_id even if it is empty
    if (isset($requestArray["lang_id"])) {
        $requestArray["lang_id"] = array_filter(
            $requestArray["lang_id"],
            fn(string $value): bool => $value !== ''
        );

        if (count($requestArray["lang_id"]) === 0) {
            $requestArray["lang_id"] = ["all-lang"];
        }
    }

    // Ignore exclude date filters parameter if visualization type is timeline
    if (isset($requestArray["vis_type"]) && $requestArray["vis_type"] === "timeline") {
        $indexOfExcludeDateFilter = array_search("exclude_date_filters", $parameters);

        // Check that array_search really find needle in the array
        // (to not delete 0 index element if nothing was found)
        if (is_numeric($indexOfExcludeDateFilter)) {
            unset($parameters[$indexOfExcludeDateFilter]);
        }

        unset($requestArray["exclude_date_filters"]);
    }

    // Remove date filters and add "today" parameter if exclude date filters parameter is set
    if (isset($requestArray["exclude_date_filters"]) && $requestArray["exclude_date_filters"] === true) {
        $parameters = array_merge($parameters, ["today"]);
        unset($parameters["from"], $parameters["to"]);
    }

    return reorderParametersForIdCompatibility($parameters);
}

$query = getQueryParameterFromRequest($_POST, "q");
$normalizedAndSanitizedQuery = normalizeAndSanitizeString($query);
$precomputedId = getPrecomputedIdFromRequest($_POST, "unique_id");
$requestArray = $_POST;
$parameters = getParameters($requestArray);

$result = search(
    "base",
    $normalizedAndSanitizedQuery,
    $requestArray,
    $parameters,
    true,
    true,
    null,
    $precomputedId,
    false
);

echo $result

?>