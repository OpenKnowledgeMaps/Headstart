var config = {
    bubble_min_scale: 1,
    bubble_max_scale: 1,
    paper_min_scale: 1,
    paper_max_scale: 1,
    zoom_factor: 0.9,
    padding_articles: 0,
    circle_padding: 0,
    dynamic_sizing: false,

    // map
    min_height: 600,
    min_width: 600,
    max_height: 1000,
    timeline_size: 600,

    // map reference sizes
    reference_size: 650,
    max_diameter_size: 50,
    min_diameter_size: 30,
    max_area_size: 110,
    min_area_size: 50,

    // bubbles
    area_title_max_size: 50,

    // papers
    dogear_width: 0.1,
    dogear_height: 0.1,
    paper_width_factor: 1.2,
    paper_height_factor: 1.6,

    // list
    min_list_size: 400,
    max_list_size: 500,
    list_height: 51,
    list_height_correction: 29,

    // preview
    preview_image_width_list: 230,
    preview_image_height_list: 298,
    preview_page_height: 400,
    preview_top_height: 30,
    preview_image_width: 738,
    preview_image_height: 984,
    abstract_small: 250,
    abstract_large: null,

    // data specific settings
    subdiscipline_title: "",
    use_area_uri: false,
    url_prefix: null,
    url_prefix_datasets: null,
    input_format: "csv",
    base_unit: "readers",
    preview_type: "image",

    is_force_areas: false,
    area_force_alpha: 0.02,

    is_force_papers: true,
    papers_force_alpha: 0.1,
    
    dynamic_force_area: false,
    dynamic_force_papers: false,

    render_list: true,
    render_bubbles: true,

    // show
    show_timeline: true,
    show_dropdown: true,
    show_intro: false,
    show_infolink: true,
    show_titlerow: true,
    show_list: false,
    show_context: false,
    show_infolink_areas: false,
    
    create_title_from_context: false,
    is_title_clickable: true,

    sort_options: ["readers", "title", "authors", "year"],
    filter_options: ["all", "open_access", "publication", "dataset"],
    sort_menu_dropdown: false,
    initial_sort: null,
    list_show_all_papers: false,

    content_based: false,

    filter_menu_dropdown: false,
    
    scale_toolbar: false,

    // transition
    transition_duration: 750,
    zoomout_transition: 750,

    // misc
    debug: false,
    debounce: 50,
    service: "none",
    language: "eng",

    // behaviour settings
    is_evaluation: false,
    evaluation_service: "log",
    is_adaptive: false,
    conference_id: 0,
    user_id: 0,
    max_recommendations: 10,

    //intro
    intro: "intro_cris",
    
    use_hypothesis: false,
    
    list_sub_entries: false,
    list_additional_images: false,
    list_images: [],
    list_images_path: "images/",
    visual_distributions: false,
    
    credit_embed: false,
    canonical_url: null,
    
    service_names: {plos: "PLOS", base: "BASE", pubmed: "PubMed", doaj: "DOAJ", openaire: "OpenAIRE"},

    languages: [
        {
          code: 'eng',
          lang_in_eng: 'English',
          lang_in_lang: 'English'
        },
        {
          code: 'fre',
          lang_in_eng: 'French',
          lang_in_lang: 'français'
        },
        {
          code: 'spa',
          lang_in_eng: 'Spanish',
          lang_in_lang: 'español'
        },
        {
          code: 'ger',
          lang_in_eng: 'German',
          lang_in_lang: 'Deutsch'
        },
        {
          code: 'por',
          lang_in_eng: 'Portuguese',
          lang_in_lang: 'português'
        },
        {
          code: 'pol',
          lang_in_eng: 'Polish',
          lang_in_lang: 'Język polski'
        },
        {
          code: 'jpn',
          lang_in_eng: 'Japanese',
          lang_in_lang: '日本語'
        },
        {
          code: 'ita',
          lang_in_eng: 'Italian',
          lang_in_lang: 'italiano'
        },
        {
          code: 'chi',
          lang_in_eng: 'Chinese',
          lang_in_lang: '中文'
        },
        {
          code: 'rus',
          lang_in_eng: 'Russian',
          lang_in_lang: 'русский язык'
        },
        {
          code: 'ind',
          lang_in_eng: 'Indonesian',
          lang_in_lang: 'bahasa Indonesia'
        },
        {
          code: 'ukr',
          lang_in_eng: 'Ukrainian',
          lang_in_lang: 'українська мова'
        },
        {
          code: 'gre',
          lang_in_eng: 'Modern Greek',
          lang_in_lang: 'Νέα Ελληνικά'
        },
        {
          code: 'cze',
          lang_in_eng: 'Czech',
          lang_in_lang: 'čeština'
        },
        {
          code: 'fin',
          lang_in_eng: 'Finnish',
          lang_in_lang: 'suomen kieli'
        },
        {
          code: 'swe',
          lang_in_eng: 'Swedish',
          lang_in_lang: 'svenska'
        },
        {
          code: 'hun',
          lang_in_eng: 'Hungarian',
          lang_in_lang: 'magyar nyelv'
        },
        {
          code: 'tur',
          lang_in_eng: 'Turkish',
          lang_in_lang: 'Türkçe'
        },
        {
          code: 'hrv',
          lang_in_eng: 'Croatian',
          lang_in_lang: 'hrvatski'
        },
        {
          code: 'geo',
          lang_in_eng: 'Georgian',
          lang_in_lang: 'ქართული'
        },
        {
          code: 'grc',
          lang_in_eng: 'Ancient Greek',
          lang_in_lang: 'Ἑλληνική'
        },
        {
          code: 'kor',
          lang_in_eng: 'Korean',
          lang_in_lang: '한국어'
        },
        {
          code: 'slv',
          lang_in_eng: 'Slovenian',
          lang_in_lang: 'slovenščina'
        },
        {
          code: 'sux',
          lang_in_eng: 'Sumerian',
          lang_in_lang: '𒅴𒂠'
        },
        {
          code: 'nob',
          lang_in_eng: 'Norwegian Bokmal',
          lang_in_lang: 'bokmål'
        },
        {
          code: 'rum',
          lang_in_eng: 'Romanian',
          lang_in_lang: 'limba română'
        },
        {
          code: 'ara',
          lang_in_eng: 'Arabic',
          lang_in_lang: 'العَرَبِيَّة'
        },
        {
          code: 'tha',
          lang_in_eng: 'Thai',
          lang_in_lang: 'ภาษาไทย'
        },
        {
          code: 'nor',
          lang_in_eng: 'Norwegian',
          lang_in_lang: 'norsk'
        },
        {
          code: 'lat',
          lang_in_eng: 'Latin',
          lang_in_lang: 'Lingua latīna'
        },
        {
          code: 'dut',
          lang_in_eng: 'Dutch',
          lang_in_lang: 'Nederlands'
        },
        {
          code: 'ice',
          lang_in_eng: 'Icelandic',
          lang_in_lang: 'íslenska'
        },
        {
          code: 'lit',
          lang_in_eng: 'Lithuanian',
          lang_in_lang: 'lietuvių kalba'
        },
        {
          code: 'srp',
          lang_in_eng: 'Serbian',
          lang_in_lang: 'српски'
        },
        {
          code: 'baq',
          lang_in_eng: 'Basque',
          lang_in_lang: 'euskara'
        },
        {
          code: 'gle',
          lang_in_eng: 'Irish',
          lang_in_lang: 'Gaeilge'
        },
        {
          code: 'afr',
          lang_in_eng: 'Afrikaans',
          lang_in_lang: 'Afrikaans'
        },
        {
          code: 'heb',
          lang_in_eng: 'Hebrew',
          lang_in_lang: 'עברית'
        },
        {
          code: 'dan',
          lang_in_eng: 'Danish',
          lang_in_lang: 'dansk'
        },
        {
          code: 'akk',
          lang_in_eng: 'Akkadian',
          lang_in_lang: '𒀝𒅗𒁺𒌑'
        },
        {
          code: 'slo',
          lang_in_eng: 'Slovak',
          lang_in_lang: 'slovenčina'
        },
        {
          code: 'nau',
          lang_in_eng: 'Nauru',
          lang_in_lang: 'dorerin Naoero'
        },
        {
          code: 'est',
          lang_in_eng: 'Estonian',
          lang_in_lang: 'eesti keel'
        },
        {
          code: 'vie',
          lang_in_eng: 'Vietnamese',
          lang_in_lang: 'Tiếng Việt'
        },
        {
          code: 'bel',
          lang_in_eng: 'Belarusian',
          lang_in_lang: 'Беларуская мова'
        },
        {
          code: 'glg',
          lang_in_eng: 'Galician',
          lang_in_lang: 'galego'
        },
        {
          code: 'ota',
          lang_in_eng: 'Ottoman Turkish',
          lang_in_lang: 'لسان عثمانى'
        },
        {
          code: 'per',
          lang_in_eng: 'Persian',
          lang_in_lang: 'فارسی'
        }
      ],

    localization: {
        eng: {
            loading: "Loading...",
            search_placeholder: "Search within map...",
            show_list: "Show list",
            hide_list: "Hide list",
            intro_label: "",
            intro_icon: "&#xf05a;",
            readers: "readers",
            year: "date",
            authors: "authors",
            title: "title",
            default_title: 'Overview of <span id="num_articles"></span> documents',
            overview_label: 'Overview of',
            articles_label: 'documents',
            most_recent_label: 'most recent',
            source_label: 'Source',
            documenttypes_label: 'Document types',
            area: "Area",
            keywords: "Keywords",
            no_title: "No title",
            default_area: "No area",
            default_author: "",
            default_id: "defaultid",
            default_hash: "hashHash",
            default_abstract: "No Abstract",
            default_published_in: "",
            default_readers: 0,
            default_url: "",
            default_x: 1.,
            default_y: 1.,
            default_year: "",
            sort_by_label: 'sort by:',
        },
        ger: {
            loading: "Wird geladen...",
            search_placeholder: "Suche in der Liste...",
            show_list: "Liste ausklappen",
            hide_list: "Liste einklappen",
            intro_label: "",
            intro_icon: "&#xf05a;",
            readers: "Leser",
            year: "Jahr",
            authors: "Autor",
            title: "Titel",
            default_title: 'Überblick über <span id="num_articles"></span> Artikel',
            overview_label: 'Überblick über',
            most_recent_label: 'neueste',
            articles_label: 'Artikel',
            source_label: 'Quelle',
            documenttypes_label: 'Publikationsarten',
            area: "Bereich",
            keywords: "Keywords",
            no_title: "Kein Titel",
            default_area: "Kein Bereich",
            default_author: "",
            default_id: "defaultid",
            default_hash: "hashHash",
            default_abstract: "",
            default_published_in: "",
            default_readers: 0,
            default_url: "",
            default_x: 1.,
            default_y: 1.,
            default_year: ""
        },
        eng_plos: {
            loading: "Loading...",
            search_placeholder: "Search within map...",
            show_list: "Show list",
            hide_list: "Hide list",
            intro_label: "",
            intro_icon: "&#xf05a;",
            readers: "views",
            year: "date",
            authors: "authors",
            title: "title",
            area: "Area",
            keywords: "Keywords",
            no_title: "No title",
            overview_label: 'Overview of',
            articles_label: 'documents',
            most_recent_label: 'most recent',
            source_label: 'Source',
            documenttypes_label: 'Article types',
            default_area: "No area",
            default_author: "",
            default_id: "defaultid",
            default_hash: "hashHash",
            default_abstract: "No Abstract",
            default_published_in: "",
            default_readers: 0,
            default_url: "",
            default_x: 1.,
            default_y: 1.,
            default_year: "",
            sort_by_label: 'sort by:',
        },
        eng_pubmed: {
            loading: "Loading...",
            search_placeholder: "Search within map...",
            show_list: "Show list",
            hide_list: "Hide list",
            intro_label: "",
            intro_icon: "&#xf05a;",
            relevance: "relevance",
            readers: "citations",
            year: "year",
            authors: "authors",
            title: "title",
            area: "Area",
            keywords: "Keywords",
            no_title: "No title",
            overview_label: 'Overview of',
            articles_label: 'documents',
            most_recent_label: 'most recent',
            source_label: 'Source',
            documenttypes_label: 'Article types',
            default_area: "No area",
            default_author: "",
            default_id: "defaultid",
            default_hash: "hashHash",
            default_abstract: "No Abstract",
            default_published_in: "",
            default_readers: 0,
            default_url: "",
            default_x: 1.,
            default_y: 1.,
            default_year: "",
            sort_by_label: 'sort by:',
            filter_by_label: 'show: ',
            all: "any",
            open_access: "Open Access",
            link: 'link',
            items: "items",
            embed_button_text: 'Copy',
            embed_title: 'embed map',
        },
        eng_openaire: {
            loading: "Loading...",
            search_placeholder: "Search within map...",
            show_list: "Show list",
            hide_list: "Hide list",
            intro_label: "more info",
            intro_icon: "",
            relevance: "relevance",
            readers: "readers",
            tweets: "tweets",
            year: "year",
            authors: "authors",
            citations: "citations",
            title: "title",
            area: "Area",
            keywords: "Keywords",
            no_title: "No title",
            overview_label: 'Overview of',
            articles_label: 'documents',
            most_recent_label: 'most recent',
            source_label: 'Source',
            documenttypes_label: 'Article types',
            default_area: "No area",
            default_author: "",
            default_id: "defaultid",
            default_hash: "hashHash",
            default_abstract: "No Abstract",
            default_published_in: "",
            default_readers: 0,
            default_url: "",
            default_x: 1.,
            default_y: 1.,
            default_year: "",
            dataset_count_label: "datasets",
            paper_count_label: "papers",
            viper_edit_title: "How to add project resources",
            viper_edit_desc_label: `<p>Are you missing relevant publications and datasets related to this project? \ 
            <p>No problem: simply link further resources on the OpenAIRE website. \ 
            The resources will then be be automatically added to the map. \ 
            <p>Use the button indicated in the exemplary screenshot to do so: `,
            viper_button_desc_label: `<p>By clicking on the button below, you are redirected to the\
                OpenAIRE page for`,
            viper_edit_button_text: 'continue to openaire',
            embed_button_text: 'Copy',
            embed_title: 'embed map',
            link: 'link',
            tweets_count_label: " tweets",
            readers_count_label: " readers (Mendeley)",
            citations_count_label: " citations (Crossref)",
            filter_by_label: 'show: ',
            all: "any",
            open_access: "Open Access",
            publication: "papers",
            dataset: "datasets",
            items: "items",
            sort_by_label: 'sort by:',
            scale_by_label: 'Scale map by:',
            scale_by_infolink_label: 'notes on use of metrics',
            credit_alt: "VIPER was created by Open Knowledge Maps",
        },
         ger_cris: {
            loading: "Wird geladen...",
            search_placeholder: "Suchwort eingeben",
            show_list: "Liste ausklappen",
            hide_list: "Liste einklappen",
            intro_label: "mehr Informationen",
            intro_icon: "&#xf129;",
            intro_label_areas: "Verteilung der Respondenten",
            intro_areas_title: "Verteilung der Respondenten für ",
            readers: "Nennungen",
            year: "Jahr",
            authors: "Autor",
            title: "alphabetisch",
            default_title: 'Überblick über <span id="num_articles"></span> Artikel',
            overview_label: 'Überblick über',
            most_recent_label: 'neueste',
            articles_label: 'Artikel',
            source_label: 'Quelle',
            documenttypes_label: 'Publikationsarten',
            area: "Themenfeld",
            keywords: "Keywords",
            no_title: "Kein Titel",
            default_area: "Kein Bereich",
            default_author: "",
            default_id: "defaultid",
            default_hash: "hashHash",
            default_abstract: "",
            default_published_in: "",
            default_readers: 0,
            default_url: "",
            default_x: 1.,
            default_y: 1.,
            default_year: "",
            showmore_questions_label: "Alle",
            showmore_questions_verb: "Fragen anzeigen",
            distributions_label: "Verteilungen ",
            show_verb_label: "ausklappen",
            hide_verb_label: "einklappen",
            sort_by_label: 'sortieren: ',
            items: "Themen",
            scale_by_infolink_label: '',
            scale_by_label: 'Verteilung für:',
            credit_alt: "Created by Open Knowledge Maps",
        },
    },

    scale_types: [],
    rescale_map: true,
    cris_legend: false,

    url_plos_pdf: "http://www.plosone.org/article/fetchObject.action?representation=PDF&uri=info:doi/",
    plos_journals_to_shortcodes: {
        "plos neglected tropical diseases": "plosntds",
        "plos one": "plosone",
        "plos biology": "plosbiology",
        "plos medicine": "plosmedicine",
        "plos computational Biology": "ploscompbiol",
        "plos genetics": "plosgenetics",
        "plos pathogens": "plospathogens",
        "plos clinical trials": "plosclinicaltrials"
    }
};

if (config.content_based) {
    config.sort_options = ["title", "area"];
}

export default config;
