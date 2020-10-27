import { connect } from "react-redux";

import { capitalize } from "../utils/string";

import FilterDropdownTemplate from "../templates/filtersort/FilterDropdown";
import { filter } from "../actions";

const mapStateToProps = (state) => ({
  value: state.list.filterValue,
  valueLabel: capitalize(state.localization[state.list.filterValue]),
  options: state.list.filterOptions.map((id) => ({
    id,
    label: capitalize(state.localization[id]),
  })),
  label: state.localization.filter_by_label,
});

const mapDispatchToProps = (dispatch) => ({
  handleChange: (id) => {
    // TODO remove warn
    console.warn("*** React element 'List' filter event triggered ***");
    dispatch(filter(id));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterDropdownTemplate);
