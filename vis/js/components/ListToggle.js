import { connect } from "react-redux";

import ListToggleTemplate from "../templates/ListToggle";
import { toggleList } from "../actions";

// no logic required

const mapStateToProps = (state) => {
  return {
    toggleLabel: state.list.show
      ? state.localization.hide_list
      : state.localization.show_list,
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
