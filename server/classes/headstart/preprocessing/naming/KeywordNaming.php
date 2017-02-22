<?php

namespace headstart\preprocessing\naming;

/**
 * Naming the clusters with the APIs of Zemanta and OpenCalais
 *
 * @author pkraker
 */
require_once 'Naming.php';

class KeywordNaming extends Naming {

    public function performNaming(&$array, $num_keywords, $id = "area_uri", $subjects = "subject", $keyword_separator = ",", $taxonomy_separator = "/") {

        $working_array = array();

        foreach ($array as $entry) {
            $uri = $entry[$id];
            $keywords = explode("; ", $entry[$subjects]);
            foreach ($keywords as &$keyword) {
                if ($taxonomy_separator != null) {
                    $keyword = substr($keyword, strrpos($keyword, $taxonomy_separator) + 1);
                }
            }

            if (isset($working_array[$uri])) {
                $working_array[$uri] = array_merge($working_array[$uri], $keywords);
            } else {
                $working_array[$uri] = $keywords;
            }
        }

        $result_array = array();
        foreach ($working_array as $key => $current_array) {
            $counted_sorted_array = array_count_values($current_array);
            arsort($counted_sorted_array);
            $important_terms = array_keys(array_slice($counted_sorted_array, 0, $num_keywords));
            $final_string = implode(", ", $important_terms);
            $result_array[$key] = $final_string;
        }

        foreach ($array as $key => $entry) {
            $array[$key]["area"] = $result_array[$entry[$id]];
        }
    }

    public function performNamingTfIdf(&$array, $num_keywords, $keyword_separator, $taxonomy_separator, $id = "area_uri", $subjects = "subject") {

        $working_array = array();

        foreach ($array as $entry) {
            $uri = $entry[$id];
            $keywords = explode($keyword_separator, $entry[$subjects]);
            foreach ($keywords as &$keyword) {
                $keyword = preg_replace("/\<U\+(.*?)>/", "&#x$1;", $keyword);
                if ($taxonomy_separator != null) {
                    $keyword = substr($keyword, strrpos($keyword, $taxonomy_separator) + 1);
                }
            }

            //$working_array[$uri] = array();

            if (isset($working_array[$uri]["all_terms"])) {
                $working_array[$uri]["all_terms"] = array_merge($working_array[$uri]["all_terms"], $keywords);
            } else {
                $working_array[$uri]["all_terms"] = $keywords;
            }
        }

        $num_docs_per_term = array();

        foreach ($working_array as $uri => $current_array) {
            $current_array["all_terms"] = array_filter($current_array["all_terms"]);
            $current_array["all_terms"] = array_map('trim', $current_array["all_terms"]);
            array_walk($current_array["all_terms"], function(&$value, &$key) {
                $value = ucfirst($value);
            });
            
            $unique_terms = array_unique($current_array["all_terms"]);
            $working_array[$uri]["unique_terms"] = $unique_terms;

            foreach ($unique_terms as $term) {
                if (!isset($num_docs_per_term[$term]))
                    $num_docs_per_term[$term] = 1;
                else
                    $num_docs_per_term[$term] += 1;
            }
        }

        $result_array = array();
        $totalDocs = count($working_array);

        foreach ($working_array as $uri => $current_array) {

            $current_array["all_terms"] = array_replace($current_array["all_terms"], array_fill_keys(array_keys($current_array["all_terms"], null), ''));

            $num_keywords_per = array_count_values($current_array["all_terms"]);
            $wordCount = count($current_array["all_terms"]);
            $current_result_array = array();

            foreach ($current_array["unique_terms"] as $term) {
                $termCount = isset($num_keywords_per[$term]) ? ($num_keywords_per[$term]) : (0);
                $docsWithTerm = $num_docs_per_term[$term];

                $tf = $termCount / $wordCount;
                $idf = log($totalDocs / $docsWithTerm, 2);
                $tfidf = $tf * $idf;

                //$tfidf_short = round($tfidf,2);
                //$current_result_array[$term. " " . $tfidf_short] = $tfidf;

                $current_result_array[$term] = $tfidf;
            }

            arsort($current_result_array);

            $important_terms = array_keys(array_slice($current_result_array, 0, $num_keywords));

            $final_string = implode(", ", $important_terms);
            $result_array[$uri] = $final_string;
        }

        foreach ($array as $uri => $entry) {
            $array[$uri]["area"] = $result_array[$entry[$id]];
        }
    }

}
