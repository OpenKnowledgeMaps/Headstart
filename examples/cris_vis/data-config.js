var data_config = {
    tag: "visualization",
    mode: "local_files",

    title: "Übersicht für <b>Forschungsfragen zum Thema psychische Gesundheit</b>",
    input_format: "json",
    base_unit: "readers",
    use_area_uri: false,
    is_force_areas: false,
    url_prefix: "http://mendeley.com/catalog/",
    
    show_timeline: false,
    show_dropdown: false,
    show_intro: false,
    show_list:true,
    is_force_papers:true,
	
    show_context: false,
    create_title_from_context: false,
    
    show_context: true,
    show_scales: false,
    
    is_force_areas: true,
    area_force_alpha: 0.008,

    files: [{
        title: "edu1",
        file: "./data/final_output.json"
    }],

    scale_types: ['content_based', 'citation_count', 'cited_by_tweeters_count', 'readers.mendeley'],
    scale_explaination: {
        content_based: 'The size of the bubbles is relative to the number of documents related to them.',
        citation_count: 'The size of the documents and bubbles is relative to the number of citations related to them. The citation data was retrieved from Crossref.',
        cited_by_tweeters_count: 'The size of the documents and bubbles is relative to the number of tweets related to them. The tweet data was retrieved from Altmetric.com.',
        'readers.mendeley': 'The size of the documents and bubbles is relative to the number of Mendeley readers related to them. The readership data was retrieved from Altmetric.com.'
    },
    scale_label: {
        content_based: 'Documents',
        citation_count: 'Citations',
        cited_by_tweeters_count: 'Tweets',
        'readers.mendeley': 'Readers'
    },
    scale_base_unit: {
        citation_count: 'citations',
        cited_by_tweeters_count: 'tweets',
        'readers.mendeley': 'readers'
    },
};
