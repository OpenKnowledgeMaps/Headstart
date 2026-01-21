import { connect } from "react-redux";
import { capitalize } from "../../utils/string";
import { filter } from "../../actions";
import { Dispatch } from "redux";
import { State } from "../../types";
import FilterDropdownTemplate, {
  FilterDropdownProps,
} from "../../templates/filtersort/FilterDropdown";

const mapStateToProps = (
  state: State,
): Omit<FilterDropdownProps, "handleChange"> => ({
  value: state.list.filterValue,
  valueLabel: capitalize(state.localization[state.list.filterValue]),
  options: state.list.filterOptions.map((id) => ({
    id,
    label: capitalize(state.localization[id]),
  })),
  label: state.localization.filter_by_label,
});

const mapDispatchToProps = (
  dispatch: Dispatch,
): Pick<FilterDropdownProps, "handleChange"> => ({
  handleChange: (id) => dispatch(filter(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FilterDropdownTemplate);
