// @ts-nocheck

import { connect } from "react-redux";

import SearchBoxTemplate from "../../templates/filtersort/SearchBox";
import { search } from "../../actions";

const mapStateToProps = (state) => ({
  value: state.list.searchValue,
  placeholder: state.localization.search_placeholder,
});

const mapDispatchToProps = (dispatch) => ({
  handleChange: (text) => dispatch(search(text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBoxTemplate);
