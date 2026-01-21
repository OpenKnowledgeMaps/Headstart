export interface Localization {
  loading: string;
  noDataAvailable: string;
  showMore: string;
  showLess: string;
  search_placeholder: string;
  intro_label: string;
  readers: string;
  year: string;
  authors: string;
  title: string;
  default_title: string;
  overview_label: string;
  streamgraph_label: string;
  overview_authors_label: string;
  streamgraph_authors_label: string;
  geomap_label: string;
  custom_title_explanation: string;
  articles_label: string;
  most_recent_label: string;
  most_relevant_label: string;
  most_relevant_tooltip: string;
  most_relevant_tooltip_sg: string;
  source_label: string;
  resulttype_label: string;
  documenttypes_label: string;
  documenttypes_tooltip: string;
  area: string;
  items: string;
  backlink: string;
  backlink_list: string;
  backlink_list_streamgraph: string;
  backlink_list_streamgraph_stream_selected: string;
  keywords: string;
  doctypes: string;
  unknown: string;
  no_keywords: string;
  notAvailable: string;
  default_area: string;
  default_author: string;
  default_id: string;
  default_hash: string;
  default_abstract: string;
  default_paper_title: string;
  default_authors: string;
  default_published_in: string;

  // default_readers: number;
  default_url: string;
  default_x: number;
  default_y: number;
  link: string;
  default_year: string;
  embed_button_text: string;
  copied_button_text: string;
  sort_by_label: string;
  comment_by_label: string;
  pdf_not_loaded: string;
  pdf_not_loaded_linktext: string;
  share_button_title: string;
  share_button_title_sg: string;
  embed_title: string;
  embed_button_title: string;
  embed_button_title_sg: string;
  embed_body_text: string;
  area_streamgraph: string;
  stream_year: string;
  stream_doc_num: string;
  stream_docs: string;
  stream_total: string;
  empty_area_warning: string;
  lang_all: string;
  cite: string;
  filter_by_label: string;
  cite_title_km: string;
  cite_title_sg: string;
  citation_template: string;
  cite_vis_km: string;
  cite_vis_sg: string;
  cite_paper: string;
  export_paper: string;
  download: string;
  please_note: string;
  scale_by_label: string;
  citation_warning: string;

  relevance: string;
  all: string;
  bio_link: string;
  basic_classification: string;
  pdf_load_text: string;
  open_access: string;

  high_metadata_quality: string;
  high_metadata_quality_desc_base: string;
  high_metadata_quality_desc_pubmed: string;
  high_metadata_quality_desc_aquanavi: string;
  low_metadata_quality: string;
  low_metadata_quality_desc_base: string;
  low_metadata_quality_desc_pubmed: string;
  low_metadata_quality_desc_aquanavi: string;
  time_frame_context_sg: string;
  citations_count_label: string;
  social_media_count_label: string;
  references_count_label: string;
  citations: string;
  social: string;
  references: string;
  metrics_label: string;
  researcher_details_label: string;
  scale_by_explanation: string;
  scale_label: {
    "content_based": string;
    "citations": string;
    "cited_by_accounts_count": string;
    "references": string;
    "citation_count": string;
    "cited_by_tweeters_count": string;
    "readers.mendeley": string;
  };
  tweets: string;
  dataset_count_label: string;
  paper_count_label: string;
  viper_edit_title: string;
  viper_edit_desc_label: string;
  viper_button_desc_label: string;
  viper_edit_button_text: string;
  tweets_count_label: string;
  readers_count_label: string;
  publication: string;
  dataset: string;
  timestamp_label: string;
  location: string;
  location_fallback: string;
}

export const localization: {
  [key: string]: Partial<Localization>;
} = {
  eng: {
    loading: "Loading...",
    noDataAvailable: "No data available",
    showMore: "Show more",
    showLess: "Show less",
    search_placeholder: "Search within visualization...",
    intro_label: "More information",
    readers: "readers",
    year: "date",
    authors: "authors",
    title: "title",
    default_title: 'Overview of <span id="num_articles"></span> documents',
    overview_label: "Knowledge Map of",
    streamgraph_label: "Streamgraph of",
    overview_authors_label: "Knowledge Map of the works of",
    streamgraph_authors_label: "Streamgraph of the works of",
    geomap_label: "Geo Map of",
    custom_title_explanation:
      "This is a custom title. Please see the info button for more information. Original query:",
    articles_label: "documents",
    most_recent_label: "most recent",
    most_relevant_label: "most relevant",
    most_relevant_tooltip:
      "At the moment, we use the relevance ranking provided by the source API. Both PubMed and BASE mainly use text similarity between your query and the article metadata to determine the relevance. Please consult the FAQ for more information.",
    most_relevant_tooltip_sg:
      "In this streamgraph you find the most relevant documents matching your query related to the top keywords. To determine the most relevant documents, we use the relevance ranking provided by the data source e.g. BASE. Data sources mainly use text similarity between your query and the article metadata to determine the relevance ranking. Please consult the FAQs for more information.",
    source_label: "Data source",
    resulttype_label: "Document type",
    documenttypes_label: "Document types",
    readers_count_label: "readers",
    documenttypes_tooltip:
      "The following document types were taken into consideration in the creation of this visualization (not all of them may appear in the visualization):",
    area: "Area",
    items: "items",
    backlink: "← Back to overview",
    backlink_list: "Show all documents in area",
    backlink_list_streamgraph: "Show all documents",
    backlink_list_streamgraph_stream_selected: "Show all documents in stream",
    keywords: "Keywords",
    doctypes: "Document type(s)",
    unknown: "Unknown",
    no_keywords: "not available",
    notAvailable: "not available",
    default_area: "No area title available",
    default_author: "",
    default_id: "defaultid",
    default_hash: "hashHash",
    default_abstract: "No abstract available",
    default_paper_title: "No title available",
    default_authors: "No authors available",
    default_published_in: "",
    // ? consider to remove it from here?
    // default_readers: 0,
    default_url: "",
    default_x: 1,
    default_y: 1,
    link: "link",
    default_year: "",
    embed_button_text: "Copy",
    copied_button_text: "Copied",
    sort_by_label: "sort by: ",
    comment_by_label: "by",
    pdf_not_loaded:
      "Sorry, we were not able to retrieve the PDF for this publication. You can get it directly from",
    pdf_not_loaded_linktext: "this website",
    share_button_title: "Share this visualization",
    share_button_title_sg: "Share this visualization",
    embed_title: "embed visualization",
    embed_button_title: "Embed this visualization on other websites",
    embed_button_title_sg: "Embed this visualization on other websites",
    embed_body_text:
      "You can use this code to embed the visualization on your own website or in a dashboard.",
    area_streamgraph: "Stream",
    stream_year: "Year",
    stream_doc_num: "Number of documents",
    stream_docs: "Documents",
    stream_total: "Total documents in stream",
    empty_area_warning:
      "No matches found. Please reset your filter options above.",
    lang_all: "All languages",
    cite: "Cite",
    filter_by_label: "show: ",
    cite_title_km: "Cite this visualization",
    cite_title_sg: "Cite this visualization",
    citation_template:
      "Open Knowledge Maps (${year}). ${type} for research on ${query}. Retrieved from ${source} [${date}].",
    cite_vis_km: "Please cite this knowledge map as follows",
    cite_vis_sg: "Please cite this streamgraph as follows",
    cite_paper: "Cite this document as",
    export_paper: "Export this document",
    download: "Download",
    please_note: "Please note",
    scale_by_label: "Scale map by: ",
    citation_warning:
      "we were not able to verify whether this citation is formatted correctly based on the metadata received. Please check before reuse.",
    location: "Location",
    location_fallback: "not available",
  },
  ger: {
    loading: "Wird geladen...",
    noDataAvailable: "Keine Daten verfügbar",
    showMore: "Mehr anzeigen",
    showLess: "Weniger anzeigen",
    search_placeholder: "Suche in der Liste...",
    intro_label: "Mehr Informationen",
    // TODO: consider to rename it?
    readers: "Leser",
    year: "Jahr",
    authors: "Autor",
    title: "Titel",
    default_title: 'Überblick über <span id="num_articles"></span> Artikel',
    overview_label: "Überblick über",
    streamgraph_label: "Streamgraph für",
    overview_authors_label: "Überblick über die Werke von",
    streamgraph_authors_label: "Streamgraph für die Werke von",
    geomap_label: "Geo Map für",
    custom_title_explanation:
      "Dieser Titel wurde manuell geändert. Die Original-Suche lautet:",
    most_recent_label: "neueste",
    most_relevant_label: "relevanteste",
    articles_label: "Artikel",
    source_label: "Quelle",
    resulttype_label: "Dokumentart",
    documenttypes_label: "Publikationsarten",
    documenttypes_tooltip:
      "Die folgenden Publikationsarten wurden bei der Erstellung dieser Visualisierung in Betracht gezogen (nicht alle davon scheinen notwendigerweise in dieser Visualisierung auch auf):",
    doctypes: "Dokumenttyp(en)",
    area: "Bereich",
    items: "Dokumente",
    backlink: "← Zurück zum Überblick",
    backlink_list: "← Zeige alle Dokumente des Bereichs",
    backlink_list_streamgraph: "← Zeige alle Dokumente an",
    backlink_list_streamgraph_stream_selected:
      "← Zeige alle Dokumente des Streams an",
    keywords: "Schlagwörter",
    no_keywords: "nicht vorhanden",
    notAvailable: "nicht vorhanden",
    default_area: "Kein Bereichstitel verfügba",
    default_author: "",
    default_id: "defaultid",
    default_hash: "hashHash",
    default_abstract: "Kein Abstract vorhanden",
    default_paper_title: "Kein Titel",
    default_published_in: "",
    // default_readers: 0,
    default_url: "",
    default_x: 1,
    default_y: 1,
    default_year: "",
    embed_title: "Visualisierung einbetten",
    sort_by_label: "sortieren: ",
    relevance: "Relevanz",
    link: "Link",
    filter_by_label: "anzeigen: ",
    comment_by_label: "von",
    share_button_title: "Visualisierung teilen",
    share_button_title_sg: "Visualisierung teilen",
    embed_button_title: "Visualisierung auf einer anderen Seite einbetten",
    embed_button_title_sg: "Visualisierung auf einer anderen Seite einbetten",
    embed_button_text: "Kopieren",
    copied_button_text: "Kopiert",
    embed_body_text:
      "Sie können diesen Code verwenden, um die Visualisierung auf anderen Seiten einzubetten.",
    pdf_not_loaded:
      "Leider konnten wir das PDF nicht abrufen. Mehr Informationen finden Sie auf",
    pdf_not_loaded_linktext: "dieser Seite",
    area_streamgraph: "Schlagwort",
    stream_year: "Jahr",
    stream_doc_num: "Anzahl Dokumente",
    stream_docs: "Dokumente",
    stream_total: "Gesamt",
    empty_area_warning:
      "Keine Dokumente gefunden. Setzen Sie bitte Ihre Filtereinstellungen zurück.",
    cite: "Cite",
    cite_title_km: "Zitieren Sie diese Wissenskarte",
    cite_title_sg: "Cite this visualization",
    citation_template:
      "Open Knowledge Maps (${year}). ${type} for research on ${query}. Retrieved from ${source} [${date}].",
    cite_vis_km: "Please cite this knowledge map as follows",
    cite_vis_sg: "Please cite this streamgraph as follows",
    cite_paper: "Cite this document as",
    export_paper: "Export this document",
    download: "Download",
    please_note: "Please note",
    citation_warning:
      "we were not able to verify whether this citation is formatted correctly based on the metadata received. Please check before reuse.",
    lang_all: "Alle Sprachen",
    scale_by_label: "Skalierung: ",
    default_authors: "No authors available",
    location: "Standort",
    location_fallback: "nicht verfügbar",
  },
  ger_linkedcat: {
    year: "Jahr",
    authors: "Autor",
    title: "Titel",
    default_title: 'Knowledge Map für <span id="num_articles"></span> Artikel',
    overview_label: "Knowledge Map für",
    streamgraph_label: "Streamgraph für",
    overview_authors_label: "Knowledge Map für die Werke von",
    streamgraph_authors_label: "Streamgraph für die Werke von",
    articles_label: "open access Dokumente",
    documenttypes_label: "Dokumentarten",
    bio_link: "Biografie",
    area: "Bereich",
    items: "Dokumente",
    backlink: "← Zurück zum Überblick",
    backlink_list: "Zeige alle Dokumente des Bereichs",
    backlink_list_streamgraph: "Zeige alle Dokumente an",
    backlink_list_streamgraph_stream_selected:
      "Zeige alle Dokumente des Streams an",
    basic_classification: "Basisklassifikation",
    relevance: "Relevanz",
    pdf_load_text:
      "Dieser Vorgang kann mehrere Minuten dauern, da die gescannten Texte sehr umfangreich sein können. Bitte haben Sie etwas Geduld.",
  },
  eng_plos: {
    readers: "views",
    year: "date",
    authors: "authors",
    title: "title",
    items: "items",
    backlink: "← Back to overview",
    backlink_list: "Show all documents in area",
    unknown: "Unknown",
    custom_title_explanation:
      "This is a custom title. Please see the info button for more information. Original query:",
    resulttype_label: "Article type",
    documenttypes_label: "Article types",
  },
  eng_pubmed: {
    loading: "Loading knowledge map.",
    relevance: "relevance",
    readers: "citations",
    year: "year",
    authors: "authors",
    title: "title",
    backlink: "← Back to overview",
    backlink_list: "← Show all documents",
    backlink_list_streamgraph: "← Show all documents",
    backlink_list_streamgraph_stream_selected: "← Show all documents in stream",
    unknown: "Unknown",
    streamgraph_label: "Streamgraph of",
    overview_authors_label: "Overview of the works of",
    streamgraph_authors_label: "Streamgraph of the works of",
    custom_title_explanation:
      "This is a custom title. Please see the info button for more information. Original query:",
    most_relevant_tooltip:
      "To determine the most relevant documents, we use the relevance ranking provided by the data source e.g. BASE. Data sources mainly use text similarity between your query and the article metadata to determine the relevance ranking. Please consult the FAQs for more information.",
    documenttypes_label: "Document types",
    all: "any",
    open_access: "Open Access",
    items: "items",
    high_metadata_quality: "Data quality",
    high_metadata_quality_desc_base:
      "This visualization only includes documents with an abstract (min. 300 characters). High metadata quality significantly improves the quality of your visualization.",
    high_metadata_quality_desc_pubmed:
      "This visualization only includes documents with an abstract. High metadata quality significantly improves the quality of your visualization.",
    high_metadata_quality_desc_aquanavi:
      "This visualization only includes documents with an abstract (min. 300 characters). High metadata quality significantly improves the quality of your visualization.",
    low_metadata_quality: "Data quality",
    low_metadata_quality_desc_base:
      "This visualization includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your visualization.",
    low_metadata_quality_desc_pubmed:
      "This visualization includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your visualization.",
    low_metadata_quality_desc_aquanavi:
      "This visualization includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your visualization.",
    time_frame_context_sg:
      "Please note that we remove time intervals with only a few associated papers during the computation of your streamgraph to increase its readability. As a result the time on the x-axis may not align with the time range you selected.",
    // metrics
    citations_count_label: "citations",
    social_media_count_label: "social media mentions",
    references_count_label: "references outside academia",
    citations: "citations",
    social: "social media mentions",
    references: "references outside academia",
    metrics_label: "Metrics",
    researcher_details_label: "Researcher details",
    scale_by_explanation:
      "The size of the bubbles is relative to the number of documents related to them.",
    scale_label: {
      "content_based": "Documents",
      "citations": "Citations",
      "cited_by_accounts_count": "Social media mentions",
      "references": "References outside academia",
      "citation_count": "Citations",
      "cited_by_tweeters_count": "Tweets",
      "readers.mendeley": "Readers",
    },
  },
  eng_orcid: {
    loading: "Loading knowledge map.",
    relevance: "relevance",
    readers: "citations",
    year: "year",
    intro_label: "About the map",
    authors: "authors",
    title: "title",
    backlink: "← Back to overview",
    backlink_list: "Show all documents in area",
    backlink_list_streamgraph: "Show all documents",
    backlink_list_streamgraph_stream_selected: "Show all documents in stream",
    unknown: "Unknown",
    streamgraph_label: "Streamgraph of",
    overview_authors_label: "Knowledge map for the works of",
    streamgraph_authors_label: "Streamgraph for the works of",
    custom_title_explanation:
      "This is a custom title. Please see the info button for more information. Original query:",
    most_relevant_tooltip:
      "To determine the most relevant documents, we use the relevance ranking provided by the data source e.g. BASE. Data sources mainly use text similarity between your query and the article metadata to determine the relevance ranking. Please consult the FAQs for more information.",
    documenttypes_label: "Document types",
    all: "any",
    open_access: "Open Access",
    items: "items",
    high_metadata_quality: "Data quality",
    high_metadata_quality_desc_base:
      "This visualization only includes documents with an abstract (min. 300 characters). High metadata quality significantly improves the quality of your visualization.",
    high_metadata_quality_desc_pubmed:
      "This visualization only includes documents with an abstract. High metadata quality significantly improves the quality of your visualization.",
    low_metadata_quality: "Data quality",
    low_metadata_quality_desc_base:
      "This visualization includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your visualization. ",
    low_metadata_quality_desc_pubmed:
      "This visualization includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your visualization. ",
    time_frame_context_sg:
      "Please note that we remove time intervals with only a few associated papers during the computation of your streamgraph to increase its readability. As a result the time on the x-axis may not align with the time range you selected.",
    // metrics
    citations_count_label: "citations",
    social_media_count_label: "social media mentions",
    references_count_label: "references outside academia",
    citations: "citations",
    social: "social media mentions",
    references: "references outside academia",
    metrics_label: "Metrics",
    researcher_details_label: "Researcher details",
    scale_by_explanation:
      "The size of the bubbles is relative to the number of documents related to them.",
    scale_label: {
      "content_based": "Documents",
      "citations": "Citations",
      "cited_by_accounts_count": "Social media mentions",
      "references": "References outside academia",
      "citation_count": "Citations",
      "cited_by_tweeters_count": "Tweets",
      "readers.mendeley": "Readers",
    },
  },
  eng_openaire: {
    relevance: "relevance",
    readers: "readers",
    tweets: "tweets",
    year: "year",
    authors: "authors",
    citations: "citations",
    title: "title",
    backlink: "← Back to overview",
    backlink_list: "Show all documents in area",
    unknown: "Unknown",
    documenttypes_label: "Article types",
    dataset_count_label: "datasets",
    paper_count_label: "papers",
    viper_edit_title: "How to add project resources",
    viper_edit_desc_label: `<p>Are you missing relevant publications and datasets related to this project? \
        <p>No problem: simply link further resources on the OpenAIRE website. \
        The resources will then be be automatically added to the map. \
        <p>Use the button indicated in the exemplary screenshot to do so: `,
    viper_button_desc_label: `<p>By clicking on the button below, you are redirected to the\
            OpenAIRE page for`,
    viper_edit_button_text: "continue to openaire",
    tweets_count_label: " tweets",
    citations_count_label: " citations (Crossref)",
    all: "any",
    open_access: "Open Access",
    publication: "papers",
    dataset: "datasets",
    items: "items",
    // citations_count_label: "citations",
    social_media_count_label: " social media mentions",
    references_count_label: "references outside academia",
  },
};
