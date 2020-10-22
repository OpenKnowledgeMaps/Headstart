const list = (
  state = {
    show: true,
    docsNumber: 0,
    searchValue: "",
    showFilter: false,
    filterValue: null,
    filterOptions: [],
    showDropdownSort: true,
    sortValue: null,
    sortOptions: [],
  },
  action
) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        show: !!action.configObject.show_list,
        // TODO init number of all documents
        showFilter: action.configObject.filter_menu_dropdown,
        filterValue: action.configObject.filter_options
          ? action.configObject.filter_options[0]
          : null,
        filterOptions: action.configObject.filter_options,
        showDropdownSort: action.configObject.sort_menu_dropdown,
        sortValue: action.configObject.sort_options
          ? action.configObject.sort_options[0]
          : null,
        sortOptions: action.configObject.sort_options,
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
    case "SET_ITEMS_COUNT":
      return {
        ...state,
        docsNumber: action.count,
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
