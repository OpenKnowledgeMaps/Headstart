import { connect } from "react-redux";

import { capitalize } from "../utils/string";

import SortDropdownTemplate from "../templates/filtersort/SortDropdown";
import { sort } from "../actions";

const mapStateToProps = (state) => ({
  value: state.list.sortValue,
  valueLabel: capitalize(state.localization[state.list.sortValue]),
  options: state.list.sortOptions.map((id) => ({
    id,
    label: capitalize(state.localization[id]),
  })),
  label: state.localization.sort_by_label,
});

const mapDispatchToProps = (dispatch) => ({
  handleChange: (id) => {
    // TODO remove warn
    console.warn("*** React element 'List' sort event triggered ***");
    dispatch(sort(id));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SortDropdownTemplate);
