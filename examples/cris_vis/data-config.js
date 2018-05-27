var data_config = {
    tag: "visualization",
    mode: "local_files",

    title: "Übersicht für <b>Forschungsfragen zum Thema psychische Gesundheit</b>",
    input_format: "json",
    base_unit: "Nennungen",
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
    scale_toolbar: false,
    
    content_based: false,
    list_sub_entries: true,
    
    is_force_areas: true,
    area_force_alpha: 0.008,
    
    language: "ger_cris",

    files: [{
        title: "edu1",
        file: "./data/final_output.json"
    }],
};
