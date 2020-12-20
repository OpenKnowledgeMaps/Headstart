var search_options = {
    disabled_message: "Undergoing downtime - please try again later!"
    , search_term_focus: true
    , show_filters: false
    , filters_text: "Refine your search"
    , options: [
        { id: "sg", name: "Streamgraph TRIPLE", disabled: false, default: false 
            , text: "Streamgraph", description: ""
            , script: "searchTRIPLE.php", milliseconds_progressbar: 800
            , max_length_search_term_short: 115, timeout: 120000
            
        }
        , { id: "km", name: "Knowledge Map TRIPLE", disabled: false, default: true 
            , text: "Knowledge Map", description: ""
            , script: "searchTRIPLE.php", milliseconds_progressbar: 800
            , max_length_search_term_short: 115, timeout: 120000
        }
    ]
}

var examples_sg = {
    example_text: "Try out:", 
    examples : [
    ]
}

var examples_km = {
    example_text: "Try out:", 
    examples : [
    ]
}

var options_km = {
    dropdowns: [
        {id: "year_range", multiple: false, name: "Time Range", type: "dropdown"
            , fields: [
                {id: "any-time-years", text: "Any time"}
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


options_sg = $.extend(true, {}, options_km); 
options_sg.dropdowns.push(
        {id: "sg_method", multiple: false, name: "Streamgraph method", type: "dropdown"
            , fields: [
                {id: "count", text: "Count"},
                {id: "tfidf", text: "TF-IDF"},
                {id: "nmf", text: "NMF"},
                {id: "lda", text: "LDA"}
            ]}
)