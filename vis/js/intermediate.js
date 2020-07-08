"use strict"

import ReactDOM from 'react-dom'
import React from 'react'
import ExampleModernComponent from './components/ExampleModernComponent'

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 * 
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {

    constructor(modern_frontend_enabled, example_element) {
        this.modern_frontend_enabled = modern_frontend_enabled
        this.example_element = example_element
    }

    init() {
        if (this.modern_frontend_enabled) {
            ReactDOM.render( <ExampleModernComponent />, document.getElementById(this.example_element))
        }

    }

}

export default Intermediate