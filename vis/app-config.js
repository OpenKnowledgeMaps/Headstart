const local_options = {
    paper_max_scale: 1,
    paper_min_scale: 1,
    bubble_max_scale: 1,
    bubble_min_scale: 1,

    use_area_uri: false,
    is_force_areas: false,
    url_prefix: "http://mendeley.com/catalog/",
    show_timeline: false,
    show_dropdown: true,
    show_intro: false
};

const repos_options = {
    paper_max_scale: 1,
    paper_min_scale: 1,
    bubble_max_scale: 1,
    bubble_min_scale: 1,

    use_area_uri: true,
    show_timeline: false,
    show_dropdown: false,
    preview_type: "pdf",
    sort_options: ["readers", "title", "authors", "year"],
    is_force_areas: true,
    language: "eng_pubmed",
    area_force_alpha: 0.015,
    show_list: true,
    is_content_based: false,
};

const static_options = {
    paper_max_scale: 1,
    paper_min_scale: 1,
    bubble_max_scale: 1,
    bubble_min_scale: 1,

    use_area_uri: false,
    is_force_areas: false,
    url_prefix: "http://mendeley.com/catalog/",
    show_timeline: false,
    show_dropdown: true,
    show_intro: false
};

// Toggle the two options to switch between configs
export const app_config = {
    // options: repos_options
    options: local_options
    // options: static_options
}
