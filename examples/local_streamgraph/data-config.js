var data_config = {
  tag: "visualization",
  mode: "local_files",

  service: "linkedcat",

  title: "",
  base_unit: "citations",
  use_area_uri: true,
  show_dropdown: false,
  preview_type: "pdf",
  sort_options: ["relevance", "title", "authors", "year"],
  is_force_areas: true,
  language: "ger_linkedcat",
  hyphenation_language: "de",
  area_force_alpha: 0.025,
  show_list: true,
  content_based: true,
  url_prefix: "https://permalink.obvsg.at/",
  show_keywords: true,
  hide_keywords_overview: false,
  convert_author_names: false,

  show_context: true,
  create_title_from_context: true,
  create_title_from_context_style: "linkedcat",

  embed_modal: true,
  share_modal: true,

  url_outlink: true,
  filter_menu_dropdown: false,
  sort_menu_dropdown: true,
  //filter_options: ["all", "open_access"],

  show_context_oa_number: false,

  canonical_url: "https://openknowledgemaps.org",

  hashtags_twitter_card: "",

  streamgraph_colors: [
    "#28a2a3",
    "#671A54",
    "#CC3380",
    "#7acca3",
    "#c999ff",
    "#ffe199",
    "#ccfff2",
    "#99DFFF",
    "#FF99AA",
    "#c5d5cf",
    "#FFBD99",
    "#2856A3",
  ],

  files: [
    {
      title: "streamgraph",
      file: "./data/Hammer-Purgstall.json",
    },
  ],

  is_streamgraph: true,
  is_authorview: true,
  input_format: "json"
};
