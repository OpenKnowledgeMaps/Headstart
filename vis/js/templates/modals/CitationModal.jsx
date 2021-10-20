import React from "react";
import { connect } from "react-redux";

import { Modal, Button } from "react-bootstrap";
import { closeCitationModal } from "../../actions";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import { getDateFromTimestamp } from "../../utils/dates";
import { formatString } from "../../utils/string";

const CitationModal = ({
  open,
  onClose,
  isStreamgraph,
  query,
  customTitle,
  timestamp,
}) => {
  const loc = useLocalizationContext();

  let customQuery = query;
  if (customQuery.length > 100) {
    customQuery = customQuery.substr(0, 100) + "[..]";
  }
  if (customTitle) {
    customQuery = customTitle;
  }

  const date = getDateFromTimestamp(timestamp);

  let citationText = formatString(loc.citation_template, {
    year: new Date().getFullYear(),
    query: customQuery,
    source: window.location.href,
    date,
  });

  if (!date) {
    citationText = citationText.replace(" [].", ".");
  }

  const handleCopyClick = (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(citationText);
    return false;
  };

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
        <div className="citation">{citationText}</div>
        <Button bsStyle="primary" id="cite-button" onClick={handleCopyClick}>
          {loc.embed_button_text}
        </Button>
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
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeCitationModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitationModal);
