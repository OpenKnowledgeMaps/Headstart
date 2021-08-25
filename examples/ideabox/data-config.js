var data_config = {
  tag: "visualization",
  mode: "gsheets",

  bubble_min_scale: 1.1,
  bubble_max_scale: 1.1,

  paper_min_scale: 1,

  input_format: "json",
  use_area_uri: true,
  preview_type: "pdf",
  use_hypothesis: true,

  show_multiples: false,
  show_dropdown: false,
  show_intro: false,
  show_list: true,
  is_force_papers: true,
  is_title_clickable: false,
  show_infolink: true,
  show_infolink_areas: false,

  show_context: true,
  create_title_from_context: true,
  show_context_timestamp: true,
  show_loading_screen: true,

  scale_toolbar: false,

  content_based: true,
  is_evaluation: true,
  evaluation_service: ["matomo"],

  is_force_areas: true,
  area_force_alpha: 0.03,
  papers_force_alpha: 0.2,

  language: "de_ideabox",

  sort_options: ["year", "title", "area"],
  filter_options: [
    "all",
    "Statement",
    "Frage",
    "Herausforderung",
  ],
  filter_field: "resulttype",

  show_keywords: true,
  hide_keywords_overview: false,
  show_tags: true,
  show_comments: true,
  show_resulttype: true,

  sort_menu_dropdown: true,
  filter_menu_dropdown: true,

  share_modal: false,
  //hashtags_twitter_card: "okmaps",
  
  credit_embed: true,
  canonical_url: "https://openknowledgemaps.org",

  localization: {
    de_ideabox: {
      // [Updating and retrieving map. This may take a few seconds, please hold on.]
      loading: "Wird geladen...",
      search_placeholder: "Suche in der Liste...",
      show_list: "Liste ausklappen",
      hide_list: "Liste einklappen",
      intro_label: "(mehr Informationen)",
      intro_icon: "",
      // [relevance]
      relevance: "Relevanz",
      // [citations]
      readers: "Leser",
      // [date]
      year: "Datum",
      authors: "Autor",
      title: "Titel",
      area: "Bereich",
      backlink: "← Zurück zum Überblick",
      backlink_list: "← Zeige alle Dokumente des Bereichs",
      keywords: "Kategorie",
      no_keywords: "nicht vorhanden",
      no_title: "Kein Titel",
      overview_label: "Überblick über",
      overview_authors_label: "Überblick über die Werke von",
      articles_label: "Ideen",
      most_recent_label: "neueste",
      most_relevant_label: "relevanteste",
      // [To determine the most relevant documents, we use the relevance ranking provided by the source - either BASE or PubMed. Both sources compute the text similarity between your query and the article metadata to establish the relevance ranking. Please consult the FAQ for more information.]
      most_relevant_tooltip: "missing 'most_relevant_tooltip'",
      source_label: "Datenquelle",
      resulttype_label: "Typ",
      documenttypes_label: "Publikationsarten",
      // [Last updated]
      timestamp_label: "Letzte Aktualisierung",
      documenttypes_tooltip:
        "Die folgenden Publikationsarten wurden bei der Erstellung dieser Visualisierung in Betracht gezogen (nicht alle davon scheinen notwendigerweise in dieser Visualisierung auch auf):",
      default_area: "Kein Bereich",
      default_author: "",
      default_id: "defaultid",
      default_hash: "hashHash",
      default_abstract: "",
      default_published_in: "",
      default_readers: 0,
      default_url: "",
      default_x: 1,
      default_y: 1,
      default_year: "",
      sort_by_label: "sortieren:",
      // [show:]
      filter_by_label: "Zeige an: ",
      // [any]
      all: "alle",
      // [Open Access]
      open_access: "Open Access",
      // [Statement]
      Statement: "Statement",
      // [Frage]
      Frage: "Frage",
      // [Herausforderung]
      Herausforderung: "Herausforderung",
      link: "Eigene Idee einbringen",
      items: "Ideen",
      comment_by_label: "von",
      share_button_title: "Visualisierung teilen",
      embed_button_title: "Visualisierung auf einer anderen Seite einbetten",
      embed_button_text: "Kopieren",
      embed_title: "Visualisierung einbetten",
      embed_body_text:
        "Sie können diesen Code verwenden, um die Visualisierung auf anderen Seiten einzubetten.",
      empty_area_warning:
        "Keine Ideen gefunden. Setzen Sie bitte Ihre Filtereinstellungen zurück.",
      update_available: "Es gibt ein Update!",
      reload_now: "Jetzt laden",
      reload_or: "oder",
      do_it_later: "später",
    },
  },
};
