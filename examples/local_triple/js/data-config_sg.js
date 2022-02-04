var data_config = {
  tag: "visualization",
  mode: "local_files",
  input_format: "json",

  service: "triple",

  title: "",
  base_unit: "citations",
  use_area_uri: true,
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

  doi_outlink: true,
  filter_menu_dropdown: true,
  sort_menu_dropdown: true,
  filter_options: ["all", "open_access"],

  embed_modal: true,
  share_modal: true,
  hashtags_twitter_card: "okmaps,openscience,dataviz,GOTRIPLE",
  faqs_button: false,
  faqs_url: "https://openknowledgemaps.org/faq",

  streamgraph_colors: [
    "#215A66",
    "#66214A",
    "#5D40FB",
    "#CB40FB",
    "#40C0FB",
    "#FB4068",
    "#FBB240",
    "#40FBC8",
    "#fee4bc",
    "#bcfeec",
    "#c6bcfe",
    "#febcca",
  ],

  highlight_query_terms: true,
  filter_menu_dropdown: false,

  show_cite_button: true,

  show_context_oa_number: false,
};
