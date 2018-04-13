var data_config = {
    tag: "visualization",
    mode: "search_repos",

    service: "openaire",
    base_unit: "citations",
    use_area_uri: true,
    show_timeline: false,
    show_dropdown: false,
    preview_type: "pdf",
    sort_options: ["title", "authors", "year"],
    is_force_areas: true,
    language: "eng_openaire",
    area_force_alpha: 0.015,
    show_list: true,
    content_based: true,
    url_prefix: "https://www.openaire.eu/search/publication?articleId=",
    url_prefix_datasets: "https://www.openaire.eu/en/search/dataset?datasetId=",
    
    show_context: true,
    create_title_from_context: true,
    create_title_from_context_style: 'openaire',
    infolink_style: 'openaire',
    
    viper_edit_modal: true,
    viper_embed_modal: true,

    intro: 'intro_openaire',
    
    scale_types: ['content_based', 'citation_count', 'cited_by_tweeters_count', 'readers.mendeley'],
    scale_explaination: {
        content_based: 'Scaled by number of documents',
        citation_count: 'Scaled by number of citations',
        cited_by_tweeters_count: 'Scaled by number of tweets',
        'readers.mendeley': 'Scaled by number of Mendeley readers'
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
