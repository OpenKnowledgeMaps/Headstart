var data_config = {
    tag: "visualization",
    mode: "local_files",

    title: "Übersicht für <b>Forschungsfragen zum Thema psychische Gesundheit</b>",
    input_format: "json",
    base_unit: "Nennungen",
    use_area_uri: true,
    
    show_timeline: false,
    show_dropdown: false,
    show_intro: false,
    show_list:true,
    is_force_papers:true,
    is_title_clickable: false,
	
    show_context: true,
    create_title_from_context: false,
    
    scale_toolbar: true,
    
    content_based: false,
    list_sub_entries: true,
    list_show_all_papers: false,
    list_additional_images: true,
    list_images: ["Altersgruppe", "Background", "Bundesland", "Geschlecht",
                    "Höchste Ausbildung", "Land"],
    list_images_path: "img/",
    
    is_force_areas: true,
    area_force_alpha: 0.008,
    
    language: "ger_cris",
    
    sort_options: ["title", "readers"],
    
    sort_menu_dropdown: true,
    visual_distributions: true,
    
    rescale_map: false,
    scale_types: ['Altersgruppe', 'Background', 'Bundesland', 'Geschlecht', 'Höchste Ausbildung', 'Land'],
    scale_explanation: {
        Altersgruppe: 'Die Verteilung für <strong>Altersgruppe</strong> bezieht sich auf das Themenfeld. Anteile in absteigender Reihenfolge.',
        Background: 'Die Verteilung für <strong>Background</strong> bezieht sich auf das Themenfeld. Anteile in absteigender Reihenfolge.',
        Bundesland: 'Die Verteilung für <strong>Bundesländer AT</strong> bezieht sich auf das Themenfeld. Anteile in absteigender Reihenfolge.',
        Geschlecht: 'Die Verteilung für <strong>Geschlecht</strong> bezieht sich auf das Themenfeld. Anteile in absteigender Reihenfolge.',
        'Höchste Ausbildung': 'Die Verteilung für <strong>Höchste Ausbildung</strong> bezieht sich auf das Themenfeld. Anteile in absteigender Reihenfolge.',
        Land: 'Die Verteilung für <strong>Land</strong> bezieht sich auf das Themenfeld. Anteile in absteigender Reihenfolge.',
    },
    scale_label: {
        Altersgruppe: 'Altersgruppe',
        Background: 'Background',
        Bundesland: 'Bundesländer AT',
        Geschlecht: 'Geschlecht',
        'Höchste Ausbildung': 'Höchste Ausbildung',
        Land: 'Land',
    },

    files: [{
        title: "edu1",
        file: "./data/final_output.json"
    }],
};
