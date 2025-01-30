import { Config } from "./@types/config";
import { localization } from "./i18n/localization";


/* eslint-disable no-template-curly-in-string */
var config: Config = {
  /*** basic visualization modes ***/
  //show list
  render_list: true,
  //show map
  render_map: true,
  //show toolbar at the bottom
  scale_toolbar: false,
  //show author-based view
  is_authorview: false,
  //when set to true, scale map using metrics
  content_based: false,
  //show streamgraph instead of map
  is_streamgraph: false,
  //tag that headstart is appended to
  tag: "visualization",

  /*** basic map dimensions for the canvas (in pixels) ***/
  //minimum height
  min_height: 600,
  //minimum width
  min_width: 600,
  //maximum height
  max_height: 1000,

  /*** reference sizes for the map, bubbles and papers (in pixels) ***/
  // map reference size
  reference_size: 650,
  //max paper size
  max_diameter_size: 50,
  //min paper size
  min_diameter_size: 30,
  //max bubble size
  max_area_size: 110,
  //min bubble size
  min_area_size: 50,

  /*** adapt min and max sizes for bubbles and papers (1 = reference size) ***/
  bubble_min_scale: 1,
  bubble_max_scale: 1,
  paper_min_scale: 1,
  paper_max_scale: 1,
  //enables a mode for dynamic sizing based on the number of papers (for n > 150)
  dynamic_sizing: false,

  /*** paper ratios ***/
  // dogear height and width in relationship to paper height and widht
  dogear_width: 0.1,
  dogear_height: 0.1,
  //paper width and height ratios (currently at the golden cut)
  paper_width_factor: 1.2,
  paper_height_factor: 1.6,

  /*** basic list sizes (in pixels) ***/
  //currently set inline - should be moved to config

  /*** force-directed layout settings ***/
  //enable force-directed layout for bubbles
  is_force_areas: false,
  //alpha for force-directed layout for bubbles
  area_force_alpha: 0.02,

  //enable force-directed layout for papers
  is_force_papers: true,
  //alpha for force-directed layout for papers
  papers_force_alpha: 0.1,

  //enables a mode for dynamic alpha setting for force-directed layouts
  dynamic_force_area: false,
  dynamic_force_papers: false,

  /*** zoom settings ***/
  //correction factor for zoomed in bubble size
  zoom_factor: 0.9,

  /*** basic data- and third-party-service related settings ***/
  //mode for retrieving data
  mode: "local_files",
  //language specification to use (see localization object)
  language: "eng",
  //language used for hyphenation
  hyphenation_language: "en",
  //if set to true, Hypothes.is reader will be used for PDF viewing (make sure the related submodule is checked out)
  //if set to false, the default pdf viewer of the browser will be used
  use_hypothesis: false,
  //bubbles have area uris in the data (if set to false, bubble titles are used)
  //service providing the data
  service: "none",
  //display intro dialog after the page opens (true/false)
  show_intro: false,
  //show loading screen before map is loaded (true/false)
  show_loading_screen: false,
  //evaluation mode/events logging
  is_evaluation: false,
  //enable logging of mouseover events (use only temporarily as it creates A LOT of logging events)
  enable_mouseover_evaluation: false,
  //whether to embed the okmaps credit
  credit_embed: false,
  use_area_uri: false,
  //add a prefix to paper urls
  url_prefix: null,
  url_prefix_datasets: null,
  //data input format
  input_format: "csv",
  //base unit for metrics
  base_unit: "readers",
  //preview type (currently we support only pdf)
  preview_type: "pdf",
  //convert author names from "[last name], [first name]" to "[first name] [last name]"
  convert_author_names: true,
  //adds some (currently very limited) debug output to the browser console
  debug: false,

  /*** settings for title and context line ***/
  //show context line
  show_context: false,
  //create title from context
  create_title_from_context: false,
  //create title from context style
  create_title_from_context_style: "",
  //set a custom title
  custom_title: null,
  //show number of open access documents in context
  show_context_oa_number: true,
  //show timestamp in the context line
  show_context_timestamp: false,

  /*** list behaviour ***/
  //show list onload (can be shown on click)
  show_list: false,
  //show doi outlinks in list entry (requires presence of doi attribute in data)
  doi_outlink: false,
  //show url outlink in list entry
  url_outlink: false,
  //show keywords in list entry
  show_keywords: false,
  //hide keywords when paper is not selected
  hide_keywords_overview: true,
  //show result type (document type) in list entry
  show_resulttype: false,
  //sort options for sort dropdown
  sort_options: ["readers", "title", "authors", "year"],
  //filter options for filter dropdown
  filter_options: ["all", "open_access", "publication", "dataset"],
  //custom data property to filter for. if null, defaults are used with above filter options
  filter_field: null,
  //initial field used for sorting
  initial_sort: null,

  highlight_query_terms: false,
  highlight_query_fields: [
    "title",
    "authors_string",
    "paper_abstract",
    "year",
    "published_in",
    "subject_orig",
  ],

  //display filter menu dropdown
  filter_menu_dropdown: false,
  list_images: [],
  list_images_path: "images/",
  visual_distributions: false,
  external_vis_url: "",

  /*** button/modal settings ***/
  //show embed modal button
  embed_modal: false,
  //show share modal button
  share_modal: false,
  //hashtags for twitter cards (share modal)
  hashtags_twitter_card: "okmaps,openscience,dataviz",
  //show button with link to faqs
  faqs_button: false,
  //url for link to faqs
  faqs_url: "",
  // show citation button for the whole map
  show_cite_button: false,
  // show citation button for each paper
  cite_papers: false,
  // list of document types where the citation button is hidden
  no_citation_doctypes: [],
  // show export button for each paper
  export_papers: false,
  // show twitter sharing button
  show_twitter_button: false,
  // show email sharing button
  show_email_button: false,
  paper: {
    showSocialMedia: false,
    showReferences: false,
    showCitations: false,
    showReaders: false,
    showTweets: false,
  },
  /*** streamgraph settings ***/
  //streamgraph color definition
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

  user_id: 0,
  max_documents: 100,
  //service names
  service_names: {
    plos: "PLOS",
    base: "BASE",
    pubmed: "PubMed",
    doaj: "DOAJ",
    openaire: "OpenAIRE",
    triple_km: "GoTriple",
    triple_sg: "GoTriple",
    orcid: "ORCID",
  },

  localization: localization,

  scale_types: [],
};

if (config.content_based) {
  config.sort_options = ["title", "area"];
}

export default config;
