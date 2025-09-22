var data_config = {
    tag: "visualization",
    mode: "search_repos",

    service: "pubmed",
    bubble_min_scale: 1.2,
    bubble_max_scale: 1,
    paper_min_scale: 1,
    paper_max_scale: 1,
    showLanguage: true,

    // Configuring papers scaling
    base_unit: "citations",
    initial_sort: "citations",
    scale_by: "citations",

    title: "",
    use_area_uri: true,
    show_multiples: false,
    show_dropdown: false,
    preview_type: "pdf",
    sort_options: ["citations", "title", "authors", "year"],
    is_force_areas: true,
    language: "eng_pubmed",
    area_force_alpha: 0.015,
    show_list: true,
    content_based: false,
    
    show_context: true,
    create_title_from_context: true,
    context_most_relevant_tooltip: true,
    
    doi_outlink: true,
    filter_menu_dropdown: true,
    sort_menu_dropdown: true,
    filter_options: ["all", "open_access"],
};
