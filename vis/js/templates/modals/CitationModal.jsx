import React from "react";
import { connect } from "react-redux";

import { Modal } from "react-bootstrap";
import { closeCitationModal } from "../../actions";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import { getDateFromTimestamp } from "../../utils/dates";
import { formatString, removeEmbedParam } from "../../utils/string";
import CopyButton from "../CopyButton";
import useMatomo from "../../utils/useMatomo";
import { queryConcatenator } from "../../utils/data";
import {unescapeHTML} from "../../utils/unescapeHTMLentities.js";

const CitationModal = ({
  open,
  onClose,
  isStreamgraph,
  query,
  customTitle,
  timestamp,
  q_advanced,
                         titleStyle,
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
    customQuery = customQuery.substr(0, 100) + "[..]";
  }
  if (customTitle) {
    customQuery = unescapeHTML(customTitle);
  }

  const date = getDateFromTimestamp(timestamp);

  let citationText = formatString(loc.citation_template, {
    year: new Date().getFullYear(),
    type: isStreamgraph ? "Streamgraph" : "Knowledge Map",
    query: customQuery,
    source: removeEmbedParam(window.location.href),
    date,
  });

  if (!date) {
    citationText = citationText.replace(" [].", ".");
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
          {isStreamgraph ? loc.cite_title_sg : loc.cite_title_km}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="cite-body" className="modal-body">
        <p>{isStreamgraph ? loc.cite_vis_sg : loc.cite_vis_km}:</p>
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
