<?php

namespace headstart\preprocessing\spellchecking;

/**
 * Base class for spellchecking
 *
 * @author pkraker
 */
class Spellchecking {

    protected $ini_array;

    public function __construct($ini_array) {

        $this->ini_array = $ini_array["spellchecking"];

    }
   
    public function performSpellchecking($string) {
        
    }

}