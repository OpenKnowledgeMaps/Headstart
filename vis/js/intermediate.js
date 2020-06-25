"use strict"

import ReactDOM from 'react-dom'
import React from 'react'
import Context from './components/Context'

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 * 
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {

    constructor(modern_frontend_enabled, context_element) {
        this.modern_frontend_enabled = modern_frontend_enabled
        this.context_element = context_element
    }

    init() {
        if (this.modern_frontend_enabled) {
            ReactDOM.render( <Context />, document.getElementById(this.context_element))
        }

    }

}

export default Intermediate