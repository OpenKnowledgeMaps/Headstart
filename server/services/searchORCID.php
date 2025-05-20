<?php

header('Content-Type: application/json');

include_once dirname(__FILE__) . '/search.php';
include_once dirname(__FILE__) . '/utils/normalizeAndSanitizeString.php';
include_once dirname(__FILE__) . '/utils/getPrecomputedIdFromRequest.php';
include_once dirname(__FILE__) . '/utils/getQueryParameterFromRequest.php';

/**
 * Get parameters from the request array ($_POST).
 * @return string[] - Array with parameters.
 */
function getQueryParametersFromRequest(): array {
    $DEFAULT = ["orcid", "today"];
    $OPTIONAL = ["limit", "academic_age_offset", "enable_h_index", "enable_teaching_mentorship"];

    $parameters = [...$DEFAULT];

    foreach($OPTIONAL as $optionalParameter) {
        if (isset($_POST[$optionalParameter])) {
            $parameters[] = $optionalParameter;
        }
    }

    return $parameters;
}

$query = getQueryParameterFromRequest($_POST, "orcid");
$normalizedAndSanitizedQuery = normalizeAndSanitizeString($query);
$precomputedId = getPrecomputedIdFromRequest($_POST, "unique_id");
$parameters = getQueryParametersFromRequest($_POST);
$requestArray = $_POST;

$result = search(
    "orcid",
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
