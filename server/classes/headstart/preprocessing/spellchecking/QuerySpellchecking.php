<?php

namespace headstart\preprocessing\spellchecking;

/**
 * Spellchecking for queries
 *
 * @author pkraker
 */
require_once 'Spellchecking.php';
// TODO: Make that path configurable
require __DIR__ . '../../../../../../../../vendor/autoload.php';

use LanguageDetection\Language;
use Mekras\Speller\Hunspell\Hunspell;
use Mekras\Speller\Source\StringSource;

class QuerySpellchecking extends Spellchecking {
    
    protected $lang_to_code =
            array(
               "af" => "af_ZA"
                , "ar" => "ar"
                , "an" => "an_ES"
                , "be" => "be_BY"
                , "bn" => "bn_BD"
                , "bo" => "bo"
                , "br" => "br_FR"
                , "bs" => "bs_BA"
                , "ca" => "ca"
                , "cs" => "cs_CZ"
                , "da" => "da_DK"
                , "de" => "de_DE"
                , "el" => "el_GR"
                , "en" => "en_US"
                , "es" => "es_ANY"
                , "et" => "et_EE"
                , "fr" => "fr"
                , "gd" => "gd_GB"
                , "gl" => "gl_ES"
                , "gu" => "gu_IN"
                , "gug" => "gug"
                , "he" => "he_IL"
                , "hi" => "hi_IN"
                , "hr" => "hr_HR"
                , "hu" => "hu_HU"
                , "id" => "id_ID"
                , "is" => "is"
                , "it" => "it_IT"
                , "kmr" => "kmr_Lattn"
                , "lo" => "lo_LA"
                , "lt" => "lt"
                , "lv" => "lv_LV"
                , "nb" => "nb_NO"
                , "ne" => "ne_NP"
                , "nl" => "nl_NL"
                , "nn" => "nn_NO"
                , "oc" => "oc_FR"
                , "pl" => "pl_PL"
                , "pt" => "pt_BR"
                , "ro" => "ro_RO"
                , "ru" => "ru_RU"
                , "si" => "si_LK"
                , "sk" => "sk_SK"
                , "sl" => "sl_SI"
                , "sq" => "sq_AL"
                , "sr" => "sr"
                , "sv" => "sv_SE"
                , "sw" => "sw_TZ"
                , "te" => "te_IN"
                , "th" => "th_TH"
                , "tr" => "tr_TR"
                , "uk" => "uk_UA"
                , "vi" => "vi_VN"
            );


    public function detectLanguage($string) {
        $ld = new Language;
        $ld_array = $ld->detect($string)->bestResults()->close();
        
        $detected_language = array_keys($ld_array)[0];
        
        if((sizeof($ld_array) > 1 && $ld_array[$detected_language] < 0.6) 
                || !array_key_exists($detected_language, $this->lang_to_code)) {    
            $detected_language = 'en';
        }
        
        return $this->lang_to_code[$detected_language];
        
    }
    
    public function checkText($string, $lang) {
        
        putenv("LANG=$lang.UTF-8");
        $_SERVER['LANG'] = "$lang.UTF-8";
       
        $source = new StringSource($string);
        $speller = new Hunspell($this->ini_array["hunspell_path"]);
        $speller->setDictionaryPath($this->ini_array["dicts_path"]);
        $issues = $speller->checkText($source, [$lang]);

        return $issues;
        
    }
    
    public function getQueryTermsArray($query) {

        //Replace terms within square brackets, as they denote fields in PubMed
        $query_wt_fields = preg_replace('/\[(.*?)\]/', '', $query);
        
         //Remove inverted commas, and, or, +, -, (, ) from query string 
        $query_wt_operators = preg_replace('/(^|\s)-|\+/', ' '
                            , preg_replace('/\band\b|\bor\b|\(|\)|\\"|\"/', '', $query_wt_fields));
        
        //Remove unnecessary white space
        $query_wt_whitespace = preg_replace('/\s+/', ' ', trim($query_wt_operators));
        
        //Merge term arrays and remove duplicate entries
        $term_array = array_unique(array_merge($term_array, explode(' ', $query_wt_whitespace)));

        return $term_array;
    }
    
    private function replaceWithSuggestion($string, $spelling_errors
            , $suggestion_prefix = "", $suggestion_postfix = "") {
        
        $new_string = $string;
        $additional_offset = 0;
        
        foreach($spelling_errors as $error) {
            $suggestion = $error->suggestions[0];
            
            $new_string = substr_replace($new_string
                    ,  $suggestion_prefix . $suggestion . $suggestion_postfix
                    , intval($error->offset) + $additional_offset
                    , strlen($error->word));
            
            $additional_offset += strlen($suggestion_prefix) + strlen($suggestion_postfix)
                                    + strlen($suggestion) - strlen($error->word);
        }
        
        return $new_string;
    }

    public function performSpellchecking($string
            , $suggestion_prefix = '<span class="corrected-word">'
            , $suggestion_postfix = '</span>' ) {
        
        $lang = $this->detectLanguage($string);
        $spelling_errors = $this->checkText($string, $lang);
        
        $new_string = $this->replaceWithSuggestion($string, $spelling_errors);
        $new_string_display = $this->replaceWithSuggestion($string, $spelling_errors
                , $suggestion_prefix, $suggestion_postfix);
        
        return array($new_string, $new_string_display);
        
    }

}