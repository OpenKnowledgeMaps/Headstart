import { connect } from "react-redux";

import SortButtonsTemplate from "../../templates/filtersort/SortButtons";
import { sort } from "../../actions";

const mapStateToProps = (state) => ({
  value: state.list.sortValue,
  options: state.list.sortOptions.map((id) => ({
    id,
    label: state.localization[id],
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
)(SortButtonsTemplate);
