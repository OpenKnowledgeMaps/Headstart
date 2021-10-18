import React from "react";
import { connect } from "react-redux";

import { openCitationModal } from "../../actions";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";

const CitationButton = ({ isStreamgraph, onClick }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div>
      <button
        className="btn btn-primary"
        title={
          isStreamgraph
            ? localization.cite_title_sg
            : localization.cite_title_km
        }
        onClick={onClick}
      >
        <span id="citationlink">
          <i className="fa fa-quote-right fa-fw" aria-hidden="true"></i>{" "}
          {localization.cite}
        </span>
      </button>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openCitationModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitationButton);
