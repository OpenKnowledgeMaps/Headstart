import { localization } from "@js/i18n/localization";
import { VisualizationTypes } from "@js/types/visualization/visualization-types";

type PaperSettings = {
  showSocialMedia: boolean;
  showReferences: boolean;
  showCitations: boolean;
  showReaders: boolean;
  showTweets: boolean;
  showPubmedCitations: boolean;
};

type ServiceNames = {
  [key: string]: string;
};

export type Config = {
  render_list: boolean;
  render_map: boolean;
  scale_toolbar: boolean;
  is_authorview: boolean;
  content_based: boolean;
  tag: string;

  metric_list?: boolean;
  showDataSource?: boolean;

  min_height: number;
  min_width: number;
  max_height: number;

  reference_size: number;
  max_diameter_size: number;
  min_diameter_size: number;
  max_area_size: number;
  min_area_size: number;

  bubble_min_scale: number;
  bubble_max_scale: number;
  paper_min_scale: number;
  paper_max_scale: number;
  dynamic_sizing: boolean;

  dogear_width: number;
  dogear_height: number;
  paper_width_factor: number;
  paper_height_factor: number;

  is_force_areas: boolean;
  area_force_alpha: number;
  is_force_papers: boolean;
  papers_force_alpha: number;
  dynamic_force_area: boolean;
  dynamic_force_papers: boolean;

  zoom_factor: number;

  mode: string;
  language: string;
  hyphenation_language: string;
  use_hypothesis: boolean;
  service: string;
  show_intro: boolean;
  show_loading_screen: boolean;
  is_evaluation: boolean;
  enable_mouseover_evaluation: boolean;
  credit_embed: boolean;
  use_area_uri: boolean;
  url_prefix: string | null;
  url_prefix_datasets: string | null;
  input_format: string;
  base_unit: string;
  preview_type: string;
  convert_author_names: boolean;
  debug: boolean;

  show_context: boolean;
  create_title_from_context: boolean;
  create_title_from_context_style: string;
  custom_title: string | null;
  show_context_oa_number: boolean;
  show_context_timestamp: boolean;

  show_list: boolean;
  doi_outlink: boolean;
  url_outlink: boolean;
  show_keywords: boolean;
  hide_keywords_overview: boolean;
  show_resulttype: boolean;
  sort_options: string[];
  filter_options: string[];
  filter_field: string | null;
  initial_sort: string | null;

  highlight_query_terms: boolean;
  highlight_query_fields: string[];

  filter_menu_dropdown: boolean;
  list_images: string[];
  list_images_path: string;
  visual_distributions: boolean;
  external_vis_url: string;

  embed_modal: boolean;
  share_modal: boolean;
  hashtags_twitter_card: string;
  faqs_button: boolean;
  faqs_url: string;
  show_cite_button: boolean;
  cite_papers: boolean;
  no_citation_doctypes: string[];
  export_papers: boolean;
  show_twitter_button: boolean;
  show_email_button: boolean;
  paper: PaperSettings;

  streamgraph_colors: string[];

  user_id: number;
  max_documents: number;
  service_names: ServiceNames;

  localization: typeof localization;

  scale_types: any[];

  scale_by?: string;
  server_url?: string;
  files?: {
    title: string;
    file: string;
  }[];

  max_width?: number;
  modal_info_type?: string;
  credit?: boolean;
  timestamp?: string;
  options?: {
    languages?: {
      code: string;
      lang_in_lang: string;
      lang_in_eng: string;
    }[];
  };
  is_force_area?: boolean;

  visualization_type: VisualizationTypes;

  geomap: {
    featuresConfiguration: {
      isWithLayerSwitcher: boolean;
      isWithZoomControl: boolean;
    };
  };
};
