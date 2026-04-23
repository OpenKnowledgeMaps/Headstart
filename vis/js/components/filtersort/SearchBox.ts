import { connect } from "react-redux";
import SearchBoxTemplate from "../../templates/filtersort/SearchBox";
import { search } from "../../actions";
import { Dispatch } from "redux";
import { State } from "../../types";

const mapStateToProps = (state: State) => ({
  value: state.list.searchValue,
  placeholder: state.localization.search_placeholder,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  handleChange: (text: string) => dispatch(search(text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBoxTemplate);
