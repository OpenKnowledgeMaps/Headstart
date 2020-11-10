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
  },
  action
) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        show: !!action.configObject.show_list,
        showFilter: action.configObject.filter_menu_dropdown,
        filterField: action.configObject.filter_field,
        filterValue: action.configObject.filter_options
          ? action.configObject.filter_options[0]
          : null,
        filterOptions: action.configObject.filter_options,
        showDropdownSort: action.configObject.sort_menu_dropdown,
        sortValue: action.configObject.sort_options
          ? action.configObject.sort_options[0]
          : null,
        sortOptions: action.configObject.sort_options,
        abstractSize: action.configObject.abstract_small,
        linkType: getLinkType(action.configObject, action.contextObject),
        showDocumentType: action.configObject.show_resulttype,
        showMetrics: action.configObject.metric_list,
        isContentBased: action.configObject.content_based,
        baseUnit: action.configObject.base_unit,
        showRealPreviewImage: action.configObject.preview_type == "image",
        showKeywords: action.configObject.show_keywords,
        hideUnselectedKeywords: action.configObject.hide_keywords_overview,
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
    default:
      return state;
  }
};

export default list;

const getLinkType = (config, context) => {
  if (config.doi_outlink) {
    return "doi";
  }

  if (config.url_outlink) {
    return "url";
  }

  return null;
};
