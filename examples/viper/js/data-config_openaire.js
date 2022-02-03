var data_config = {
    tag: "visualization",
    mode: "search_repos",

    bubble_min_scale: 1,
    bubble_max_scale: 1,
    
    paper_min_scale: 1,
    paper_max_scale: 1,
    
    dynamic_sizing: true,
    dynamic_force_area: true,
    dynamic_force_papers: true,

    service: "openaire",
    base_unit: "citations",
    use_area_uri: true,
    preview_type: "pdf",
    sort_options: ["title", "authors", "year", "citations", "tweets", "readers"],
    filter_menu_dropdown: true,
    is_force_areas: true,
    language: "eng_openaire",
    area_force_alpha: 0.015,
    show_list: true,
    content_based: true,
    url_prefix: "https://www.openaire.eu/search/publication?articleId=",
    url_prefix_datasets: "https://www.openaire.eu/en/search/dataset?datasetId=",
    
    show_context: true,
    create_title_from_context: true,
    create_title_from_context_style: 'viper',
    
    viper_edit_modal: true,
    embed_modal: true,
    share_modal: true,

    doi_outlink: true,

    metric_list: true,
    
    credit: false,

    scale_toolbar: true,
    
    scale_types: ['content_based', 'citation_count', 'cited_by_tweeters_count', 'readers.mendeley'],
    scale_explanation: {
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
    
    is_evaluation: true,
    
    use_hypothesis: true,
    
};
