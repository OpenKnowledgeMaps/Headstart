import { Config } from "../@types/config";
import { Context } from "../@types/context";

const list = (
  state = {
    show: true,
    searchValue: "",
    showFilter: false,
    filterField: null,
    filterValue: null,
    filterOptions: [],
    sortValue: null,
    defaultSort: null,
    sortOptions: [],
    showDocumentType: false,
    showMetrics: false,
    isContentBased: false,
    baseUnit: null,
    showKeywords: false,
    hideUnselectedKeywords: true,
    height: null,
    citePapers: false,
    exportPapers: false,
  },
  action: any
) => {
  if (action.canceled) {
    return state;
  }

  const { contextObject: context } = action;
  const config = action.configObject as Config;

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        show: !!config.show_list,
        showFilter: config.filter_menu_dropdown,
        filterField: config.filter_field,
        filterValue: config.filter_options ? config.filter_options[0] : null,
        filterOptions: config.filter_options,
        sortValue: getSortValue(config, context),
        defaultSort: getSortValue(config, context),
        sortOptions: config.sort_options,
        showDocumentType: config.show_resulttype,
        showMetrics: config.metric_list,
        isContentBased: config.content_based,
        baseUnit: config.base_unit,
        showKeywords: config.show_keywords,
        hideUnselectedKeywords: config.hide_keywords_overview,
        disableClicks: !config.render_map,
        height: action.listHeight,
        citePapers: config.cite_papers,
        noCitationDoctypes: Array.isArray(config.no_citation_doctypes)
          ? config.no_citation_doctypes
          : [],
        exportPapers: config.export_papers,
      };
    case "TOGGLE_LIST":
      return {
        ...state,
        show: !state.show,
      };
    case "SELECT_PAPER":
    case "SHOW_LIST":
      return {
        ...state,
        show: true,
      };
    case "ZOOM_IN": {
      if (!action.selectedPaperData) {
        return state;
      }

      return {
        ...state,
        show: true,
      };
    }
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
      return state;
    // TODO enable this once the scaling is refactored properly
    // return {
    //   ...state,
    //   sortValue: state.sortOptions.includes(action.sort)
    //     ? action.sort
    //     : state.defaultSort,
    //   baseUnit: action.baseUnit,
    // };
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

const getSortValue = (config: Config, context: Context) => {
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
