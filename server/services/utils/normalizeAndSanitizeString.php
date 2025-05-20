<?php

/**
 * This function converts any string received from the client to the uniform
 * formatting (especially useful with strings that contain special characters
 * that need to be escaped or replaced with special codes from the encoding table).
 * In the further, with this string the rest of the server should work without problems.
 * Also, this feature makes XSS attacks impossible because it removes HTML tags from the string.
 * @param string $str - String that should be converted.
 * @return string - Converted string.
 */
function normalizeAndSanitizeString(string $str): string {
    // Normalize string
    $normalizedString = html_entity_decode($str, ENT_QUOTES | ENT_HTML5, 'UTF-8'); // decode &quot; -> "

    // Remove \" escaping
    $normalizedString = stripslashes($normalizedString);

    // Prevent XSS from embedded HTML tags
    $normalizedString = strip_tags($normalizedString);

    return $normalizedString;
}

?>