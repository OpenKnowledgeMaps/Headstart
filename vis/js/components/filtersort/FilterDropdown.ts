import { connect } from "react-redux";

import { capitalize } from "../../utils/string";

import FilterDropdownTemplate, { FilterDropdownProps } from "../../templates/filtersort/FilterDropdown";
import { filter } from "../../actions";

const mapStateToProps = (state: any): Omit<FilterDropdownProps, 'handleChange'> => ({
  value: state.list.filterValue,
  valueLabel: capitalize(state.localization[state.list.filterValue]),
  options: state.list.filterOptions.map((id: string) => ({
    id,
    label: capitalize(state.localization[id]),
  })),
  label: state.localization.filter_by_label,
});

const mapDispatchToProps = (dispatch: any): Pick<FilterDropdownProps, 'handleChange'> => ({
  handleChange: (id) => dispatch(filter(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterDropdownTemplate);
