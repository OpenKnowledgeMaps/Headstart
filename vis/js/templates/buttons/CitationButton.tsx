// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import { openCitationModal } from "../../actions";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { GEOMAP_MODE, STREAMGRAPH_MODE } from "../../reducers/chartType";
import useMatomo from "../../utils/useMatomo";

const CitationButton = ({
  isGeomap,
  isStreamgraph,
  onClick,
}: {
  isGeomap: boolean;
  isStreamgraph: boolean;
  onClick: () => void;
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    onClick();
    trackEvent("Added components", "Open cite modal", "Cite button");
  };

  let citeButtonTitle: string;
  if (isGeomap) {
    citeButtonTitle = localization.cite_title_geomap;
  } else if (isStreamgraph) {
    citeButtonTitle = localization.cite_title_sg;
  } else {
    citeButtonTitle = localization.cite_title_km;
  }

  return (
    // html template starts here
    <div>
      <button
        className="btn btn-primary"
        title={citeButtonTitle}
        onClick={handleClick}
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
  isGeomap: state.chartType === GEOMAP_MODE,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openCitationModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitationButton);
