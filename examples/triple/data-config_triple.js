var data_config = {
    tag: "visualization",
    mode: "search_repos",

    service: "triple",

    title: "",
    base_unit: "citations",
    use_area_uri: true,
    show_multiples: false,
    show_dropdown: false,
    preview_type: "pdf",
    sort_options: ["relevance", "title", "authors", "year"],
    is_force_areas: true,
    language: "eng_pubmed",
    area_force_alpha: 0.015,
    show_keywords: true,
    show_list: true,
    content_based: true,
    url_prefix: "",

    show_context: true,
    create_title_from_context: true,
    context_most_relevant_tooltip: true,

    doi_outlink: true,
    filter_menu_dropdown: true,
    sort_menu_dropdown: true,
    filter_options: ["all", "open_access"],

    embed_modal: true,
    share_modal: false,

    backend: "api",

    streamgraph_colors: ["#215A66", "#66214A", "#5D40FB", "#CB40FB", "#40C0FB", "#FB4068"
        , "#FBB240", "#40FBC8", "#fee4bc", "#bcfeec", "#c6bcfe", "#febcca"],

    highlight_query_terms: true,
};
