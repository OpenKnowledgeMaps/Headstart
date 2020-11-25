import { connect } from "react-redux";

import ListToggleTemplate from "../templates/ListToggle";
import { toggleList } from "../actions";

// no logic required

const mapStateToProps = (state) => ({
  show: state.list.show,
});

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(toggleList()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListToggleTemplate);
