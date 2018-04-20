var data_config = {
    tag: "visualization",
    mode: "search_repos",
    
    bubble_min_scale: 1.3,
    bubble_max_scale: 1.1,

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
        content_based: 'The size of the bubbles is relative to the number of documents related to them.',
        citation_count: 'The size of the documents and bubbles is relative to the number of citations related to them.',
        cited_by_tweeters_count: 'The size of the documents and bubbles is relative to the number of tweets related to them.',
        'readers.mendeley': 'The size of the documents and bubbles is relative to the number of Mendeley readers related to them.'
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
