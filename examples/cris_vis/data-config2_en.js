var data_config = {
    tag: "visualization",
    mode: "local_files",
    
    bubble_min_scale: 1.2,
    bubble_max_scale: 1.1,
    
    paper_min_scale: 0.8,

    title: "Overview of <b>research questions about accidental injuries</b>",
    input_format: "json",
    base_unit: "questions",
    use_area_uri: true,
    preview_type: "pdf",
    
    show_multiples: false,
    show_dropdown: false,
    show_intro: false,
    show_list:true,
    is_force_papers:true,
    is_title_clickable: false,
    show_infolink_areas: false,
	
    show_context: true,
    create_title_from_context: false,
    
    scale_toolbar: false,
    
    content_based: false,
    list_sub_entries: true,
    list_sub_entries_readers: false,
    list_sub_entries_statistics: false,
    list_sub_entries_number: true,
    list_show_all_papers: false,
    list_additional_images: false,
    
    is_force_areas: true,
    area_force_alpha: 0.02,
    papers_force_alpha: 0.2,
    
    language: "eng_cris_2",
    
    sort_options: ["title", "readers", "area"],
    
    sort_menu_dropdown: true,
    visual_distributions: false,
    cris_legend: false,
    credit: true,
    
    is_evaluation: false,
    evaluation_service: "ga",

    files: [{
        title: "EN",
        file: "./data/final_output2_en.json"
    }]
};
