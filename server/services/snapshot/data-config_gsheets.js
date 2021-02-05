var data_config = {
    tag: "visualization",
    mode: "gsheets",
    service_name: '<span class="backlink"><a href="data" class="underline" target="_blank" >CoVis database</a></span>',

    bubble_min_scale: 1.1,
    bubble_max_scale: 1.1,

    paper_min_scale: 1,

    input_format: "json",
    base_unit: "questions",
    use_area_uri: true,
    preview_type: "pdf",
    use_hypothesis: true,

    show_multiples: false,
    show_dropdown: false,
    show_intro: false,
    show_list:true,
    is_force_papers: true,
    is_title_clickable: false,
    show_infolink: true,
    show_infolink_areas: false,

    show_context: true,
    create_title_from_context: true,
    show_context_timestamp: true,
    show_loading_screen: true,

    scale_toolbar: false,

    content_based: true,
    is_evaluation: true,
    evaluation_service: ["matomo"],

    is_force_areas: true,
    area_force_alpha: 0.03,
    papers_force_alpha: 0.2,

    sort_options: ["year", "title", "area"],
    filter_options: ["all", "Dataset", "Journal Article", "Preprint", "ReFigure", "Review"],
    filter_field: "resulttype",

    show_keywords: true,
    hide_keywords_overview: false,
    show_tags: true,
    show_comments: true,
    show_resulttype: true,

    sort_menu_dropdown: true,
    filter_menu_dropdown: true,

    share_modal: false,
    hashtags_twitter_card: "COVID19,openscience,discovery"
};
