const list = (
  state = {
    show: true,
    searchValue: "",
    showFilter: false,
    filterField: null,
    filterValue: null,
    filterOptions: [],
    showDropdownSort: true,
    sortValue: null,
    defaultSort: null,
    sortOptions: [],
    abstractSize: 250,
    linkType: null,
    showDocumentType: false,
    showMetrics: false,
    isContentBased: false,
    baseUnit: null,
    showRealPreviewImage: false,
    showKeywords: false,
    hideUnselectedKeywords: true,
    height: null,
  },
  action
) => {
  if (action.canceled) {
    return state;
  }

  const { configObject: config, contextObject: context } = action;

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        show: !!config.show_list,
        showFilter: config.filter_menu_dropdown,
        filterField: config.filter_field,
        filterValue: config.filter_options ? config.filter_options[0] : null,
        filterOptions: config.filter_options,
        showDropdownSort: config.sort_menu_dropdown,
        sortValue: getSortValue(config, context),
        defaultSort: getSortValue(config, context),
        sortOptions: config.sort_options,
        abstractSize: config.abstract_small,
        linkType: getLinkType(config, context),
        showDocumentType: config.show_resulttype,
        showMetrics: config.metric_list,
        isContentBased: config.content_based,
        baseUnit: config.base_unit,
        showRealPreviewImage: config.preview_type == "image",
        showKeywords: config.show_keywords,
        hideUnselectedKeywords: config.hide_keywords_overview,
      };
    case "TOGGLE_LIST":
      return {
        ...state,
        show: !state.show,
      };
    case "SHOW_LIST":
      return {
        ...state,
        show: true,
      };
    case "SEARCH":
      return {
        ...state,
        searchValue: action.text,
      };
    case "FILTER":
      return {
        ...state,
        filterValue: action.id,
      };
    case "SORT":
      return {
        ...state,
        sortValue: action.id,
      };
    case "SCALE":
      return {
        ...state,
        sortValue: state.sortOptions.includes(action.sort)
          ? action.sort
          : state.defaultSort,
        baseUnit: action.baseUnit,
      };
    case "RESIZE":
      return {
        ...state,
        height: action.listHeight,
      };
    default:
      return state;
  }
};

export default list;

const getLinkType = (config, context) => {
  if (context.service === "gsheets") {
    return "covis";
  }

  if (config.doi_outlink) {
    return "doi";
  }

  if (config.url_outlink) {
    return "url";
  }

  return null;
};

const getSortValue = (config, context) => {
  if (!config.sort_options || config.sort_options.length === 0) {
    return null;
  }

  if (
    config.initial_sort &&
    config.sort_options.includes(config.initial_sort)
  ) {
    return config.initial_sort;
  }

  return config.sort_options[0];
};
