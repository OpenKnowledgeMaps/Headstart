import { connect } from "react-redux";

import ListToggleTemplate from "../templates/ListToggle";
import { toggleList } from "../actions";

import { filterData } from "../utils/data";

import { STREAMGRAPH_MODE } from "../reducers/chartType";

// no logic required

const mapStateToProps = (state) => {
  // TODO remove this duplicity once the whole list is refactored
  let displayedData = filterData(
    state.data,
    {
      value: state.list.searchValue,
    },
    {
      value: state.list.filterValue,
      field: state.list.filterField,
      zoomed: state.zoom,
      area: state.selectedBubble ? state.selectedBubble.uri : null,
      paper: state.selectedPaper ? state.selectedPaper.safeId : null,
      isStreamgraph: state.chartType === STREAMGRAPH_MODE,
      title: state.selectedBubble ? state.selectedBubble.title : null,
    }
  );

  return {
    toggleLabel: state.list.show
      ? state.localization.hide_list
      : state.localization.show_list,
    docsNumber: displayedData.length,
    docsNumberLabel: state.localization.items,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onClick: () => {
    // TODO remove warn
    console.warn("*** React element 'List' click event triggered ***");
    dispatch(toggleList());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ListToggleTemplate);
