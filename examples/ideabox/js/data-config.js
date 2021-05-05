var data_config = {
  tag: "visualization",
  mode: "gsheets",
  service_name:
    '<span class="backlink"><a href="data" class="underline" target="_blank" >CoVis database</a></span>',
  persistence_backend: "api",

  bubble_min_scale: 1.1,
  bubble_max_scale: 1.1,

  paper_min_scale: 1,

  // title: "Knowledge map of <b>COVID-19 research</b>",
  input_format: "json",
  base_unit: "questions",
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
    "Dataset",
    "Journal Article",
    "Preprint",
    "ReFigure",
    "Review",
  ],
  filter_field: "resulttype",

  show_keywords: true,
  hide_keywords_overview: false,
  show_tags: true,
  show_comments: true,
  show_resulttype: true,

  sort_menu_dropdown: true,
  filter_menu_dropdown: true,

  share_modal: true,
  hashtags_twitter_card: "COVID19,openscience,discovery",

  intro: {
    title: "Knowledge Map of COVID-19 research curated by experts",
    body:
      "<h3>About Covis</h3><p>CoVis provides a curated knowledge map of seminal works on COVID-19 from eight critical areas of biomedical research. This collection is not meant to be exhaustive, but rather a single reference point for definitive research in key areas of coronavirus and COVID-19 research. CoVis makes it easier to get started on the topic - but also helps you to stay up-to-date. The knowledge map is constantly evolving thanks to the collective editing of subject-matter experts.</p><p><a class='link-popup' href='faqs'>Read our FAQs to find out more</a>.</p><h3>Data Source curated by ReFigure</h3><p>The articles, datasets and ReFigures in CoVis are curated by an editorial team led by immunologists and ReFigure founders Dr. Girija Goyal and Dr. James Akin. Given the fast pace of research and the limited historical data on COVID-19, many findings are under debate and only understandable after reading several reports from different sources. Team <a target='_blank' class='link-popup' href='https://refigure.org/'>ReFigure</a> creates visual, easy to understand, annotated, figure collections which provide analyses and consensus on key issues.</p><p>Find out more about the curation process and the methodology for paper inclusion <a class='link-popup' href='faqs#methodology'>in our FAQs</a>. We invite subject-matter experts to help us with our efforts. If you would like to contribute to CoVis, please <a class='link-popup' href='contact-us'>get in touch</a>.</p><h3>Software created by Open Knowledge Maps</h3><p>The resources selected for inclusion in CoVis are visualized in a knowledge map. Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to each area. This makes it possible to easily identify useful, pertinent information. The knowledge map is based on award-winning software <a target='_blank' class='link-popup' href='https://openknowledgemaps.org/'>developed by Open Knowledge Maps</a>.</p><p>In the knowledge map, research areas are displayed as bubbles. By clicking on one of the bubbles, you can inspect the resources assigned to it; open access papers can be directly viewed and downloaded within the interface. Find out more about knowledge maps and their properties <a class='link-popup' href='faqs#knowledge-map'>in our FAQs</a>.</p>",
  },

  localization: {
    de_ideabox: {
      // [Updating and retrieving map. This may take a few seconds, please hold on.]
      loading: "Wird geladen...",
      search_placeholder: "Suche in der Liste...",
      show_list: "Liste ausklappen",
      hide_list: "Liste einklappen",
      intro_label: "",
      intro_icon: "&#xf05a;",
      // [relevance]
      relevance: "missing 'relevance'",
      // [citations]
      readers: "Leser",
      // [date]
      year: "Jahr",
      authors: "Autor",
      title: "Titel",
      area: "Bereich",
      backlink: "← Zurück zum Überblick",
      backlink_list: "← Zeige alle Dokumente des Bereichs",
      keywords: "Schlagwörter",
      no_keywords: "nicht vorhanden",
      no_title: "Kein Titel",
      overview_label: "Überblick über",
      overview_authors_label: "Überblick über die Werke von",
      articles_label: "Artikel",
      most_recent_label: "neueste",
      most_relevant_label: "relevanteste",
      // [To determine the most relevant documents, we use the relevance ranking provided by the source - either BASE or PubMed. Both sources compute the text similarity between your query and the article metadata to establish the relevance ranking. Please consult the FAQ for more information.]
      most_relevant_tooltip: "missing 'most_relevant_tooltip'",
      source_label: "Quelle",
      resulttype_label: "Typ",
      documenttypes_label: "Publikationsarten",
      // [Last updated]
      timestamp_label: "missing 'timestamp_label'",
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
      filter_by_label: "missing 'filter_by_label'",
      // [any]
      all: "missing 'all'",
      // [Open Access]
      open_access: "missing 'open_access'",
      // [Dataset]
      Dataset: "missing 'Dataset'",
      // [Journal Article]
      "Journal Article": "missing 'Journal article'",
      // [List]
      List: "missing 'List'",
      // [Preprint]
      Preprint: "missing 'Preprint'",
      // [ReFigure]
      ReFigure: "missing 'ReFigure'",
      // [Review]
      Review: "missing 'Review'",
      link: "Eigene Idee Einbringen",
      items: "Dokumente",
      comment_by_label: "von",
      share_button_title: "Visualisierung teilen",
      embed_button_title: "Visualisierung auf einer anderen Seite einbetten",
      embed_button_text: "Kopieren",
      embed_title: "Visualisierung einbetten",
      embed_body_text:
        "Sie können diesen Code verwenden, um die Visualisierung auf anderen Seiten einzubetten.",
      empty_area_warning:
        "Keine Dokumente gefunden. Setzen Sie bitte Ihre Filtereinstellungen zurück.",
    },
  },
};
