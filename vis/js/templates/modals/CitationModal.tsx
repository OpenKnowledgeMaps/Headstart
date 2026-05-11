// @ts-nocheck

import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

import { closeCitationModal } from "../../actions";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { GEOMAP_MODE, STREAMGRAPH_MODE } from "../../reducers/chartType";
import { queryConcatenator } from "../../utils/data";
import { getDateFromTimestamp } from "../../utils/dates";
import { formatString, removeEmbedParam } from "../../utils/string";
import { unescapeHTML } from "../../utils/unescapeHTMLentities";
import useMatomo from "../../utils/useMatomo";
import CopyButton from "../CopyButton";

const CitationModal = ({
  open,
  onClose,
  isStreamgraph,
  isGeomap,
  query,
  customTitle,
  timestamp,
  q_advanced
}) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const trackCopyClick = () => {
    trackEvent(
      "Added components",
      "Copy map citation",
      "Copy map citation button"
    );
  };

  let customQuery = queryConcatenator([query, q_advanced]);
  if (customQuery.length > 100) {
    customQuery = `${customQuery.substr(0, 100)}[..]`;
  }
  if (customTitle) {
    customQuery = unescapeHTML(customTitle);
  }

  const date = getDateFromTimestamp(timestamp);
  const year = new Date().getFullYear();
  const link = removeEmbedParam(window.location.href);

  let citeModalTitle: string;
  let citeModalInstruction: string;
  if (isGeomap) {
    citeModalTitle = loc.cite_title_geomap;
    citeModalInstruction = loc.cite_vis_geomap;
  } else if (isStreamgraph) {
    citeModalTitle = loc.cite_title_sg;
    citeModalInstruction = loc.cite_vis_sg;
  } else {
    citeModalTitle = loc.cite_title_km;
    citeModalInstruction = loc.cite_vis_km;
  }

  let citationText;
  if (isGeomap) {
    citationText = `Open Knowledge Maps ${year}. Geo Map of ${customQuery}. Retrieved from ${link}.`;
  } else {
    citationText = formatString(loc.citation_template, {
      year,
      type: isStreamgraph ? "Streamgraph" : "Knowledge Map",
      query: customQuery,
      source: link,
      date,
    });

    if (!date) {
      citationText = citationText.replace(" [].", ".");
    }
  }

  return (
    // html template starts here
    <Modal id="cite_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="cite-title"
          className="cite-modal-title"
          style={{ fontSize: 20 }}
        >
          {citeModalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="cite-body" className="modal-body">
        <p>{`${citeModalInstruction}:`}</p>
        <div id="copy-map-citation" className="citation">
          {citationText}
        </div>
        <CopyButton
          className="indented-modal-btn"
          textId={"copy-map-citation"}
          textContent={open ? citationText : ""}
          onClick={trackCopyClick}
        />
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  open: state.modals.openCitationModal,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  isGeomap: state.chartType === GEOMAP_MODE,
  query: state.query.text,
  customTitle:
      state.heading.titleStyle === "custom" ? state.heading.customTitle : null,
  timestamp: state.misc.timestamp,
  q_advanced: state.q_advanced.text,
  titleStyle: state.heading.titleStyle
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeCitationModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitationModal);
