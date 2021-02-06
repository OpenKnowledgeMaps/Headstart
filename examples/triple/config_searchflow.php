<?php

$search_flow_config_local = array(
    "params_arrays" => array(
        "triple_km" => array("from", "to", "sorting", "language", "limit")
            , "triple_sg" => array("from", "to", "sorting", "language", "limit", "sg_method")
    )
);

?>
<script>
var search_flow_config_local = {
    search_options: {
            options: [
                { id: "triple_sg", name: "Streamgraph TRIPLE", disabled: false, default: false 
                    , text: "Streamgraph", description: ""
                    , script: "searchTRIPLE.php", milliseconds_progressbar: 800
                    , max_length_search_term_short: 115, timeout: 120000

                }
                , { id: "triple_km", name: "Knowledge Map TRIPLE", disabled: false, default: true 
                    , text: "Knowledge Map", description: ""
                    , script: "searchTRIPLE.php", milliseconds_progressbar: 800
                    , max_length_search_term_short: 115, timeout: 120000
                }
            ] 
            , examples: {
                examples_integration1: {
                    example_text: "Try out:",
                    examples: [
                        {text: "covid-19", link: "url"}
                    ]
                }
            }
            , waiting_page_options: {
                vis_page_cool_uri: false
                // Parameters for the vis page
                // id: id in post_params array
                // name: name of the param passed to vis page
                // (optional) value: a specific value for this parameter
                //      example: { id: 'embed', name: 'embed', value: 'true' } sets parameter 'embed' to true
                //      you can also transform parameter values here with key value pairs
                //      , e.g. value: {'triple_km': 'overview', 'triple_sg': 'timeline'} 
                , vis_page_params: [
                    { id: 'unique_id', name: 'id' }
                    , {id: "optradio", "name": "vis_type", value: {'triple_km': 'overview', 'triple_sg': 'timeline'}}
                ]
            }
            , filter_options: {

                options_triple_km: {
                    start_date: "1809",
                    dropdowns: [
                        {id: "year_range", multiple: false, name: "Time Range", type: "dropdown"
                            , fields: [
                                {id: "any-time-years", text: "Any year"}
                                , {id: "this-year", text: "This year"}
                                , {id: "last-year-years", text: "Last year"}
                                , {id: "user-defined", text: "Custom range", class: "user-defined",
                                    inputs: [
                                        {id: "from", label: "From: ", class: "time_input"}
                                        , {id: "to", label: "To: ", class: "time_input"}
                                    ]}
                            ]},
                        {id: "sorting", multiple: false, name: "Sorting", type: "dropdown"
                            , fields: [
                                {id: "most-relevant", text: "Most relevant"}
                                , {id: "most-recent", text: "Most recent"}
                            ]},
                        {id: "language", multiple: false, name: "Language", type: "dropdown"
                            , fields: [
                                {id: "all", text: "All languages"},
                                {id: "en", text: "English"},
                                {id: "fr", text: "Français"},
                                {id: "es", text: "Español"}
                            ]},
                        {id: "limit", multiple: false, name: "Limit", type: "dropdown"
                            , fields: [
                                {id: "100", text: "100 documents"},
                                {id: "1000", text: "1000 documents"}
                            ]}
                    ]}
                , options_triple_sg: {
                    start_date: "1809",
                    dropdowns: [
                        {id: "year_range", multiple: false, name: "Time Range", type: "dropdown"
                            , fields: [
                                {id: "any-time-years", text: "Any year"}
                                , {id: "this-year", text: "This year"}
                                , {id: "last-year-years", text: "Last year"}
                                , {id: "user-defined", text: "Custom range", class: "user-defined",
                                    inputs: [
                                        {id: "from", label: "From: ", class: "time_input"}
                                        , {id: "to", label: "To: ", class: "time_input"}
                                    ]}
                            ]},
                        {id: "sorting", multiple: false, name: "Sorting", type: "dropdown"
                            , fields: [
                                {id: "most-relevant", text: "Most relevant"}
                                , {id: "most-recent", text: "Most recent"}
                            ]},
                        {id: "language", multiple: false, name: "Language", type: "dropdown"
                            , fields: [
                                {id: "all", text: "All languages"},
                                {id: "en", text: "English"},
                                {id: "fr", text: "Français"},
                                {id: "es", text: "Español"}
                            ]},
                        {id: "limit", multiple: false, name: "Limit", type: "dropdown"
                            , fields: [
                                {id: "100", text: "100 documents"},
                                {id: "1000", text: "1000 documents"}
                            ]}
                        , {id: "sg_method", multiple: false, name: "Streamgraph method", type: "dropdown"
                            , fields: [
                                {id: "count", text: "Count"},
                                {id: "tfidf", text: "TF-IDF"},
                                {id: "nmf", text: "NMF"},
                                {id: "lda", text: "LDA"}
                            ]}
                    ]}
            }
            
        }
    }
 </script>