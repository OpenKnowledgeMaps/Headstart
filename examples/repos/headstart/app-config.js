const options = {
        paper_max_scale: 1,
        paper_min_scale: 1,
        bubble_max_scale: 1,
        bubble_min_scale: 1,
        
        use_area_uri: true,
        input_format: "json",
        base_unit: "citations",
        show_timeline: false,
        show_dropdown: false,
        preview_type: "pdf",
        sort_options: ["readers", "title", "authors", "year"],
        is_force_areas: true,
        language: "eng_pubmed",
        force_areas_alpha: 0.015,
        show_list: true,
        is_content_based: false,

        service_path: "/bubblbu_headstart/server/services"
};

export const app_config = {
    options: options
}

